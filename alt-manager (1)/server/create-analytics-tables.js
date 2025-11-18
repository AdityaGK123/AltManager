// Create analytics tables in the database
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
});

async function createAnalyticsTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating analytics tables...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-analytics-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const result = await client.query(sql);
    
    console.log('✅ Analytics tables created successfully!\n');
    
    // Show the verification results
    if (result.rows && result.rows.length > 0) {
      console.log('📊 Table verification:');
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}: ${row.row_count} rows`);
      });
    }
    
    console.log('\n✅ Database is ready for analytics generation!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('Details:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createAnalyticsTables()
  .then(() => {
    console.log('\n🎉 Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
