import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

async function runMigration() {
  console.log('🚀 Running mom_records migration...\n');
  
  try {
    const client = await pool.connect();
    
    // Check if table already exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'mom_records'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ mom_records table already exists - skipping migration');
      client.release();
      process.exit(0);
      return;
    }
    
    console.log('📝 Creating mom_records table...');
    
    // Read migration SQL
    const migrationPath = path.join(__dirname, 'migrations', '001_create_mom_records.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify table creation
    const verifyColumns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'mom_records'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Created columns:');
    verifyColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name.padEnd(25)} ${row.data_type}`);
    });
    
    console.log('\n✅ mom_records table is ready for use!');
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
