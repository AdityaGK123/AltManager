/**
 * Test AI Response Pipeline
 * This script tests if the AI service is working correctly
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function testAI() {
  console.log('🧪 Testing AI Response Pipeline\n');

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    return;
  }
  console.log('✅ GEMINI_API_KEY found:', apiKey.substring(0, 10) + '...\n');

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    console.log('📤 Sending test prompt to Gemini...');
    const prompt = 'You are a career manager. A user asks: "I want to start my career in AI/ML engineering, could you give me a perfect guidance to become one". Respond in 2-3 sentences.';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ AI Response received:\n');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));
    console.log('\n🎉 AI Service is working correctly!');

  } catch (error) {
    console.error('❌ AI Service Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAI();
