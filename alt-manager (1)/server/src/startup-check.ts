import { db } from './db/index.js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import { checkDatabaseHealth } from './utils/dbHealthCheck.js';

dotenv.config();

/**
 * Pre-flight checks before starting the server
 * Ensures critical dependencies are available
 */

interface StartupCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

async function checkEnvironmentVariables(): Promise<StartupCheck> {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    return {
      name: 'Environment Variables',
      status: 'fail',
      message: `Missing: ${missing.join(', ')}`
    };
  }
  
  return {
    name: 'Environment Variables',
    status: 'pass',
    message: 'All required variables present'
  };
}

async function checkDatabaseConnection(): Promise<StartupCheck> {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds between retries
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Startup] Attempting database connection (${attempt}/${maxRetries})...`);
      const start = Date.now();
      await db.execute(sql`SELECT 1`);
      const latency = Date.now() - start;
      
      return {
        name: 'Database Connection',
        status: 'pass',
        message: `Connected (${latency}ms)${attempt > 1 ? ` after ${attempt} attempts` : ''}`
      };
    } catch (error: any) {
      console.error(`[Startup] Connection attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`[Startup] Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        return {
          name: 'Database Connection',
          status: 'fail',
          message: `${error.message || 'Connection failed'} (after ${maxRetries} attempts)`
        };
      }
    }
  }
  
  // This should never be reached, but TypeScript requires it
  return {
    name: 'Database Connection',
    status: 'fail',
    message: 'Unexpected error'
  };
}

async function checkCriticalTables(): Promise<StartupCheck> {
  const criticalTables = [
    'users',
    'manager_moments',
    'conversations',
    'messages'
  ];
  
  const missing: string[] = [];
  
  for (const table of criticalTables) {
    try {
      await db.execute(sql`SELECT 1 FROM ${sql.identifier(table)} LIMIT 1`);
    } catch (error: any) {
      if (error.code === '42P01') {
        missing.push(table);
        console.error(`[Startup] ❌ Critical table '${table}' does not exist`);
      } else {
        console.error(`[Startup] ⚠️  Error checking table '${table}':`, error.message);
      }
    }
  }
  
  if (missing.length > 0) {
    console.error('[Startup] Missing critical tables. Run: npm run db:migrate');
    return {
      name: 'Critical Tables',
      status: 'fail',
      message: `Missing tables: ${missing.join(', ')} - Run: npm run db:migrate`
    };
  }
  
  return {
    name: 'Critical Tables',
    status: 'pass',
    message: 'All critical tables exist'
  };
}

async function checkOptionalTables(): Promise<StartupCheck> {
  const optionalTables = [
    'habits',
    'achievements',
    'mom_records',
    'trend_analysis',
    'blindspot_analysis',
    'progress_analysis'
  ];
  
  const missing: string[] = [];
  
  for (const table of optionalTables) {
    try {
      await db.execute(sql`SELECT 1 FROM ${sql.identifier(table)} LIMIT 1`);
    } catch (error: any) {
      if (error.code === '42P01') {
        missing.push(table);
      }
    }
  }
  
  if (missing.length > 0) {
    return {
      name: 'Optional Tables',
      status: 'warn',
      message: `Missing: ${missing.join(', ')} (features may be limited)`
    };
  }
  
  return {
    name: 'Optional Tables',
    status: 'pass',
    message: 'All optional tables exist'
  };
}

async function checkGeminiAPI(): Promise<StartupCheck> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      name: 'Gemini API',
      status: 'fail',
      message: 'GEMINI_API_KEY not set'
    };
  }
  
  const keyType = apiKey.startsWith('AIza') ? 'MakerSuite (Free)' : 'Google Cloud (Paid)';
  
  return {
    name: 'Gemini API',
    status: 'pass',
    message: `Configured (${keyType})`
  };
}

export async function runStartupChecks(): Promise<boolean> {
  console.log('\n🚀 Running startup checks...\n');
  console.log('='.repeat(60));
  
  const checks: StartupCheck[] = [];
  
  // Run all checks
  checks.push(await checkEnvironmentVariables());
  checks.push(await checkDatabaseConnection());
  checks.push(await checkCriticalTables());
  checks.push(await checkOptionalTables());
  checks.push(await checkGeminiAPI());
  
  // Display results
  for (const check of checks) {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️ ' : '❌';
    console.log(`${icon} ${check.name.padEnd(25)} ${check.message}`);
  }
  
  console.log('='.repeat(60));
  
  const hasFailed = checks.some(c => c.status === 'fail');
  const hasWarnings = checks.some(c => c.status === 'warn');
  
  if (hasFailed) {
    console.log('\n❌ Startup checks FAILED. Please fix the errors above.\n');
    return false;
  }
  
  if (hasWarnings) {
    console.log('\n⚠️  Startup checks passed with warnings. Some features may be limited.\n');
  } else {
    console.log('\n✅ All startup checks passed!\n');
  }
  
  return true;
}

// Run checks if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStartupChecks()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Startup check error:', error);
      process.exit(1);
    });
}
