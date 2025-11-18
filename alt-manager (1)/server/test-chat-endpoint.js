import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3000/api';

async function testChatEndpoints() {
  console.log('🧪 Testing Chat Endpoints\n');
  console.log('='.repeat(60));
  
  try {
    // First, we need to login to get a token
    console.log('\n1️⃣  Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    }).catch(async (error) => {
      if (error.response?.status === 401) {
        // User doesn't exist, try to register
        console.log('   User not found, attempting registration...');
        const registerResponse = await axios.post(`${API_URL}/auth/register`, {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        });
        return registerResponse;
      }
      throw error;
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login successful');
    
    // Set up axios with auth header
    const authAxios = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test GET /chat/conversations
    console.log('\n2️⃣  Testing GET /chat/conversations...');
    const conversationsResponse = await authAxios.get('/chat/conversations');
    console.log(`   ✅ Success - Found ${conversationsResponse.data.conversations.length} conversations`);
    
    // Test POST /chat/conversations
    console.log('\n3️⃣  Testing POST /chat/conversations...');
    const createResponse = await authAxios.post('/chat/conversations', {
      title: 'Test Conversation'
    });
    const conversationId = createResponse.data.conversation.id;
    console.log(`   ✅ Success - Created conversation ID: ${conversationId}`);
    
    // Test GET /chat/conversations/:id/messages
    console.log('\n4️⃣  Testing GET /chat/conversations/:id/messages...');
    const messagesResponse = await authAxios.get(`/chat/conversations/${conversationId}/messages`);
    console.log(`   ✅ Success - Found ${messagesResponse.data.messages.length} messages`);
    
    // Test POST /chat/conversations/:id/messages
    console.log('\n5️⃣  Testing POST /chat/conversations/:id/messages...');
    console.log('   ⏳ Sending message (this may take a few seconds for AI response)...');
    const sendMessageResponse = await authAxios.post(`/chat/conversations/${conversationId}/messages`, {
      content: 'Hello, this is a test message!'
    });
    console.log(`   ✅ Success - Message sent and AI responded`);
    console.log(`   📝 AI Response: ${sendMessageResponse.data.assistantMessage.content.substring(0, 100)}...`);
    
    // Test DELETE /chat/conversations/:id
    console.log('\n6️⃣  Testing DELETE /chat/conversations/:id...');
    const deleteResponse = await authAxios.delete(`/chat/conversations/${conversationId}`);
    console.log(`   ✅ Success - Conversation deleted`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All chat endpoint tests passed!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('   Details:', error.response.data.details);
    }
    console.log('\n' + '='.repeat(60));
    process.exit(1);
  }
}

testChatEndpoints();
