const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testRegistration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    console.log('Users table exists:', tableCheck.rows[0].exists);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist! Please run the SQL script in Neon console.');
      return;
    }

    // Try to insert a test user
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('\n🔄 Attempting to create user...');
    
    const result = await client.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, passwordHash, name]
    );

    console.log('✅ User created successfully!');
    console.log('User ID:', result.rows[0].id);
    console.log('Email:', result.rows[0].email);
    console.log('Name:', result.rows[0].name);

    // Create user profile
    await client.query(
      'INSERT INTO user_profiles (user_id) VALUES ($1)',
      [result.rows[0].id]
    );
    console.log('✅ User profile created');

    console.log('\n🎉 Registration test successful! The app should work now.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === '23505') {
      console.log('\n💡 User already exists. Try with a different email.');
    } else if (error.code === '42P01') {
      console.log('\n💡 Table does not exist. Please run the SQL script in Neon console.');
    } else {
      console.log('\n💡 Full error:', error);
    }
  } finally {
    await client.end();
  }
}

testRegistration();
