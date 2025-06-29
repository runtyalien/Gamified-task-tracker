#!/usr/bin/env node

const axios = require('axios');

// Install axios if not present
try {
  require('axios');
} catch (error) {
  console.log('Please install axios for API testing: npm install axios');
  process.exit(1);
}

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testAPI() {
  console.log('🧪 Testing Gamified Task Tracker API');
  console.log(`🔗 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing Health Check...');
    const healthResponse = await api.get('/health');
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test 2: Get All Tasks
    console.log('\n2️⃣  Testing Get All Tasks...');
    const tasksResponse = await api.get('/api/tasks');
    console.log(`✅ Found ${tasksResponse.data.data.length} tasks`);
    
    if (tasksResponse.data.data.length === 0) {
      console.log('⚠️  No tasks found. Consider running the seed script first: npm run seed');
      return;
    }
    
    const firstTask = tasksResponse.data.data[0];
    console.log(`   📋 Sample task: ${firstTask.name}`);
    
    // Test 3: Get All Users
    console.log('\n3️⃣  Testing Get All Users...');
    const usersResponse = await api.get('/api/users');
    console.log(`✅ Found ${usersResponse.data.data.length} users`);
    
    if (usersResponse.data.data.length === 0) {
      console.log('⚠️  No users found. Consider running the seed script first: npm run seed');
      return;
    }
    
    const firstUser = usersResponse.data.data[0];
    console.log(`   👤 Sample user: ${firstUser.name} (Level ${firstUser.level})`);
    
    // Test 4: Get User by ID
    console.log('\n4️⃣  Testing Get User by ID...');
    const userResponse = await api.get(`/api/users/${firstUser.id}`);
    console.log(`✅ User details: ${userResponse.data.data.name} - ${userResponse.data.data.xp}XP`);
    
    // Test 5: Get Progress for Today
    console.log('\n5️⃣  Testing Get Progress for Today...');
    const today = new Date().toISOString().split('T')[0];
    const progressResponse = await api.get(`/api/progress/${today}?user_id=${firstUser.id}`);
    console.log(`✅ Progress loaded for ${today}`);
    console.log(`   📊 Task completion: ${progressResponse.data.data.summary.completed_tasks}/${progressResponse.data.data.summary.total_tasks}`);
    
    // Test 6: Get Rewards for Today
    console.log('\n6️⃣  Testing Get Rewards for Today...');
    const rewardsResponse = await api.get(`/api/rewards/${today}?user_id=${firstUser.id}`);
    console.log(`✅ Rewards loaded for ${today}`);
    console.log(`   🎁 Total rewards: ${rewardsResponse.data.data.summary.total_rewards}`);
    
    // Test 7: Get Leaderboard
    console.log('\n7️⃣  Testing Get Leaderboard...');
    const leaderboardResponse = await api.get('/api/users/leaderboard?limit=5');
    console.log(`✅ Leaderboard loaded with ${leaderboardResponse.data.data.rankings.length} users`);
    console.log(`   🏆 Top user: ${leaderboardResponse.data.data.rankings[0]?.name} (${leaderboardResponse.data.data.rankings[0]?.xp}XP)`);
    
    // Test 8: Test S3 Pre-sign (will fail without AWS credentials, but tests endpoint)
    console.log('\n8️⃣  Testing S3 Pre-sign Endpoint...');
    try {
      const s3Response = await api.post('/api/s3/presign', {
        fileName: 'test-image.jpg',
        fileType: 'image/jpeg',
        userId: firstUser.id
      });
      console.log('✅ S3 pre-sign endpoint working');
    } catch (s3Error) {
      if (s3Error.response && s3Error.response.status === 500) {
        console.log('⚠️  S3 pre-sign failed (expected without AWS credentials)');
      } else {
        console.log('❌ S3 pre-sign error:', s3Error.message);
      }
    }
    
    console.log('\n🎉 API testing completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Configure AWS S3 credentials in .env file');
    console.log('   2. Test image upload flow with a frontend application');
    console.log('   3. Submit some subtasks to test the reward system');
    console.log('   4. Monitor the MongoDB database for data changes');
    
  } catch (error) {
    console.error('\n❌ API test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data.error}`);
    } else if (error.request) {
      console.error('   No response received. Is the server running?');
      console.error(`   Try: npm run dev`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Run the tests
testAPI();
