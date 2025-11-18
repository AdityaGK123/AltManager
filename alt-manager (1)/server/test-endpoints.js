/**
 * API Endpoint Testing Script
 * Tests all critical endpoints to identify 500 errors
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

console.log('\n🧪 ALT Manager - API Endpoint Testing\n');
console.log('='.repeat(60));
console.log(`Testing against: ${API_URL}\n`);

// Test results storage
const results = {
  passed: [],
  failed: [],
  skipped: []
};

/**
 * Test a single endpoint
 */
async function testEndpoint(name, method, path, options = {}) {
  try {
    const config = {
      method,
      url: `${API_URL}${path}`,
      timeout: 5000,
      validateStatus: () => true, // Don't throw on any status
      ...options
    };

    const startTime = Date.now();
    const response = await axios(config);
    const duration = Date.now() - startTime;

    const status = response.status;
    const isSuccess = status >= 200 && status < 300;
    const isClientError = status >= 400 && status < 500;
    const isServerError = status >= 500;

    let icon = '✅';
    let statusText = 'PASS';
    
    if (isServerError) {
      icon = '❌';
      statusText = 'FAIL (500)';
      results.failed.push({ name, status, path });
    } else if (isClientError && !options.expectAuth) {
      icon = '⚠️ ';
      statusText = 'WARN';
    } else if (isSuccess) {
      results.passed.push({ name, status, path });
    }

    console.log(`${icon} ${name.padEnd(35)} ${status} ${statusText.padEnd(12)} (${duration}ms)`);
    
    if (isServerError && response.data) {
      console.log(`   Error: ${JSON.stringify(response.data)}`);
    }

    return { success: !isServerError, status, data: response.data };
  } catch (error) {
    console.log(`❌ ${name.padEnd(35)} ERROR: ${error.message}`);
    results.failed.push({ name, error: error.message, path });
    return { success: false, error: error.message };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('📋 Testing Public Endpoints:\n');
  
  // Health check
  await testEndpoint('Health Check', 'GET', '/health');
  
  console.log('\n📋 Testing Auth Endpoints (expect 400/401):\n');
  
  // Auth endpoints (should return 400/401, not 500)
  await testEndpoint('Login (no credentials)', 'POST', '/auth/login', { 
    expectAuth: true,
    data: {} 
  });
  
  await testEndpoint('Register (no data)', 'POST', '/auth/register', { 
    expectAuth: true,
    data: {} 
  });
  
  console.log('\n📋 Testing Protected Endpoints (expect 401, not 500):\n');
  
  // Protected endpoints without token (should return 401, not 500)
  await testEndpoint('User Profile (no auth)', 'GET', '/user/profile', { 
    expectAuth: true 
  });
  
  await testEndpoint('Skills (no auth)', 'GET', '/skills', { 
    expectAuth: true 
  });
  
  await testEndpoint('Goals (no auth)', 'GET', '/goals', { 
    expectAuth: true 
  });
  
  await testEndpoint('Moments (no auth)', 'GET', '/moments', { 
    expectAuth: true 
  });
  
  await testEndpoint('Achievements (no auth)', 'GET', '/achievements', { 
    expectAuth: true 
  });
  
  await testEndpoint('Habits (no auth)', 'GET', '/habits', { 
    expectAuth: true 
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed (500 errors): ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Endpoints:\n');
    results.failed.forEach(({ name, status, path, error }) => {
      console.log(`   • ${name}`);
      console.log(`     Path: ${path}`);
      if (status) console.log(`     Status: ${status}`);
      if (error) console.log(`     Error: ${error}`);
    });
    
    console.log('\n🔧 Troubleshooting Steps:\n');
    console.log('1. Check if backend server is running on port 3000');
    console.log('2. Verify .env file has all required variables');
    console.log('3. Check server console logs for detailed errors');
    console.log('4. Run: node diagnose-500-errors.js');
    console.log('5. Ensure database is connected and tables exist');
  } else {
    console.log('\n✅ All endpoints responding correctly!');
    console.log('\nNote: 401 errors are expected for protected routes without auth.');
    console.log('The important thing is NO 500 errors occurred.');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Check if server is reachable first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/health`, { timeout: 3000 });
    return true;
  } catch (error) {
    console.log(`❌ Cannot reach server at ${BASE_URL}`);
    console.log(`   Error: ${error.message}\n`);
    console.log('🔧 Make sure the backend server is running:');
    console.log('   cd server && npm run dev\n');
    return false;
  }
}

// Main execution
(async () => {
  const serverReachable = await checkServer();
  if (serverReachable) {
    await runTests();
  }
})();
