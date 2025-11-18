require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not set');
      return;
    }
    
    console.log('\n🔍 Fetching available Gemini models...\n');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list models
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + apiKey);
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available models:\n');
      data.models.forEach(model => {
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`  - ${model.name}`);
          console.log(`    Display Name: ${model.displayName}`);
          console.log(`    Description: ${model.description}`);
          console.log('');
        }
      });
    } else {
      console.error('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
