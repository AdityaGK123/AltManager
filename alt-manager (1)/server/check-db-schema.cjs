// Check current database schema
const { Pool } = require('pg');
require('dotenv').config();

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    // Get users table structure
    const result = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current users table schema:');
    console.log('==========================');
    result.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\nExpected by application:');
    console.log('========================');
    console.log('id: integer NOT NULL');
    console.log('email: varchar(255) NOT NULL');
    console.log('password_hash: text NOT NULL');
    console.log('name: varchar(255) NULL');
    console.log('created_at: timestamp NOT NULL');
    console.log('updated_at: timestamp NOT NULL');
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
