import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

/**
 * Comprehensive database health check
 * Verifies connection and critical tables
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  tables: { [key: string]: boolean };
  errors: string[];
}> {
  const result = {
    connected: false,
    tables: {} as { [key: string]: boolean },
    errors: [] as string[],
  };

  // Check connection
  try {
    await db.execute(sql`SELECT 1`);
    result.connected = true;
    console.log('[DB Health] ✅ Database connection successful');
  } catch (error: any) {
    result.connected = false;
    result.errors.push(`Connection failed: ${error.message}`);
    console.error('[DB Health] ❌ Database connection failed:', error.message);
    return result;
  }

  // Check critical tables
  const criticalTables = [
    'users',
    'user_profiles',
    'conversations',
    'messages',
    'manager_moments',
    'skills',
    'goals',
    'achievements',
    'habits',
  ];

  for (const table of criticalTables) {
    try {
      await db.execute(sql`SELECT 1 FROM ${sql.identifier(table)} LIMIT 1`);
      result.tables[table] = true;
      console.log(`[DB Health] ✅ Table '${table}' exists`);
    } catch (error: any) {
      result.tables[table] = false;
      if (error.code === '42P01') {
        result.errors.push(`Table '${table}' does not exist`);
        console.error(`[DB Health] ❌ Table '${table}' does not exist`);
      } else {
        result.errors.push(`Table '${table}' check failed: ${error.message}`);
        console.error(`[DB Health] ❌ Table '${table}' check failed:`, error.message);
      }
    }
  }

  return result;
}

/**
 * Ensure critical tables exist before starting server
 */
export async function ensureCriticalTables(): Promise<boolean> {
  const health = await checkDatabaseHealth();

  if (!health.connected) {
    console.error('[DB Health] Cannot proceed without database connection');
    return false;
  }

  const missingCritical = ['users', 'conversations', 'messages'].filter(
    table => !health.tables[table]
  );

  if (missingCritical.length > 0) {
    console.error('[DB Health] Missing critical tables:', missingCritical.join(', '));
    console.error('[DB Health] Please run: npm run db:migrate');
    return false;
  }

  console.log('[DB Health] ✅ All critical tables exist');
  return true;
}
