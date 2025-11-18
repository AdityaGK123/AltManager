/**
 * Diagnostic Script for 500 Internal Server Errors
 * Run this to identify the root cause of API failures
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('\n🔍 ALT Manager - 500 Error Diagnostic Tool\n');
console.log('='.repeat(60));

// 1. Check Environment Variables
console.log('\n📋 Environment Variables Check:');
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY', 'PORT'];
const optionalVars = ['NODE_ENV', 'CORS_ORIGIN'];

let allEnvVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = ['JWT_SECRET', 'GEMINI_API_KEY', 'DATABASE_URL'].includes(varName)
      ? `${value.substring(0, 8)}...`
      : value;
    console.log(`  ✅ ${varName.padEnd(20)} = ${displayValue}`);
  } else {
    console.log(`  ❌ ${varName.padEnd(20)} = NOT SET`);
    allEnvVarsPresent = false;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName.padEnd(20)} = ${value}`);
  } else {
    console.log(`  ⚠️  ${varName.padEnd(20)} = NOT SET (using defaults)`);
  }
});

// 2. Check Database Connection
console.log('\n🗄️  Database Connection Check:');
try {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('  ❌ DATABASE_URL not set');
  } else {
    // Parse connection string
    const url = new URL(dbUrl);
    console.log(`  ✅ Protocol: ${url.protocol}`);
    console.log(`  ✅ Host: ${url.hostname}`);
    console.log(`  ✅ Port: ${url.port || 'default'}`);
    console.log(`  ✅ Database: ${url.pathname.substring(1)}`);
    console.log(`  ✅ SSL: ${dbUrl.includes('sslmode=require') || dbUrl.includes('neon.tech') ? 'enabled' : 'disabled'}`);
  }
} catch (error) {
  console.log(`  ❌ Invalid DATABASE_URL format: ${error.message}`);
}

// 3. Check JWT Configuration
console.log('\n🔐 JWT Configuration Check:');
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  console.log(`  ✅ JWT_SECRET is set (length: ${jwtSecret.length} chars)`);
  if (jwtSecret.length < 32) {
    console.log(`  ⚠️  WARNING: JWT_SECRET is short (< 32 chars). Consider using a longer secret.`);
  }
} else {
  console.log('  ❌ JWT_SECRET not set - Auth middleware will fail!');
}

// 4. Check Gemini API Configuration
console.log('\n🤖 Gemini API Configuration Check:');
const geminiKey = process.env.GEMINI_API_KEY;
if (geminiKey) {
  const keyType = geminiKey.startsWith('AIza') ? 'MakerSuite (Free Tier)' : 'Google Cloud (Paid)';
  console.log(`  ✅ GEMINI_API_KEY is set`);
  console.log(`  ✅ Key Type: ${keyType}`);
  console.log(`  ✅ Key Format: ${geminiKey.substring(0, 8)}...`);
} else {
  console.log('  ❌ GEMINI_API_KEY not set - AI features will fail!');
}

// 5. Summary and Recommendations
console.log('\n' + '='.repeat(60));
console.log('\n📊 Diagnostic Summary:\n');

if (!allEnvVarsPresent) {
  console.log('❌ CRITICAL: Missing required environment variables!');
  console.log('\n🔧 Fix:');
  console.log('   1. Create/update server/.env file with:');
  console.log('      DATABASE_URL=your_postgres_connection_string');
  console.log('      JWT_SECRET=your_secure_random_string_at_least_32_chars');
  console.log('      GEMINI_API_KEY=your_gemini_api_key');
  console.log('      PORT=3000');
  console.log('   2. Restart the server: npm run dev');
} else {
  console.log('✅ All required environment variables are set!');
}

// 6. Common 500 Error Causes
console.log('\n🔍 Common Causes of 500 Errors:\n');
console.log('1. Missing Environment Variables');
console.log('   → Check that .env file exists in server/ directory');
console.log('   → Verify all required variables are set\n');

console.log('2. Database Connection Issues');
console.log('   → Verify DATABASE_URL is correct');
console.log('   → Check if database is accessible');
console.log('   → Ensure tables exist (run migrations)\n');

console.log('3. JWT Authentication Failures');
console.log('   → Verify JWT_SECRET is set');
console.log('   → Check if token is being sent in Authorization header');
console.log('   → Ensure token format is "Bearer <token>"\n');

console.log('4. Missing Database Tables');
console.log('   → Run: npm run db:push (in server directory)');
console.log('   → Check startup logs for table warnings\n');

console.log('5. CORS Issues');
console.log('   → Verify CORS_ORIGIN matches your frontend URL');
console.log('   → Default is http://localhost:5173\n');

// 7. Next Steps
console.log('='.repeat(60));
console.log('\n🚀 Next Steps:\n');
console.log('1. Fix any ❌ issues shown above');
console.log('2. Restart the backend server: cd server && npm run dev');
console.log('3. Check server logs for startup errors');
console.log('4. Test API endpoints with browser DevTools Network tab');
console.log('5. Look for specific error messages in server console\n');

console.log('='.repeat(60));
console.log('\n✅ Diagnostic complete!\n');
