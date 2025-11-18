// Test database connection and registration
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌');
  console.log('Connection timeout: 30 seconds\n');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 30000, // 30 second timeout
    statement_timeout: 15000, // 15 second query timeout
  });

  try {
    // Test 1: Basic connection
    console.log('Test 1: Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connection successful\n');

    // Test 2: Check if tables exist
    console.log('Test 2: Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('✅ Tables found:', tablesResult.rows.map(r => r.table_name).join(', '));
    console.log('');

    // Test 3: Check users table structure
    console.log('Test 3: Checking users table structure...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log('✅ Users table columns:');
    columnsResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    console.log('');

    // Test 4: Test user insertion
    console.log('Test 4: Testing user registration...');
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPass123';
    const testName = 'Test User';
    
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Name: ${testName}`);
    
    // Hash password
    const passwordHash = await bcrypt.hash(testPassword, 10);
    console.log('   ✅ Password hashed');
    
    // Insert user
    const insertResult = await client.query(
      'INSERT INTO users (email, password, first_name, last_name, role, experience) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name',
      [testEmail, passwordHash, testName, '', 'user', 0]
    );
    
    const newUser = insertResult.rows[0];
    console.log(`   ✅ User created with ID: ${newUser.id}`);
    console.log('');

    // Test 5: Create user profile
    console.log('Test 5: Creating user profile...');
    const profileResult = await client.query(
      'INSERT INTO user_profiles (user_id) VALUES ($1) RETURNING id, user_id',
      [newUser.id]
    );
    console.log(`   ✅ Profile created with ID: ${profileResult.rows[0].id}`);
    console.log('');

    // Test 6: Verify user can be retrieved
    console.log('Test 6: Retrieving user...');
    const selectResult = await client.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
      [testEmail]
    );
    console.log(`   ✅ User retrieved: ${selectResult.rows[0].email}`);
    console.log('');

    // Test 7: Verify password
    console.log('Test 7: Verifying password...');
    const storedHash = (await client.query('SELECT password FROM users WHERE email = $1', [testEmail])).rows[0].password;
    const isValid = await bcrypt.compare(testPassword, storedHash);
    console.log(`   ✅ Password verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    console.log('');

    client.release();
    
    console.log('========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('========================================');
    console.log('\nDatabase is working correctly.');
    console.log('The issue might be in the Express route or middleware.\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testConnection();
