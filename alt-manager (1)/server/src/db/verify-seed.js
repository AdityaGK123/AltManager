import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function verifySeed() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Count moments
    const countResult = await client.query('SELECT COUNT(*) FROM manager_moments');
    const count = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Total moments in database: ${count}`);
    
    if (count === 0) {
      console.log('❌ No moments found. Run seed script:\n');
      console.log('   node src/db/run-migration.js src/db/seed-moments.sql\n');
      return;
    }
    
    if (count < 10) {
      console.log(`⚠️  Only ${count} moments found. Expected 10.\n`);
    } else {
      console.log('✅ All 10 moments seeded successfully!\n');
    }
    
    // List all moments
    const momentsResult = await client.query(`
      SELECT id, title, category 
      FROM manager_moments 
      ORDER BY id
    `);
    
    console.log('📋 Seeded moments:');
    momentsResult.rows.forEach((row, idx) => {
      console.log(`   ${idx + 1}. ${row.title} (${row.category})`);
    });
    
    console.log('\n✅ Verification complete!');
    console.log('\nNext steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Open: http://localhost:5173/moments');
    console.log('   3. Test API: curl http://localhost:3000/api/moments\n');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('   - Ensure database is running');
    console.log('   - Check DATABASE_URL in server/.env');
    console.log('   - Run migrations first if needed\n');
  } finally {
    await client.end();
  }
}

verifySeed();
