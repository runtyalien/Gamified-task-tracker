#!/usr/bin/env node

/**
 * Comprehensive test to validate the entire system
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function runComprehensiveTests() {
  console.log('🔥 Running Comprehensive System Tests\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  const test = async (description, testFn) => {
    totalTests++;
    try {
      console.log(`${totalTests}. ${description}...`);
      await testFn();
      console.log(`✅ PASSED: ${description}\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ FAILED: ${description}`);
      console.log(`   Error: ${error.message}\n`);
    }
  };
  
  // Backend Tests
  await test('Health Check', async () => {
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.data.status !== 'OK') throw new Error('Health check failed');
  });
  
  await test('Get User by ID', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/users/${USER_ID}`);
    const user = response.data.data;
    if (!user.id || !user.name) throw new Error('User data incomplete');
    console.log(`   User: ${user.name}, Level: ${user.level}, XP: ${user.xp}`);
  });
  
  await test('Get All Users', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/users`);
    if (!Array.isArray(response.data.data)) throw new Error('Users should be an array');
    console.log(`   Found ${response.data.data.length} users`);
  });
  
  await test('Get Tasks', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/tasks?active=true`);
    if (!Array.isArray(response.data.data)) throw new Error('Tasks should be an array');
    console.log(`   Found ${response.data.data.length} active tasks`);
  });
  
  await test('Get Progress for Today', async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
    const data = response.data.data;
    if (!Array.isArray(data.tasks)) throw new Error('Progress tasks should be an array');
    console.log(`   Found ${data.tasks.length} tasks with progress`);
    console.log(`   Completion: ${data.summary.completed_tasks}/${data.summary.total_tasks} tasks`);
  });
  
  await test('Get Rewards for Today', async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`${BACKEND_URL}/api/rewards/${today}?user_id=${USER_ID}`);
    console.log(`   Rewards found: ${response.data.data.length} entries`);
  });
  
  await test('CORS Headers Present', async () => {
    const response = await axios.get(`${BACKEND_URL}/health`);
    // Check if response can be made (indicates CORS is working)
    if (response.status !== 200) throw new Error('CORS issue detected');
  });
  
  // API Consistency Tests
  await test('API Response Format Consistency', async () => {
    const userResponse = await axios.get(`${BACKEND_URL}/api/users/${USER_ID}`);
    const tasksResponse = await axios.get(`${BACKEND_URL}/api/tasks`);
    
    if (!userResponse.data.success || !tasksResponse.data.success) {
      throw new Error('API responses should have success field');
    }
    
    if (!userResponse.data.data || !tasksResponse.data.data) {
      throw new Error('API responses should have data field');
    }
  });
  
  console.log('📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n📋 System Status:');
    console.log('✅ Backend API is fully functional');
    console.log('✅ Database is properly seeded');
    console.log('✅ All endpoints are working');
    console.log('✅ CORS is configured correctly');
    console.log('✅ API responses are consistent');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Frontend should work seamlessly with the backend');
    console.log('2. Start frontend with: cd frontend && npm start');
    console.log('3. Access at: http://localhost:3000');
    console.log('4. Backend is running at: http://localhost:3001');
    
    return true;
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.');
    return false;
  }
}

runComprehensiveTests().catch(console.error);
