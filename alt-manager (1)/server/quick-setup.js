const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    const sql = fs.readFileSync(path.join(__dirname, 'setup-db.sql'), 'utf8');
    
    console.log('🔄 Creating tables...');
    await client.query(sql);
    console.log('✅ All tables created successfully!');
    console.log('\n🎉 Database setup complete! You can now register in the app.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative: Copy the SQL from server/setup-db.sql and run it in Neon console');
  } finally {
    await client.end();
  }
}

setup();
