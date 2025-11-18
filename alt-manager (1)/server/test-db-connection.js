import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful\n');
    
    // Check critical tables
    const criticalTables = ['users', 'conversations', 'messages', 'manager_moments'];
    console.log('📋 Checking critical tables:\n');
    
    for (const table of criticalTables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  ✅ ${table.padEnd(20)} - ${result.rows[0].count} rows`);
      } catch (error) {
        if (error.code === '42P01') {
          console.log(`  ❌ ${table.padEnd(20)} - TABLE DOES NOT EXIST`);
        } else {
          console.log(`  ⚠️  ${table.padEnd(20)} - Error: ${error.message}`);
        }
      }
    }
    
    client.release();
    console.log('\n✅ Database test completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
