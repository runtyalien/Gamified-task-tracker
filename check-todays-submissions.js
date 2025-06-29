const mongoose = require('mongoose');
const TaskSubmission = require('./src/models/TaskSubmission');
const { getStartOfDay } = require('./src/utils/dateUtils');

async function checkTodaysSubmissions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/princess_tracker');
    console.log('Connected to MongoDB');

    const today = getStartOfDay(new Date());
    console.log('Looking for submissions for date:', today.toISOString());
    console.log('Looking for submissions for date (local):', today.toLocaleString());

    const todaysSubmissions = await TaskSubmission.find({
      date: today
    }).sort({ submitted_at: -1 });

    console.log(`\nFound ${todaysSubmissions.length} submissions for today:`);
    
    if (todaysSubmissions.length === 0) {
      console.log('No submissions found for today');
      
      // Show what dates we do have submissions for
      const allDates = await TaskSubmission.aggregate([
        { $group: { _id: '$date', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 10 }
      ]);
      
      console.log('\nRecent submission dates in database:');
      allDates.forEach(item => {
        console.log(`- ${item._id.toISOString()} (${item._id.toLocaleString()}) - ${item.count} submissions`);
      });
    } else {
      todaysSubmissions.forEach(sub => {
        console.log(`- Task: ${sub.task_id}, Subtask: ${sub.subtask_key}, Submitted: ${sub.submitted_at.toISOString()}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkTodaysSubmissions();
