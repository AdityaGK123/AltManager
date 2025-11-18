// Test analytics generation to see actual error
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testAnalytics() {
  try {
    // First, login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com', // Replace with your test user
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test trends generation
    console.log('\n📊 Testing trends generation...');
    try {
      const trendsResponse = await axios.post(
        `${API_URL}/analysis/trends`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('✅ Trends generated:', trendsResponse.data);
    } catch (error) {
      console.error('❌ Trends error:', error.response?.data || error.message);
      console.error('Stack:', error.response?.data?.stack);
    }
    
    // Test blindspots generation
    console.log('\n🔍 Testing blindspots generation...');
    try {
      const blindspotsResponse = await axios.post(
        `${API_URL}/analysis/blindspots`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('✅ Blindspots generated:', blindspotsResponse.data);
    } catch (error) {
      console.error('❌ Blindspots error:', error.response?.data || error.message);
      console.error('Stack:', error.response?.data?.stack);
    }
    
    // Test progress generation
    console.log('\n📈 Testing progress generation...');
    try {
      const progressResponse = await axios.post(
        `${API_URL}/analysis/progress`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('✅ Progress generated:', progressResponse.data);
    } catch (error) {
      console.error('❌ Progress error:', error.response?.data || error.message);
      console.error('Stack:', error.response?.data?.stack);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAnalytics();
