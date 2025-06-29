#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const USER_ID = 'test-user';

async function checkSystemStatus() {
  console.log('🔍 Checking Gamified Task Tracker System Status...\n');

  try {
    // 1. Test backend connection
    console.log('1. Testing backend connection...');
    await axios.get(`${BASE_URL}/api/users/${USER_ID}`, { timeout: 5000 });
    console.log('✅ Backend is running and responsive\n');

    // 2. Check database connection
    console.log('2. Checking database and tasks...');
    const tasksResponse = await axios.get(`${BASE_URL}/api/tasks`);
    const tasks = tasksResponse.data.data;
    console.log(`✅ Database connected - ${tasks.length} tasks available\n`);

    // 3. Check today's progress
    console.log('3. Checking today\'s progress...');
    const today = new Date().toISOString().split('T')[0];
    const progressResponse = await axios.get(`${BASE_URL}/api/progress/${USER_ID}?date=${today}`);
    const progress = progressResponse.data.data;
    
    const totalCompletedSubtasks = progress.reduce((sum, task) => sum + task.completed_subtasks.length, 0);
    console.log(`✅ Progress API working - ${totalCompletedSubtasks} subtasks completed today\n`);

    // 4. Show system information
    console.log('📊 System Information:');
    console.log(`- Date: ${today}`);
    console.log(`- User ID: ${USER_ID}`);
    console.log(`- Tasks available: ${tasks.length}`);
    console.log(`- Completed subtasks today: ${totalCompletedSubtasks}`);
    
    if (totalCompletedSubtasks > 0) {
      console.log('\n📸 Completed subtasks with images:');
      progress.forEach(task => {
        task.completed_subtasks.forEach(subtask => {
          if (subtask.submission && subtask.submission.image_url) {
            console.log(`  - ${task.task_name} → ${subtask.subtask_key}: ${subtask.submission.image_url}`);
          }
        });
      });
    }

    console.log('\n🎉 System Status: ALL SYSTEMS GO!');
    console.log('\n📱 To test image upload:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Navigate to any task (e.g., Morning Routine)');
    console.log('3. Click on a subtask and upload an image');
    console.log('4. Submit the subtask');
    console.log('5. Refresh the page to verify persistence');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running!');
      console.log('💡 Start it with: npm run dev');
    } else if (error.response) {
      console.log(`❌ API Error: ${error.response.status} - ${error.response.statusText}`);
      console.log(error.response.data);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

// Run the check
checkSystemStatus();
