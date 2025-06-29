#!/usr/bin/env node

/**
 * Quick test script to verify backend and frontend integration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function testBackend() {
  console.log('🧪 Testing Backend API...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', health.data);
    
    // Test get user
    console.log('\n2. Testing get user endpoint...');
    const user = await axios.get(`${BASE_URL}/api/users/${USER_ID}`);
    console.log('✅ Get user passed:', user.data.data);
    
    // Test get tasks progress
    console.log('\n3. Testing progress endpoint...');
    const today = new Date().toISOString().split('T')[0];
    const progress = await axios.get(`${BASE_URL}/api/progress/${today}?user_id=${USER_ID}`);
    console.log('✅ Progress endpoint passed. Tasks found:', progress.data.data.tasks.length);
    
    // Test get tasks
    console.log('\n4. Testing tasks endpoint...');
    const tasks = await axios.get(`${BASE_URL}/api/tasks?active=true`);
    console.log('✅ Tasks endpoint passed. Tasks found:', tasks.data.data.length);
    
    console.log('\n🎉 All backend tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Backend test failed:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting integration tests...\n');
  
  const backendPassed = await testBackend();
  
  if (backendPassed) {
    console.log('\n✅ Backend is working correctly!');
    console.log('🌐 You can now start the frontend with: npm start (in the frontend directory)');
    console.log('📱 Frontend should be available at: http://localhost:3000');
  } else {
    console.log('\n❌ Backend tests failed. Please check the server logs.');
  }
}

main().catch(console.error);
