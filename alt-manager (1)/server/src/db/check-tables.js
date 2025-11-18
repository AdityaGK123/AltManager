import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function checkTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' 
      AND table_name LIKE '%moment%'
      ORDER BY table_name
    `);
    
    console.log('📊 Existing moment-related tables:');
    if (res.rows.length === 0) {
      console.log('   (none found)');
    } else {
      res.rows.forEach(row => console.log(`   - ${row.table_name}`));
    }
    
    // Check manager_moments columns
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='manager_moments'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 manager_moments columns:');
    cols.rows.forEach(row => console.log(`   - ${row.column_name} (${row.data_type})`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();
