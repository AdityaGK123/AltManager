import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function testAPI() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Simulate API call
    const result = await client.query(`
      SELECT id, title, description, category, tags 
      FROM manager_moments 
      ORDER BY title
      LIMIT 10
    `);
    
    console.log('📊 API Response Simulation (/api/moments):');
    console.log(`   Total: ${result.rows.length} moments\n`);
    
    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.title}`);
      console.log(`   Category: ${row.category}`);
      console.log(`   Description: ${row.description}`);
      console.log('');
    });
    
    console.log('✅ All moments ready for frontend display!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await client.end();
  }
}

testAPI();
