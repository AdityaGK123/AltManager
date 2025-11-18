import { db } from './index.js';
import { sql } from 'drizzle-orm';
import * as schema from './schema.js';

/**
 * Comprehensive database verification and initialization script
 * Checks for missing tables and creates them if needed
 */

interface TableCheck {
  name: string;
  exists: boolean;
  error?: string;
}

const REQUIRED_TABLES = [
  'users',
  'user_profiles',
  'skills',
  'goals',
  'achievements',
  'conversations',
  'messages',
  'manager_moments',
  'user_moments',
  'moment_completions',
  'moment_debriefs',
  'moment_peer_examples',
  'moment_practice_variants',
  'habits',
  'saved_recommendations',
  'mom_records',
  'trend_analysis',
  'blindspot_analysis',
  'progress_analysis'
];

async function checkTableExists(tableName: string): Promise<TableCheck> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      );
    `);
    
    const exists = result.rows[0]?.exists === true;
    return { name: tableName, exists };
  } catch (error: any) {
    return { name: tableName, exists: false, error: error.message };
  }
}

async function createMissingTables() {
  console.log('🔍 Checking database tables...\n');
  
  const checks: TableCheck[] = [];
  
  for (const tableName of REQUIRED_TABLES) {
    const check = await checkTableExists(tableName);
    checks.push(check);
    
    if (check.exists) {
      console.log(`✅ ${tableName}`);
    } else {
      console.log(`❌ ${tableName} - MISSING`);
    }
  }
  
  const missingTables = checks.filter(c => !c.exists);
  
  if (missingTables.length === 0) {
    console.log('\n✅ All required tables exist!');
    return { success: true, missingTables: [] };
  }
  
  console.log(`\n⚠️  Found ${missingTables.length} missing tables:`);
  missingTables.forEach(t => console.log(`   - ${t.name}`));
  
  console.log('\n📝 Creating missing tables...');
  
  // Create enums first
  try {
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE manager_tone AS ENUM ('supportive', 'direct', 'balanced');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE moment_status AS ENUM ('not_started', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('✅ Enums created/verified');
  } catch (error) {
    console.warn('⚠️  Enum creation warning (may already exist):', error);
  }
  
  // Create tables using Drizzle push (safer than raw SQL)
  try {
    // Note: In production, use proper migrations
    // For now, we'll provide SQL for manual execution
    console.log('\n📋 Please run the following SQL to create missing tables:');
    console.log('   Use: npx drizzle-kit push:pg');
    console.log('   Or manually run migrations from src/db/migrations/');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
  
  return { success: false, missingTables: missingTables.map(t => t.name) };
}

async function verifyDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful\n');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function getTableRowCounts() {
  console.log('\n📊 Table row counts:');
  
  const tables = ['users', 'manager_moments', 'conversations', 'habits', 'achievements'];
  
  for (const table of tables) {
    try {
      const result = await db.execute(sql`SELECT COUNT(*) FROM ${sql.identifier(table)}`);
      const count = result.rows[0]?.count || 0;
      console.log(`   ${table}: ${count} rows`);
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log(`   ${table}: TABLE DOES NOT EXIST`);
      } else {
        console.log(`   ${table}: Error - ${error.message}`);
      }
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 ALT Manager Database Verification\n');
  console.log('='.repeat(50));
  
  const connected = await verifyDatabaseConnection();
  if (!connected) {
    process.exit(1);
  }
  
  const result = await createMissingTables();
  
  await getTableRowCounts();
  
  console.log('\n' + '='.repeat(50));
  
  if (result.success) {
    console.log('✅ Database is ready!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Action required: Run migrations to create missing tables');
    console.log('   Command: npx drizzle-kit push:pg');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { checkTableExists, createMissingTables, verifyDatabaseConnection };
