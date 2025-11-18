// Simple migration runner using pg directly
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: node run-migration.js <migration-file.sql>');
  process.exit(1);
}

async function runMigration() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected');
    
    console.log(`📄 Reading migration file: ${migrationFile}`);
    const sql = readFileSync(migrationFile, 'utf-8');
    
    console.log('🚀 Running migration...');
    await client.query(sql);
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '42P07') {
      console.log('⚠️  Note: Table already exists (this is OK if re-running)');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
