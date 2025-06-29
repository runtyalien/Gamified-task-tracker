#!/usr/bin/env node

const mongoose = require('mongoose');
const { getStartOfDay } = require('./src/utils/dateUtils');
const { getTaskProgress } = require('./src/services/taskService');

const MONGODB_URI = 'mongodb://localhost:27017/gamified-task-tracker';
const USER_ID = '686053e5069ed8946b40b12c';

async function testProgressWithFixedDate() {
  try {
    console.log('🔍 Testing progress API with fixed date handling...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test the date conversion like the progress controller now does
    const inputDate = '2025-06-29'; // What frontend sends
    const parsedDate = new Date(inputDate);
    const targetDate = getStartOfDay(parsedDate); // What controller now does
    
    console.log('📅 Date conversion test:');
    console.log('   Frontend input:', inputDate);
    console.log('   Parsed date:', parsedDate.toISOString());
    console.log('   IST start of day (UTC):', targetDate.toISOString());
    
    // Test the progress service
    console.log('\n🔍 Testing progress service...');
    const progress = await getTaskProgress(USER_ID, targetDate);
    
    console.log(`📊 Found ${progress.length} tasks with progress:`);
    
    progress.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.task_name}:`);
      console.log(`   Task ID: ${task.task_id}`);
      console.log(`   Completed: ${task.progress.completed}/${task.progress.total}`);
      
      if (task.subtasks) {
        const completedSubtasks = task.subtasks.filter(st => st.completed && st.submission);
        console.log(`   Subtasks with submissions: ${completedSubtasks.length}`);
        
        completedSubtasks.forEach(st => {
          console.log(`     ✅ ${st.name}: ${st.submission.image_url ? 'Has image' : 'No image'}`);
          console.log(`        Submission date: ${st.submission.date}`);
          console.log(`        Target date: ${targetDate.toISOString()}`);
          console.log(`        Dates match: ${st.submission.date.toISOString() === targetDate.toISOString()}`);
        });
      }
    });
    
    // Specifically check for the task that should have submissions
    const wellnessTask = progress.find(p => p.task_key === 'wellness-princess-path');
    if (wellnessTask) {
      console.log('\n🎯 Wellness Princess Path Task Details:');
      console.log(`   Total subtasks: ${wellnessTask.subtasks.length}`);
      console.log(`   Completed subtasks: ${wellnessTask.subtasks.filter(st => st.completed).length}`);
      
      const waterSubtask = wellnessTask.subtasks.find(st => st.key === 'water-7l');
      if (waterSubtask) {
        console.log(`   Water subtask completed: ${waterSubtask.completed}`);
        if (waterSubtask.submission) {
          console.log(`   Water subtask image: ${waterSubtask.submission.image_url}`);
        }
      }
      
      const dinnerSubtask = wellnessTask.subtasks.find(st => st.key === 'dinner');
      if (dinnerSubtask) {
        console.log(`   Dinner subtask completed: ${dinnerSubtask.completed}`);
        if (dinnerSubtask.submission) {
          console.log(`   Dinner subtask image: ${dinnerSubtask.submission.image_url}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testProgressWithFixedDate();
