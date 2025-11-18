/**
 * Fix Script: Create moment_diagnostics table
 * Resolves: relation "moment_diagnostics" does not exist
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('\n🔧 Fixing moment_diagnostics table...\n');
console.log('='.repeat(60));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : undefined,
});

async function fixMomentDiagnostics() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to database');
    
    // Read SQL file
    const sqlPath = join(__dirname, 'create-moment-diagnostics.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    console.log('📝 Executing SQL migration...');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ moment_diagnostics table created successfully');
    
    // Verify table exists
    const result = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'moment_diagnostics'
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length > 0) {
      console.log('\n📊 Table Structure:');
      result.rows.forEach(row => {
        console.log(`   • ${row.column_name.padEnd(20)} ${row.data_type}`);
      });
      
      console.log('\n✅ SUCCESS: moment_diagnostics table is now available');
      console.log('\n🚀 Next Steps:');
      console.log('   1. Restart the server: npm run dev');
      console.log('   2. Check logs - error should be gone');
      console.log('   3. Test endpoints: npm run test:endpoints\n');
    } else {
      console.log('⚠️  Table created but structure verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Table already exists! Checking structure...');
      
      const result = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'moment_diagnostics'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📊 Existing Table Structure:');
      result.rows.forEach(row => {
        console.log(`   • ${row.column_name.padEnd(20)} ${row.data_type}`);
      });
      
      console.log('\n✅ Table exists - the error may be resolved');
      console.log('   Try restarting the server: npm run dev\n');
    } else {
      console.log('\n🔍 Troubleshooting:');
      console.log('   1. Check DATABASE_URL in .env');
      console.log('   2. Verify database permissions');
      console.log('   3. Try running: npm run db:generate && npm run db:migrate\n');
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Check database connection first
async function checkConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env');
    console.log('   Add: DATABASE_URL=postgresql://user:pass@host:port/db\n');
    process.exit(1);
  }
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connection verified');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Cannot connect to database:', error.message);
    console.log('\n🔍 Check:');
    console.log('   1. DATABASE_URL is correct');
    console.log('   2. Database is accessible');
    console.log('   3. Network/firewall allows connection\n');
    process.exit(1);
  }
}

// Main execution
(async () => {
  await checkConnection();
  await fixMomentDiagnostics();
})();
