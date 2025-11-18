/**
 * Add Optional Tables for Advanced Features
 * Run when ready to enable analytics, habits, and MoM features
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

console.log('\n🔧 Adding Optional Tables for Advanced Features...\n');
console.log('='.repeat(60));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : undefined,
});

async function addOptionalTables() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to database');
    
    // Read SQL file
    const sqlPath = join(__dirname, 'create-optional-tables.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    console.log('📝 Creating optional tables...');
    console.log('   • habits');
    console.log('   • mom_records');
    console.log('   • trend_analysis');
    console.log('   • blindspot_analysis');
    console.log('   • progress_analysis\n');
    
    // Execute the SQL
    const result = await client.query(sql);
    
    console.log('✅ All optional tables created successfully\n');
    
    // Verify tables exist
    const verification = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_name IN ('habits', 'mom_records', 'trend_analysis', 
                          'blindspot_analysis', 'progress_analysis')
      ORDER BY table_name
    `);
    
    if (verification.rows.length > 0) {
      console.log('📊 Tables Created:');
      verification.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name.padEnd(25)} (${row.column_count} columns)`);
      });
      
      console.log('\n✅ SUCCESS: All optional tables are now available');
      console.log('\n🚀 Next Steps:');
      console.log('   1. Restart the server: npm run dev');
      console.log('   2. Check logs - warnings should be gone');
      console.log('   3. Enable advanced features in frontend\n');
      
      console.log('📋 Features Now Available:');
      console.log('   • Habit Tracking');
      console.log('   • Meeting Minutes (MoM)');
      console.log('   • Trend Analysis');
      console.log('   • Blindspot Analysis');
      console.log('   • Progress Tracking\n');
    } else {
      console.log('⚠️  Tables created but verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Tables already exist!');
      console.log('   Your database is fully set up.\n');
    } else {
      console.log('\n🔍 Troubleshooting:');
      console.log('   1. Check DATABASE_URL in .env');
      console.log('   2. Verify database permissions');
      console.log('   3. Try: npm run db:generate && npm run db:migrate\n');
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Main execution
(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env\n');
    process.exit(1);
  }
  
  await addOptionalTables();
})();
