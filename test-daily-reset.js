#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function testDailyResetSystem() {
  console.log('🧪 Testing Daily Reset System...\n');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Check current job status
    console.log('1. Checking reset job status...');
    try {
      const jobStatus = await axios.get(`${BACKEND_URL}/api/admin/job-status`);
      console.log('✅ Reset job status:', jobStatus.data.data);
    } catch (error) {
      console.log('⚠️ Could not get job status:', error.response?.data?.error || error.message);
    }
    
    // 2. Get current progress
    console.log('\n2. Getting current progress...');
    const progressBefore = await axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
    const tasksBefore = progressBefore.data.data.tasks;
    
    console.log(`Found ${tasksBefore.length} tasks:`);
    tasksBefore.forEach((task, index) => {
      const completed = task.subtasks.filter(st => st.completed).length;
      console.log(`  ${index + 1}. ${task.task_name}: ${completed}/${task.subtasks.length} completed`);
    });
    
    // 3. Check reset statistics
    console.log('\n3. Getting reset statistics...');
    try {
      const resetStats = await axios.get(`${BACKEND_URL}/api/admin/reset-stats?days=7`);
      console.log('✅ Reset stats for last 7 days:', resetStats.data.data);
    } catch (error) {
      console.log('⚠️ Could not get reset stats:', error.response?.data?.error || error.message);
    }
    
    // 4. Test manual reset (WARNING: This will reset current progress!)
    const shouldTestManualReset = process.argv.includes('--manual-reset');
    
    if (shouldTestManualReset) {
      console.log('\n4. Testing manual reset...');
      console.log('⚠️ WARNING: This will reset current daily progress!');
      
      try {
        const resetResult = await axios.post(`${BACKEND_URL}/api/admin/reset-daily`);
        console.log('✅ Manual reset completed:', resetResult.data.data);
        
        // Check progress after reset
        console.log('\n5. Checking progress after reset...');
        const progressAfter = await axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
        const tasksAfter = progressAfter.data.data.tasks;
        
        console.log(`Progress after reset:`);
        tasksAfter.forEach((task, index) => {
          const completed = task.subtasks.filter(st => st.completed).length;
          console.log(`  ${index + 1}. ${task.task_name}: ${completed}/${task.subtasks.length} completed`);
        });
        
      } catch (error) {
        console.log('❌ Manual reset failed:', error.response?.data?.error || error.message);
      }
    } else {
      console.log('\n4. Skipping manual reset test (use --manual-reset flag to test)');
    }
    
    // 5. Test daily progress endpoint
    console.log('\n5. Testing daily progress endpoint...');
    try {
      const dailyProgress = await axios.get(`${BACKEND_URL}/api/admin/daily-progress/${USER_ID}/${today}`);
      console.log('✅ Daily progress data available');
      console.log('Daily stats:', dailyProgress.data.data.daily_stats);
    } catch (error) {
      console.log('⚠️ Daily progress endpoint error:', error.response?.data?.error || error.message);
    }
    
    console.log('\n✅ Daily reset system test completed!');
    console.log('\n📋 What happens at midnight IST:');
    console.log('   1. Previous day\'s rewards are awarded to users');
    console.log('   2. User XP and RS balances are updated');
    console.log('   3. New day starts with fresh task progress');
    console.log('   4. Old data (30+ days) is cleaned up');
    console.log('\n🔧 Manual controls:');
    console.log(`   - Manual reset: POST ${BACKEND_URL}/api/admin/reset-daily`);
    console.log(`   - Reset stats: GET ${BACKEND_URL}/api/admin/reset-stats`);
    console.log(`   - Job status: GET ${BACKEND_URL}/api/admin/job-status`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testDailyResetSystem();
}

module.exports = { testDailyResetSystem };
