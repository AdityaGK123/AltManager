/**
 * Database Migration Runner for Conversational Coaching System
 * Run this script to set up the new tables and badge definitions
 * 
 * Usage: node run-coaching-migration.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

async function runMigration() {
  console.log('\n🚀 Starting Conversational Coaching System Migration...\n');
  console.log('='.repeat(60));

  try {
    // Read migration file
    const migrationPath = join(__dirname, 'src', 'db', 'migrations', 'add_conversational_coaching_tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('📊 Connecting to database...');

    const client = await pool.connect();
    console.log('✅ Connected to database\n');

    try {
      // Start transaction
      await client.query('BEGIN');
      console.log('🔄 Starting transaction...\n');

      // Run migration
      console.log('📝 Creating tables and indexes...');
      await client.query(migrationSQL);
      console.log('✅ Tables created successfully\n');

      // Verify tables
      console.log('🔍 Verifying tables...');
      const tables = [
        'user_moment_feedback',
        'user_badges',
        'user_xp_tracking',
        'user_insight_timeline',
        'conversation_memory',
        'badge_definitions',
      ];

      for (const table of tables) {
        const result = await client.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )`,
          [table]
        );
        if (result.rows[0].exists) {
          console.log(`  ✅ ${table}`);
        } else {
          throw new Error(`Table ${table} was not created`);
        }
      }

      // Check badge definitions
      const badgeCount = await client.query('SELECT COUNT(*) FROM badge_definitions');
      console.log(`\n🏆 Badge definitions: ${badgeCount.rows[0].count} badges loaded`);

      // Initialize XP tracking for existing users
      console.log('\n👥 Initializing XP tracking for existing users...');
      const result = await client.query(`
        INSERT INTO user_xp_tracking (user_id, total_xp, current_level, xp_to_next_level, category_xp, streak_days)
        SELECT id, 0, 1, 100, '{}'::jsonb, 0
        FROM users
        WHERE id NOT IN (SELECT user_id FROM user_xp_tracking)
        RETURNING user_id
      `);
      console.log(`  ✅ Initialized XP tracking for ${result.rowCount} users`);

      // Commit transaction
      await client.query('COMMIT');
      console.log('\n✅ Transaction committed successfully');

      console.log('\n' + '='.repeat(60));
      console.log('🎉 Migration completed successfully!\n');
      console.log('📊 Summary:');
      console.log(`  - ${tables.length} tables created`);
      console.log(`  - ${badgeCount.rows[0].count} badge definitions loaded`);
      console.log(`  - ${result.rowCount} users initialized with XP tracking`);
      console.log('\n🚀 Conversational Coaching System is ready to use!');
      console.log('='.repeat(60) + '\n');

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('\n❌ Migration failed, rolling back...');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
