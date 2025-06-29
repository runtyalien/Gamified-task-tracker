const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing backend connection...');
    const response = await axios.get('http://localhost:3001/api/users/test-user', {
      timeout: 5000
    });
    console.log('✅ Backend is running!');
    console.log('User data:', response.data);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is not running. Please start it first.');
      console.log('Run: npm run dev');
    } else {
      console.log('❌ Error connecting to backend:', error.message);
    }
    return false;
  }
}

testConnection();
