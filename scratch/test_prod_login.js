const axios = require('axios');

async function testLogin() {
  const url = 'https://auth-gateway-746659778850.us-central1.run.app/api/auth/login';
  const data = {
    email: 'ke.africabi@gmail.com',
    password: 'Admin@2026'
  };

  console.log('Testing login to:', url);
  try {
    const response = await axios.post(url, data);
    console.log('Login Succeeded!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Login Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

testLogin();
