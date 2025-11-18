import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

async function checkMomTable() {
  console.log('🔍 Checking mom_records table...\n');
  
  try {
    const client = await pool.connect();
    
    // Check if mom_records table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'mom_records'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ mom_records table EXISTS\n');
      
      // Show structure
      console.log('📋 TABLE STRUCTURE:');
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'mom_records'
        ORDER BY ordinal_position;
      `);
      
      columns.rows.forEach(row => {
        console.log(`  - ${row.column_name.padEnd(25)} ${row.data_type.padEnd(30)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Check row count
      const countResult = await client.query('SELECT COUNT(*) FROM mom_records');
      console.log(`\n📊 Current records: ${countResult.rows[0].count}`);
    } else {
      console.log('❌ mom_records table DOES NOT EXIST');
      console.log('   → Migration needed\n');
    }
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMomTable();
