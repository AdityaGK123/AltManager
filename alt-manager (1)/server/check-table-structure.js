import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

async function checkTableStructure() {
  console.log('🔍 Checking table structures...\n');
  
  try {
    const client = await pool.connect();
    
    // Check conversations table
    console.log('📋 CONVERSATIONS TABLE:');
    const conversationsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position;
    `);
    conversationsColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name.padEnd(20)} ${row.data_type.padEnd(30)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check achievements table
    console.log('\n📋 ACHIEVEMENTS TABLE:');
    const achievementsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'achievements'
      ORDER BY ordinal_position;
    `);
    if (achievementsColumns.rows.length > 0) {
      achievementsColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name.padEnd(20)} ${row.data_type.padEnd(30)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('  ❌ Table does not exist');
    }
    
    // Check messages table
    console.log('\n📋 MESSAGES TABLE:');
    const messagesColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'messages'
      ORDER BY ordinal_position;
    `);
    messagesColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name.padEnd(20)} ${row.data_type.padEnd(30)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    client.release();
    console.log('\n✅ Table structure check completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTableStructure();
