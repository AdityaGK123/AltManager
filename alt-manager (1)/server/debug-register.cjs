const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugRegister() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const email = 'maddurihasini25@gmail.com';
    const password = 'test123456';
    const name = 'Hasini Madduri';

    console.log('📝 Testing registration for:', email);

    // Check if user exists
    const existingCheck = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingCheck.rows.length > 0) {
      console.log('⚠️  User already exists! Deleting for fresh test...');
      await client.query('DELETE FROM users WHERE email = $1', [email]);
      console.log('✅ Old user deleted');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Insert user
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
      [email, passwordHash, name]
    );

    console.log('✅ User created:', userResult.rows[0]);

    // Create profile
    const profileResult = await client.query(
      'INSERT INTO user_profiles (user_id) VALUES ($1) RETURNING *',
      [userResult.rows[0].id]
    );

    console.log('✅ Profile created:', profileResult.rows[0]);

    console.log('\n🎉 Registration test successful!');
    console.log('\n💡 Now try registering in the browser with:');
    console.log('   Email:', email);
    console.log('   Password:', password);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
  }
}

debugRegister();
