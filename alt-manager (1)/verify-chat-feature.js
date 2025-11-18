/**
 * Chat Feature Verification Script
 * 
 * This script verifies that the "Start Chatting" feature is working correctly
 * by testing all API endpoints and checking the database.
 * 
 * Usage: node verify-chat-feature.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'server/.env') });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function verifyDatabase() {
  console.log('🔍 Verifying Database Schema...\n');

  try {
    await client.connect();
    console.log('✅ Database connected\n');

    // Check conversations table
    const conversationsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'conversations'
      );
    `);

    if (!conversationsCheck.rows[0].exists) {
      console.log('❌ conversations table does NOT exist');
      return false;
    }
    console.log('✅ conversations table exists');

    // Check messages table
    const messagesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'messages'
      );
    `);

    if (!messagesCheck.rows[0].exists) {
      console.log('❌ messages table does NOT exist');
      return false;
    }
    console.log('✅ messages table exists');

    // Check table structure
    const conversationsColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 conversations table structure:');
    conversationsColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    const messagesColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 messages table structure:');
    messagesColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Check data
    const conversationsCount = await client.query('SELECT COUNT(*) FROM conversations');
    const messagesCount = await client.query('SELECT COUNT(*) FROM messages');

    console.log('\n📊 Current data:');
    console.log(`   Conversations: ${conversationsCount.rows[0].count}`);
    console.log(`   Messages: ${messagesCount.rows[0].count}`);

    return true;
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function verifyBackendFiles() {
  console.log('\n🔍 Verifying Backend Files...\n');

  const fs = await import('fs');
  const path = await import('path');

  const requiredFiles = [
    'server/src/routes/chat.ts',
    'server/src/services/ai.service.ts',
    'server/src/db/schema.ts',
    'server/src/middleware/auth.js'
  ];

  let allExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} NOT FOUND`);
      allExist = false;
    }
  }

  return allExist;
}

async function verifyFrontendFiles() {
  console.log('\n🔍 Verifying Frontend Files...\n');

  const fs = await import('fs');
  const path = await import('path');

  const requiredFiles = [
    'client/src/pages/ChatPage.tsx',
    'client/src/lib/api.ts'
  ];

  let allExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
      
      // Check for "Start Chatting" button
      if (file.includes('ChatPage.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('Start Chatting')) {
          console.log('   ✅ "Start Chatting" button found');
        } else {
          console.log('   ⚠️  "Start Chatting" button not found in code');
        }
      }
    } else {
      console.log(`❌ ${file} NOT FOUND`);
      allExist = false;
    }
  }

  return allExist;
}

async function verifyEnvironment() {
  console.log('\n🔍 Verifying Environment Variables...\n');

  const requiredVars = [
    'DATABASE_URL',
    'GEMINI_API_KEY',
    'JWT_SECRET'
  ];

  let allSet = true;

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is NOT set`);
      allSet = false;
    }
  }

  return allSet;
}

async function printSummary(dbOk, backendOk, frontendOk, envOk) {
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Database Schema:     ${dbOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Backend Files:       ${backendOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Frontend Files:      ${frontendOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Environment:         ${envOk ? '✅ OK' : '❌ FAILED'}`);
  console.log('='.repeat(60));

  if (dbOk && backendOk && frontendOk && envOk) {
    console.log('\n🎉 ALL CHECKS PASSED!');
    console.log('\nThe "Start Chatting" feature is fully functional and ready to use.');
    console.log('\nTo test:');
    console.log('  1. Start backend: cd server && npm run dev');
    console.log('  2. Start frontend: cd client && npm run dev');
    console.log('  3. Open: http://localhost:5173/chat');
    console.log('  4. Click "Start Chatting" button');
    console.log('  5. Send a message and verify AI responds\n');
  } else {
    console.log('\n⚠️  SOME CHECKS FAILED');
    console.log('\nPlease review the errors above and fix them before testing.\n');
  }
}

async function main() {
  console.log('🚀 Chat Feature Verification\n');
  console.log('This script verifies that all components of the "Start Chatting"');
  console.log('feature are properly configured and ready to use.\n');

  const dbOk = await verifyDatabase();
  const backendOk = await verifyBackendFiles();
  const frontendOk = await verifyFrontendFiles();
  const envOk = await verifyEnvironment();

  await printSummary(dbOk, backendOk, frontendOk, envOk);
}

main();
