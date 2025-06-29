const mongoose = require('mongoose');
const TaskSubmission = require('./src/models/TaskSubmission');
const { getStartOfDay } = require('./src/utils/dateUtils');

async function debugCurrentIssue() {
  try {
    await mongoose.connect('mongodb://localhost:27017/princess_tracker');
    console.log('Connected to MongoDB');

    const today = getStartOfDay(new Date());
    console.log('Today\'s date for query:', today.toISOString());

    // Check all submissions in database
    const allSubmissions = await TaskSubmission.find({}).sort({ submitted_at: -1 });
    console.log(`\nTotal submissions in database: ${allSubmissions.length}`);

    if (allSubmissions.length > 0) {
      console.log('\nRecent submissions:');
      allSubmissions.slice(0, 5).forEach((sub, index) => {
        console.log(`${index + 1}. Task: ${sub.task_id}, Subtask: ${sub.subtask_key}`);
        console.log(`   Submitted: ${sub.submitted_at?.toISOString()}`);
        console.log(`   Date: ${sub.date?.toISOString()}`);
        console.log(`   Image URL: ${sub.image_url || 'None'}`);
        console.log(`   User: ${sub.user_id}`);
        console.log();
      });

      // Check specifically for today's submissions
      const todaysSubmissions = await TaskSubmission.find({ date: today });
      console.log(`\nSubmissions for today (${today.toISOString()}): ${todaysSubmissions.length}`);
      
      todaysSubmissions.forEach((sub, index) => {
        console.log(`${index + 1}. Task: ${sub.task_id}, Subtask: ${sub.subtask_key}`);
        console.log(`   Image URL: ${sub.image_url || 'None'}`);
        console.log(`   Has Image: ${!!sub.image_url}`);
        console.log();
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugCurrentIssue();
