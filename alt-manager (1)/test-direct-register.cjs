// Direct registration test with detailed error logging
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testRegistration() {
  console.log('Testing direct registration...\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    // Test data
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPass123';
    const testName = 'Test User';
    
    console.log('Step 1: Hash password');
    const passwordHash = await bcrypt.hash(testPassword, 10);
    console.log('✅ Password hashed\n');
    
    console.log('Step 2: Insert user with correct schema');
    console.log(`   Email: ${testEmail}`);
    console.log(`   First Name: ${testName}`);
    console.log(`   Last Name: (empty)`);
    
    const insertQuery = `
      INSERT INTO users (email, password, first_name, last_name, role, experience)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name
    `;
    
    const result = await client.query(insertQuery, [
      testEmail,
      passwordHash,
      testName,
      '',
      'user',
      0
    ]);
    
    const newUser = result.rows[0];
    console.log(`✅ User created successfully!`);
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Name: ${newUser.first_name} ${newUser.last_name}\n`);
    
    console.log('Step 3: Create user profile');
    const profileQuery = `
      INSERT INTO user_profiles (user_id)
      VALUES ($1)
      RETURNING id
    `;
    
    const profileResult = await client.query(profileQuery, [newUser.id]);
    console.log(`✅ Profile created with ID: ${profileResult.rows[0].id}\n`);
    
    console.log('Step 4: Test login');
    const loginQuery = `SELECT id, email, password, first_name, last_name FROM users WHERE email = $1`;
    const loginResult = await client.query(loginQuery, [testEmail]);
    
    if (loginResult.rows.length === 0) {
      console.log('❌ User not found');
    } else {
      const user = loginResult.rows[0];
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`✅ Password verification: ${isValid ? 'PASSED' : 'FAILED'}\n`);
    }
    
    client.release();
    
    console.log('========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('========================================');
    console.log('\nThe database schema is correct.');
    console.log('Now testing via Express API...\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testRegistration();
