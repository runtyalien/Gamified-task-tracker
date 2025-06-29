require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

async function testAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-task-tracker');
    console.log('✅ Connected to MongoDB');
    
    const Task = require('./src/models/Task');
    const userId = '6860513bd7a1a73dedd38498';
    
    // Test finding tasks for user
    const tasks = await Task.find({ userId: userId });
    console.log(`Found ${tasks.length} tasks for user ${userId}`);
    
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.name}`);
      console.log(`   Key: ${task.key}`);
      console.log(`   Description: ${task.description}`);
      console.log(`   Subtasks: ${task.subtasks.length}`);
      console.log(`   Rewards: ${task.reward_rs}₹ / ${task.reward_xp}XP`);
      console.log('');
    });
    
    // Test API response format
    const apiResponse = {
      success: true,
      data: tasks.map(task => ({
        _id: task._id,
        name: task.name,
        key: task.key,
        description: task.description,
        subtasks: task.subtasks,
        reward_rs: task.reward_rs,
        reward_xp: task.reward_xp,
        is_active: task.is_active,
        userId: task.userId
      })),
      message: 'Tasks retrieved successfully'
    };
    
    console.log('API Response sample (first task):');
    console.log(JSON.stringify(apiResponse.data[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAPI();
