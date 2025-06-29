#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function testProgressPersistence() {
  console.log('🔍 Testing Progress Persistence...\n');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Today\'s date:', today);
    
    // 1. Get today's progress
    console.log('1. Fetching today\'s progress...');
    const progressResponse = await axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
    const progressData = progressResponse.data.data;
    
    console.log(`✅ Found progress for ${progressData.tasks.length} tasks:`);
    
    progressData.tasks.forEach((task, index) => {
      console.log(`\n${index + 1}. Task: ${task.task_name} (${task.task_id})`);
      console.log(`   Completed: ${task.is_completed}`);
      console.log(`   Progress: ${task.progress.completed}/${task.progress.total}`);
      
      if (task.subtasks && task.subtasks.length > 0) {
        console.log('   Subtasks:');
        task.subtasks.forEach((subtask, subIndex) => {
          console.log(`     ${subIndex + 1}. ${subtask.name}: ${subtask.completed ? '✅' : '❌'}`);
          if (subtask.completed && subtask.submission) {
            console.log(`        📷 Image: ${subtask.submission.image_url ? 'Yes' : 'No'}`);
            console.log(`        🔗 Presigned: ${subtask.submission.presigned_url ? 'Yes' : 'No'}`);
            console.log(`        ⏰ Submitted: ${subtask.submission.submitted_at}`);
          }
        });
      }
    });
    
    // 2. Check specific task that should have images
    console.log('\n2. Checking for tasks with submissions...');
    const tasksWithSubmissions = progressData.tasks.filter(task => 
      task.subtasks && task.subtasks.some(st => st.completed && st.submission)
    );
    
    console.log(`Found ${tasksWithSubmissions.length} tasks with submissions:`);
    tasksWithSubmissions.forEach(task => {
      console.log(`- ${task.task_name}: ${task.subtasks.filter(st => st.completed).length} completed subtasks`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testProgressPersistence().catch(console.error);
