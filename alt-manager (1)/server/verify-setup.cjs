require('dotenv').config();

console.log('\n' + '='.repeat(70));
console.log('ALT MANAGER - AI CHAT SETUP VERIFICATION');
console.log('='.repeat(70) + '\n');

let allChecks = true;

// Check 1: Environment Variables
console.log('📋 Step 1: Checking Environment Variables...');
console.log('-'.repeat(70));

const requiredEnvVars = {
  'DATABASE_URL': process.env.DATABASE_URL,
  'JWT_SECRET': process.env.JWT_SECRET,
  'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
  'PORT': process.env.PORT || '3000 (default)',
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (value && value !== '3000 (default)') {
    console.log(`✅ ${key}: SET`);
    if (key === 'GEMINI_API_KEY') {
      console.log(`   Length: ${value.length} characters`);
      console.log(`   Preview: ${value.substring(0, 10)}...${value.substring(value.length - 5)}`);
    }
  } else if (key === 'PORT') {
    console.log(`ℹ️  ${key}: ${value}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allChecks = false;
  }
}

console.log('');

// Check 2: Node Modules
console.log('📦 Step 2: Checking Dependencies...');
console.log('-'.repeat(70));

const requiredPackages = [
  '@google/generative-ai',
  'express',
  'dotenv',
  'drizzle-orm',
  'pg',
];

let missingPackages = [];
for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
    console.log(`✅ ${pkg}: Installed`);
  } catch (e) {
    console.log(`❌ ${pkg}: NOT FOUND`);
    missingPackages.push(pkg);
    allChecks = false;
  }
}

console.log('');

// Check 3: File Structure
console.log('📁 Step 3: Checking File Structure...');
console.log('-'.repeat(70));

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/index.ts',
  'src/routes/chat.ts',
  'src/services/ai.service.ts',
  'src/db/index.ts',
  'src/db/schema.ts',
  'package.json',
  '.env',
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}: Found`);
  } else {
    console.log(`❌ ${file}: NOT FOUND`);
    allChecks = false;
  }
}

console.log('');

// Summary
console.log('='.repeat(70));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(70));

if (allChecks) {
  console.log('✅ All checks passed! Your setup looks good.\n');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Test AI service: node test-ai-service.cjs');
  console.log('3. Open browser: http://localhost:5173/chat');
  console.log('4. Send a test message\n');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('🔑 To fix GEMINI_API_KEY:');
    console.log('   1. Get API key from: https://makersuite.google.com/app/apikey');
    console.log('   2. Add to server/.env: GEMINI_API_KEY=your_key_here');
    console.log('   3. Restart the server\n');
  }
  
  if (missingPackages.length > 0) {
    console.log('📦 To fix missing packages:');
    console.log('   Run: npm install\n');
  }
}

console.log('='.repeat(70) + '\n');
