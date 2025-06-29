#!/usr/bin/env node

/**
 * Check existing task submissions for debugging
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const TASK_ID = '686053e5069ed8946b40b12f';
const USER_ID = '686053e5069ed8946b40b12c';

async function checkSubmissions() {
  console.log('🔍 Checking Existing Submissions...\n');
  
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log('Today:', today);
    
    // Check progress for today
    console.log('1. Checking today\'s progress...');
    const progressResponse = await axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
    
    console.log('✅ Progress data received');
    console.log('   Tasks found:', progressResponse.data.data.tasks.length);
    
    // Find the specific task
    const taskProgress = progressResponse.data.data.tasks.find(t => t.task_id === TASK_ID);
    
    if (taskProgress) {
      console.log('\n📋 Task Progress for "Morning Princess Ritual":');
      console.log('   Completed:', taskProgress.is_completed);
      console.log('   Progress:', taskProgress.progress);
      
      console.log('\n📝 Subtask Status:');
      taskProgress.subtasks.forEach(subtask => {
        console.log(`   ${subtask.key}: ${subtask.completed ? '✅ Completed' : '❌ Not completed'}`);
        if (subtask.submission) {
          console.log(`      Submission ID: ${subtask.submission.id}`);
          console.log(`      Image URL: ${subtask.submission.image_url}`);
          console.log(`      Submitted At: ${subtask.submission.submitted_at}`);
        }
      });
    } else {
      console.log('❌ Task not found in progress');
    }
    
    // Also check all tasks to see their status
    console.log('\n2. Checking all tasks status...');
    const tasksResponse = await axios.get(`${BACKEND_URL}/api/tasks`);
    const task = tasksResponse.data.data.find(t => t.id === TASK_ID);
    
    if (task) {
      console.log('\n📋 Task Definition:');
      console.log('   Name:', task.name);
      console.log('   Active:', task.is_active);
      console.log('   Subtasks:');
      task.subtasks.forEach(subtask => {
        console.log(`      ${subtask.key}: ${subtask.name} (${subtask.time_limit} min limit)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to check submissions:');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data || error.message);
  }
}

checkSubmissions().catch(console.error);
