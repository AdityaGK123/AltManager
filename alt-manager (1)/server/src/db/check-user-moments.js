import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function checkUserMoments() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if user_moments table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_moments'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (!tableExists) {
      console.log('❌ user_moments table does NOT exist');
      console.log('   Need to run migration to create it\n');
      return false;
    }
    
    console.log('✅ user_moments table exists\n');
    
    // Check table structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_moments'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Table structure:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    console.log('');
    
    // Check row count
    const count = await client.query('SELECT COUNT(*) FROM user_moments');
    console.log(`📊 Total user_moments records: ${count.rows[0].count}\n`);
    
    // Check indexes
    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'user_moments';
    `);
    
    console.log('🔍 Indexes:');
    if (indexes.rows.length === 0) {
      console.log('   ⚠️  No indexes found (consider adding for user_id, moment_id)');
    } else {
      indexes.rows.forEach(idx => {
        console.log(`   ${idx.indexname}`);
      });
    }
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

checkUserMoments();
