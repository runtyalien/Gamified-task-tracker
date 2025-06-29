#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function testProgressAPI() {
  console.log('🧪 Testing Progress API Directly...\n');
  
  try {
    const today = '2025-06-29';
    console.log(`Requesting: ${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
    
    const response = await axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
    
    console.log('✅ API Response received');
    console.log('Response status:', response.status);
    console.log('Response data structure:', Object.keys(response.data));
    
    if (response.data.data && response.data.data.tasks) {
      const tasks = response.data.data.tasks;
      console.log(`\n📋 Found ${tasks.length} tasks in progress data`);
      
      // Find Wellness Princess Path specifically
      const wellnessTask = tasks.find(t => t.task_name === 'Wellness Princess Path');
      
      if (wellnessTask) {
        console.log('\n🎯 Wellness Princess Path found:');
        console.log(JSON.stringify(wellnessTask, null, 2));
      } else {
        console.log('\n❌ Wellness Princess Path not found in tasks');
        console.log('Available tasks:', tasks.map(t => t.task_name));
      }
    } else {
      console.log('❌ Unexpected response structure');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testProgressAPI().catch(console.error);
