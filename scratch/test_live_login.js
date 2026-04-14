const axios = require('axios');

async function testLogin() {
  const url = 'https://auth-gateway-746659778850.us-central1.run.app/api/auth/login';
  const credentials = {
    email: 'ithrivebusinessnetworks@gmail.com',
    password: 'Admin@2026'
  };

  try {
    console.log(`Attempting login to ${url}...`);
    const response = await axios.post(url, credentials);
    console.log('Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Login failed.');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
