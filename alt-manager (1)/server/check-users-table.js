import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...\n');
  
  try {
    const client = await pool.connect();
    
    // Check users table
    console.log('📋 USERS TABLE:');
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    usersColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name.padEnd(25)} ${row.data_type.padEnd(30)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    client.release();
    console.log('\n✅ Table structure check completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsersTable();
