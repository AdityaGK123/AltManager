import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function fixTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Drop and recreate conversations table with correct reference
    console.log('Fixing conversations table...');
    await client.query(`DROP TABLE IF EXISTS messages CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS conversations CASCADE;`);
    
    await client.query(`
      CREATE TABLE conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Conversations table created');

    await client.query(`
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Messages table created');

    // Create remaining tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS manager_moments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        scenario TEXT NOT NULL,
        artifact JSONB,
        category VARCHAR(100),
        difficulty INTEGER DEFAULT 1,
        learning_objectives JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Manager moments table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_moments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        moment_id INTEGER NOT NULL,
        status moment_status DEFAULT 'not_started',
        score INTEGER,
        feedback JSONB,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (moment_id) REFERENCES manager_moments(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ User moments table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        frequency VARCHAR(50),
        streak INTEGER DEFAULT 0,
        last_completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Habits table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100),
        source VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Saved recommendations table created');

    console.log('\n🎉 All tables fixed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

fixTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
