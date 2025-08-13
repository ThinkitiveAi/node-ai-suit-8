const axios = require('axios');

async function testNgrokConnection() {
  try {
    // Replace with your actual ngrok URL
    const ngrokUrl = process.env.NGROK_URL || 'https://your-ngrok-url.ngrok-free.app';
    
    console.log('🔍 Testing ngrok connection...');
    console.log(`📡 URL: ${ngrokUrl}`);
    
    // Test health endpoint
    const healthResponse = await axios.get(`${ngrokUrl}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test CORS preflight
    const corsResponse = await axios.options(`${ngrokUrl}/health`, {
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS preflight passed:', corsResponse.headers);
    
    console.log('🎉 All tests passed! Your API is accessible via ngrok.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
  }
}

testNgrokConnection(); 