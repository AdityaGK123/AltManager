const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function registerRealUser() {
  // Generate realistic GenZ professional identity
  const timestamp = Date.now();
  const user = {
    name: 'Priya Sharma',
    email: `priya.sharma+${timestamp}@gmail.com`,
    password: 'Career2024@GenZ'
  };

  console.log('👤 Registering GenZ Professional:');
  console.log('   Name:', user.name);
  console.log('   Email:', user.email);
  console.log('   Password:', user.password);
  console.log('');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if email already exists
    const existingCheck = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [user.email]
    );

    if (existingCheck.rows.length > 0) {
      console.log('⚠️  Email already exists, generating new one...');
      user.email = `priya.sharma+${Date.now() + 1000}@gmail.com`;
      console.log('   New email:', user.email);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(user.password, 10);
    console.log('✅ Password hashed');

    // Insert user (using existing schema with all required fields)
    const userResult = await client.query(
      `INSERT INTO users (
        email, password, first_name, last_name, role, email_verified, 
        experience, company, industry, timezone, role_title, organization,
        motivation, support_needs, management_style, work_life_balance,
        communication_style, generation_group, skill_tracking_enabled,
        token_usage, daily_token_usage, has_seen_tour, graduated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) 
      RETURNING *`,
      [
        user.email, passwordHash, user.name.split(' ')[0], user.name.split(' ')[1] || '', 
        'user', false, 2, 'Tech Startup', 'Technology', 'Asia/Kolkata', 
        'Software Engineer', 'TechCorp', 'Career growth and skill development',
        'Guidance on workplace communication', 'balanced', 7, 'professional', 
        'GenZ', true, 0, 0, false, false
      ]
    );

    console.log('✅ User created with ID:', userResult.rows[0].id);

    // Try to create user profile (skip if table doesn't exist)
    try {
      const profileResult = await client.query(
        'INSERT INTO user_profiles (user_id, level, experience_points, onboarding_completed) VALUES ($1, 1, 0, false) RETURNING *',
        [userResult.rows[0].id]
      );
      console.log('✅ User profile created with ID:', profileResult.rows[0].id);
    } catch (profileError) {
      console.log('⚠️  User profile table not found (this is okay for existing schema)');
    }

    console.log('\n🎉 Registration Successful!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', user.email);
    console.log('Password: ', user.password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Next Steps:');
    console.log('1. Open http://localhost:5173/login in your browser');
    console.log('2. Login with the credentials above');
    console.log('3. Complete the onboarding flow');
    console.log('4. Start using ALT Manager!');

  } catch (error) {
    console.error('\n❌ Registration Failed!');
    console.error('Error:', error.message);
    
    if (error.code === '23505') {
      console.log('\n💡 Duplicate email detected. Run the script again to generate a new unique email.');
    } else if (error.code === '42P01') {
      console.log('\n💡 Tables do not exist. Please run the SQL setup script in Neon console first.');
    } else {
      console.error('\nFull error:', error);
    }
  } finally {
    await client.end();
  }
}

registerRealUser();
