#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testTaskRoutes() {
  console.log('🔍 Testing Task Routes...\n');
  
  try {
    // 1. Get all tasks
    console.log('1. Fetching all tasks...');
    const tasksResponse = await axios.get(`${BACKEND_URL}/api/tasks`);
    const tasks = tasksResponse.data.data;
    
    console.log(`✅ Found ${tasks.length} tasks:`);
    tasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ID: ${task.id || task._id} - Name: ${task.name}`);
    });
    
    // 2. Test individual task fetching
    console.log('\n2. Testing individual task fetching...');
    
    for (let i = 0; i < Math.min(3, tasks.length); i++) {
      const task = tasks[i];
      const taskId = task.id || task._id;
      
      try {
        const individualTaskResponse = await axios.get(`${BACKEND_URL}/api/tasks/${taskId}`);
        const individualTask = individualTaskResponse.data.data;
        
        console.log(`   ✅ Task ${taskId}: ${individualTask.name}`);
        
        if (individualTask.name !== task.name) {
          console.log(`   ⚠️  NAME MISMATCH! Expected: ${task.name}, Got: ${individualTask.name}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to fetch task ${taskId}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testTaskRoutes().catch(console.error);
