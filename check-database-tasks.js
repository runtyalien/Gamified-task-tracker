#!/usr/bin/env node

/**
 * Check database tasks directly
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./src/models/Task');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-task-tracker');
    console.log('Connected to MongoDB');
    
    // Get all tasks from database
    const tasks = await Task.find({}).lean();
    
    console.log(`\n📋 Found ${tasks.length} tasks in database:`);
    
    tasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.name}`);
      console.log(`   ID: ${task._id}`);
      console.log(`   Key: ${task.key}`);
      console.log(`   Subtasks: ${task.subtasks.length} items`);
      task.subtasks.forEach(st => {
        console.log(`     - ${st.name} (${st.key})`);
      });
      console.log(`   Rewards: ₹${task.reward_rs}, ${task.reward_xp} XP`);
      console.log(`   Active: ${task.is_active}`);
    });
    
    // Test finding by ID
    if (tasks.length > 0) {
      const firstTaskId = tasks[0]._id;
      console.log(`\n🔍 Testing findById with first task ID: ${firstTaskId}`);
      
      const foundTask = await Task.findById(firstTaskId);
      if (foundTask) {
        console.log(`✅ Found task: ${foundTask.name}`);
      } else {
        console.log('❌ Could not find task by ID');
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkDatabase();
