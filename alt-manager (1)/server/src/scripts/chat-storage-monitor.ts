/**
 * Chat Storage Monitor
 * 
 * Monitors database growth, query performance, and storage costs.
 * Run periodically to track metrics and send alerts.
 */

import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// MONITORING THRESHOLDS
// ============================================

const THRESHOLDS = {
  STORAGE_GROWTH_GB_PER_MONTH: 2,
  QUERY_LATENCY_P95_MS: 100,
  CACHE_HIT_RATE_PERCENT: 70,
  CONVERSATIONS_PER_USER_MAX: 100
};

// ============================================
// STORAGE MONITOR
// ============================================

class ChatStorageMonitor {
  /**
   * Main monitoring function
   */
  async run() {
    console.log('📊 Chat Storage Monitor\n');

    const metrics = {
      storage: await this.getStorageMetrics(),
      performance: await this.getPerformanceMetrics(),
      usage: await this.getUsageMetrics(),
      costs: await this.estimateCosts()
    };

    this.printReport(metrics);
    this.checkAlerts(metrics);
  }

  /**
   * Get storage metrics
   */
  private async getStorageMetrics() {
    console.log('📦 Storage Metrics');

    try {
      // Table sizes
      const tableSizes = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
          pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
        FROM pg_tables
        WHERE tablename IN ('conversations', 'messages')
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);

      // Index sizes
      const indexSizes = await db.execute(sql`
        SELECT 
          indexname,
          pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
        FROM pg_indexes
        WHERE tablename IN ('conversations', 'messages')
        ORDER BY pg_relation_size(indexname::regclass) DESC
      `);

      // Row counts
      const rowCounts = await db.execute(sql`
        SELECT 
          'conversations' as table_name,
          COUNT(*) as total_rows,
          COUNT(*) FILTER (WHERE archived_at IS NULL AND deleted_at IS NULL) as active_rows,
          COUNT(*) FILTER (WHERE archived_at IS NOT NULL) as archived_rows,
          COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_rows
        FROM conversations
        UNION ALL
        SELECT 
          'messages' as table_name,
          COUNT(*) as total_rows,
          COUNT(*) FILTER (WHERE archived_at IS NULL) as active_rows,
          COUNT(*) FILTER (WHERE archived_at IS NOT NULL) as archived_rows,
          0 as deleted_rows
        FROM messages
      `);

      console.log('\n  Table Sizes:');
      tableSizes.rows.forEach(row => {
        console.log(`    ${row.tablename}: ${row.size}`);
      });

      console.log('\n  Row Counts:');
      rowCounts.rows.forEach(row => {
        console.log(`    ${row.table_name}:`);
        console.log(`      Total: ${row.total_rows}`);
        console.log(`      Active: ${row.active_rows}`);
        console.log(`      Archived: ${row.archived_rows}`);
        if (Number(row.deleted_rows) > 0) {
          console.log(`      Deleted: ${row.deleted_rows}`);
        }
      });

      return {
        tables: tableSizes.rows,
        indexes: indexSizes.rows,
        rows: rowCounts.rows
      };
    } catch (error) {
      console.error('  ❌ Failed to get storage metrics:', error);
      return null;
    }
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics() {
    console.log('\n⚡ Performance Metrics');

    try {
      // Index usage
      const indexUsage = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes
        WHERE tablename IN ('conversations', 'messages')
        ORDER BY idx_scan DESC
        LIMIT 10
      `);

      // Table statistics
      const tableStats = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          seq_scan as sequential_scans,
          seq_tup_read as seq_tuples_read,
          idx_scan as index_scans,
          idx_tup_fetch as idx_tuples_fetched,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables
        WHERE tablename IN ('conversations', 'messages')
      `);

      console.log('\n  Top Indexes by Usage:');
      indexUsage.rows.slice(0, 5).forEach(row => {
        console.log(`    ${row.indexname}: ${row.scans} scans`);
      });

      console.log('\n  Table Operations:');
      tableStats.rows.forEach(row => {
        console.log(`    ${row.tablename}:`);
        console.log(`      Index scans: ${row.index_scans}`);
        console.log(`      Sequential scans: ${row.sequential_scans}`);
        console.log(`      Inserts: ${row.inserts}`);
      });

      return {
        indexes: indexUsage.rows,
        tables: tableStats.rows
      };
    } catch (error) {
      console.error('  ❌ Failed to get performance metrics:', error);
      return null;
    }
  }

  /**
   * Get usage metrics
   */
  private async getUsageMetrics() {
    console.log('\n👥 Usage Metrics');

    try {
      const usage = await db.execute(sql`
        SELECT 
          COUNT(DISTINCT user_id) as total_users,
          COUNT(*) as total_conversations,
          AVG(message_count) as avg_messages_per_conversation,
          MAX(message_count) as max_messages_per_conversation,
          SUM(message_count) as total_messages
        FROM conversations
        WHERE deleted_at IS NULL
      `);

      const userDistribution = await db.execute(sql`
        SELECT 
          user_id,
          COUNT(*) as conversation_count,
          SUM(message_count) as total_messages
        FROM conversations
        WHERE deleted_at IS NULL
        GROUP BY user_id
        ORDER BY conversation_count DESC
        LIMIT 10
      `);

      const stats = usage.rows[0];
      console.log(`\n  Total users: ${stats.total_users}`);
      console.log(`  Total conversations: ${stats.total_conversations}`);
      console.log(`  Total messages: ${stats.total_messages}`);
      console.log(`  Avg messages/conversation: ${parseFloat(String(stats.avg_messages_per_conversation)).toFixed(2)}`);
      console.log(`  Max messages/conversation: ${stats.max_messages_per_conversation}`);

      console.log('\n  Top 5 Users by Conversations:');
      userDistribution.rows.slice(0, 5).forEach((row, idx) => {
        console.log(`    ${idx + 1}. User ${row.user_id}: ${row.conversation_count} conversations, ${row.total_messages} messages`);
      });

      return {
        overall: stats,
        topUsers: userDistribution.rows
      };
    } catch (error) {
      console.error('  ❌ Failed to get usage metrics:', error);
      return null;
    }
  }

  /**
   * Estimate storage costs
   */
  private async estimateCosts() {
    console.log('\n💰 Cost Estimation (Neon PostgreSQL)');

    try {
      const storage = await db.execute(sql`
        SELECT 
          pg_database_size(current_database()) as total_bytes
      `);

      const totalBytes = parseInt(String(storage.rows[0].total_bytes));
      const totalGB = totalBytes / (1024 * 1024 * 1024);

      // Neon pricing (approximate)
      const STORAGE_COST_PER_GB = 0.25; // $0.25/GB/month
      const COMPUTE_COST_ESTIMATE = 10; // ~$10/month for basic usage

      const monthlyCost = (totalGB * STORAGE_COST_PER_GB) + COMPUTE_COST_ESTIMATE;
      const annualCost = monthlyCost * 12;

      console.log(`\n  Database size: ${totalGB.toFixed(2)} GB`);
      console.log(`  Storage cost: $${(totalGB * STORAGE_COST_PER_GB).toFixed(2)}/month`);
      console.log(`  Compute cost (est): $${COMPUTE_COST_ESTIMATE}/month`);
      console.log(`  Total monthly: $${monthlyCost.toFixed(2)}`);
      console.log(`  Total annual: $${annualCost.toFixed(2)}`);

      return {
        sizeGB: totalGB,
        monthlyCost,
        annualCost
      };
    } catch (error) {
      console.error('  ❌ Failed to estimate costs:', error);
      return null;
    }
  }

  /**
   * Check alert thresholds
   */
  private checkAlerts(metrics: any) {
    console.log('\n🚨 Alerts');

    const alerts: string[] = [];

    // Check storage growth
    if (metrics.costs && metrics.costs.sizeGB > THRESHOLDS.STORAGE_GROWTH_GB_PER_MONTH * 6) {
      alerts.push(`⚠️  High storage usage: ${metrics.costs.sizeGB.toFixed(2)} GB`);
    }

    // Check sequential scans (should use indexes)
    if (metrics.performance?.tables) {
      metrics.performance.tables.forEach((table: any) => {
        if (table.sequential_scans > table.index_scans) {
          alerts.push(`⚠️  ${table.tablename}: More sequential scans than index scans (consider adding indexes)`);
        }
      });
    }

    // Check user conversation limits
    if (metrics.usage?.topUsers) {
      metrics.usage.topUsers.forEach((user: any) => {
        if (user.conversation_count > THRESHOLDS.CONVERSATIONS_PER_USER_MAX) {
          alerts.push(`⚠️  User ${user.user_id}: ${user.conversation_count} conversations (limit: ${THRESHOLDS.CONVERSATIONS_PER_USER_MAX})`);
        }
      });
    }

    if (alerts.length === 0) {
      console.log('  ✅ All metrics within normal range');
    } else {
      alerts.forEach(alert => console.log(`  ${alert}`));
    }

    console.log('\n');
  }

  /**
   * Print summary report
   */
  private printReport(metrics: any) {
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    if (metrics.storage) {
      const totalSize = metrics.storage.tables.reduce((sum: number, t: any) => sum + parseInt(t.size_bytes), 0);
      console.log(`Total Storage: ${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`);
    }

    if (metrics.usage) {
      console.log(`Active Conversations: ${metrics.usage.overall.total_conversations}`);
      console.log(`Total Messages: ${metrics.usage.overall.total_messages}`);
    }

    if (metrics.costs) {
      console.log(`Estimated Monthly Cost: $${metrics.costs.monthlyCost.toFixed(2)}`);
    }

    console.log('='.repeat(60) + '\n');
  }
}

// ============================================
// EXECUTION
// ============================================

const monitor = new ChatStorageMonitor();
monitor.run();
