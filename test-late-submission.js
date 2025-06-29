#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function testLateSubmission() {
  console.log('🕐 Testing Late Submission Flow...\n');
  
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    console.log('Testing for date:', today);
    
    // 1. Check progress before submission
    console.log('\n1. Getting current progress...');
    const progressBefore = await axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
    const wellnessTask = progressBefore.data.data.tasks.find(t => t.task_key === 'wellness-princess-path');
    
    if (!wellnessTask) {
      console.log('❌ Wellness Princess Path task not found');
      return;
    }
    
    console.log(`Found task: ${wellnessTask.task_name}`);
    console.log('Current subtasks status:');
    wellnessTask.subtasks.forEach(st => {
      const status = st.completed 
        ? (st.submission?.is_valid ? '✅ Completed (Valid)' : '⚠️ Completed (Late)') 
        : '❌ Incomplete';
      console.log(`  - ${st.name}: ${status}`);
    });
    
    // 2. Try to submit a breakfast (time limit: 720 minutes = 12:00 PM)
    console.log('\n2. Testing late submission for breakfast...');
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    console.log(`Current time: ${currentTime.toLocaleTimeString()}`);
    console.log(`Breakfast deadline: 12:00 PM (720 minutes from midnight)`);
    
    // Check if breakfast is already submitted
    const breakfastSubtask = wellnessTask.subtasks.find(st => st.key === 'breakfast');
    if (breakfastSubtask?.completed) {
      console.log('✅ Breakfast already submitted');
      if (breakfastSubtask.submission) {
        console.log(`   Status: ${breakfastSubtask.submission.is_valid ? 'Valid' : 'Late'}`);
        console.log(`   Message: ${breakfastSubtask.submission.validation_message}`);
      }
    } else {
      console.log('❌ Breakfast not yet submitted');
      console.log(`   Can submit: Yes (will be marked as ${currentHour >= 12 ? 'late' : 'on-time'})`);
    }
    
    // 3. Check reward eligibility logic
    console.log('\n3. Checking reward eligibility logic...');
    const completedSubtasks = wellnessTask.subtasks.filter(st => st.completed);
    const validSubmissions = completedSubtasks.filter(st => st.submission?.is_valid);
    
    console.log(`Total subtasks: ${wellnessTask.subtasks.length}`);
    console.log(`Completed subtasks: ${completedSubtasks.length}`);
    console.log(`Valid submissions: ${validSubmissions.length}`);
    console.log(`Task complete: ${wellnessTask.is_completed}`);
    console.log(`Reward eligible: ${wellnessTask.is_reward_eligible !== false ? 'Yes' : 'No'}`);
    
    if (wellnessTask.is_completed) {
      console.log(`\n🎯 Task Completion Status:`);
      if (wellnessTask.is_reward_eligible !== false) {
        console.log(`✅ All subtasks completed on time - Rewards earned!`);
      } else {
        console.log(`⚠️ Task complete but some submissions were late - No rewards`);
      }
    }
    
    console.log('\n✅ Late submission flow test completed!');
    
  } catch (error) {
    console.error('❌ Error testing late submission:', error.response?.data?.error || error.message);
  }
}

if (require.main === module) {
  testLateSubmission();
}

module.exports = { testLateSubmission };
