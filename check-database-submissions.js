#!/usr/bin/env node

/**
 * Check submissions directly in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const TaskSubmission = require('./src/models/TaskSubmission');
const User = require('./src/models/User');
const Task = require('./src/models/Task');

const USER_ID = '686053e5069ed8946b40b12c';

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-task-tracker');
    console.log('Connected to MongoDB');
    
    // Check if user exists
    const user = await User.findById(USER_ID);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log(`✅ User found: ${user.name}`);
    
    // Check all submissions for this user
    const allSubmissions = await TaskSubmission.find({ user_id: USER_ID }).populate('task_id');
    console.log(`📄 Total submissions for user: ${allSubmissions.length}`);
    
    if (allSubmissions.length > 0) {
      console.log('\n📋 All submissions:');
      allSubmissions.forEach((sub, index) => {
        console.log(`${index + 1}. Task: ${sub.task_id.name}`);
        console.log(`   Subtask: ${sub.subtask_key}`);
        console.log(`   Date: ${sub.date.toISOString().split('T')[0]}`);
        console.log(`   Image URL: ${sub.image_url ? 'Present' : 'Missing'}`);
        console.log(`   Presigned URL: ${sub.presigned_url ? 'Present' : 'Missing'}`);
        console.log(`   S3 Key: ${sub.s3_key ? 'Present' : 'Missing'}`);
        console.log(`   Valid: ${sub.is_valid}`);
        console.log(`   Submitted: ${sub.submitted_at}`);
        console.log('');
      });
    }
    
    // Check submissions for today specifically
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaySubmissions = await TaskSubmission.find({
      user_id: USER_ID,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('task_id');
    
    console.log(`📅 Submissions for today (${today.toISOString().split('T')[0]}): ${todaySubmissions.length}`);
    
    if (todaySubmissions.length > 0) {
      console.log('\n📋 Today\'s submissions:');
      todaySubmissions.forEach((sub, index) => {
        console.log(`${index + 1}. Task: ${sub.task_id.name}`);
        console.log(`   Subtask: ${sub.subtask_key}`);
        console.log(`   Image URL: ${sub.image_url}`);
        console.log(`   Presigned URL: ${sub.presigned_url || 'Not set'}`);
        console.log(`   S3 Key: ${sub.s3_key || 'Not set'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkDatabase();
