#!/usr/bin/env node

/**
 * Test task submission API to debug the 500 error
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const TASK_ID = '686053e5069ed8946b40b12f';
const SUBTASK_KEY = 'brush';
const USER_ID = '686053e5069ed8946b40b12c';

async function testTaskSubmission() {
  console.log('🧪 Testing Task Submission API...\n');
  
  try {
    // First, let's check if the task exists
    console.log('1. Checking if task exists...');
    const taskResponse = await axios.get(`${BACKEND_URL}/api/tasks/${TASK_ID}`);
    console.log('✅ Task found:', taskResponse.data.data.name);
    console.log('   Subtasks:', taskResponse.data.data.subtasks.map(s => s.key).join(', '));
    
    // Check if the subtask key exists
    const hasSubtask = taskResponse.data.data.subtasks.some(s => s.key === SUBTASK_KEY);
    if (!hasSubtask) {
      console.log(`❌ Subtask "${SUBTASK_KEY}" not found in task`);
      console.log('   Available subtasks:', taskResponse.data.data.subtasks.map(s => s.key));
      return;
    }
    console.log(`✅ Subtask "${SUBTASK_KEY}" found`);
    
    // Check if user exists
    console.log('2. Checking if user exists...');
    const userResponse = await axios.get(`${BACKEND_URL}/api/users/${USER_ID}`);
    console.log('✅ User found:', userResponse.data.data.name);
    
    // Test task submission
    console.log('3. Testing task submission...');
    const submissionData = {
      image_url: 'https://example.com/test-image.jpg',
      submitted_at: new Date().toISOString(),
      user_id: USER_ID
    };
    
    console.log('   Submission data:', JSON.stringify(submissionData, null, 2));
    console.log('   URL:', `${BACKEND_URL}/api/tasks/${TASK_ID}/subtasks/${SUBTASK_KEY}/submit`);
    
    const submitResponse = await axios.post(
      `${BACKEND_URL}/api/tasks/${TASK_ID}/subtasks/${SUBTASK_KEY}/submit`,
      submissionData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Task submission successful!');
    console.log('   Response:', JSON.stringify(submitResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 400) {
        console.log('\n💡 This might be a validation error');
      } else if (error.response.status === 500) {
        console.log('\n💡 This is a server error - check backend logs');
      } else if (error.response.status === 404) {
        console.log('\n💡 Route not found - check API endpoint');
      }
    } else {
      console.error('   Network error:', error.message);
    }
  }
}

testTaskSubmission().catch(console.error);
