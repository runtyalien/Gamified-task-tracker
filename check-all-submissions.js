const mongoose = require('mongoose');
const TaskSubmission = require('./src/models/TaskSubmission');

async function checkAllSubmissions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/princess_tracker');
    console.log('Connected to MongoDB');

    const totalSubmissions = await TaskSubmission.countDocuments();
    console.log(`Total submissions in database: ${totalSubmissions}`);

    if (totalSubmissions > 0) {
      const allSubmissions = await TaskSubmission.find({}).sort({ submitted_at: -1 }).limit(10);
      
      console.log('\nMost recent submissions:');
      allSubmissions.forEach((sub, index) => {
        console.log(`${index + 1}. Task: ${sub.task_id}, Subtask: ${sub.subtask_key}`);
        console.log(`   Submitted: ${sub.submitted_at?.toISOString() || 'N/A'}`);
        console.log(`   Date: ${sub.date?.toISOString() || 'N/A'}`);
        console.log(`   Image: ${sub.image_url || 'N/A'}`);
        console.log();
      });

      // Check unique dates
      const uniqueDates = await TaskSubmission.aggregate([
        { $group: { _id: '$date', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]);
      
      console.log('All submission dates:');
      uniqueDates.forEach(item => {
        if (item._id) {
          console.log(`- ${item._id.toISOString()} (${item._id.toLocaleString()}) - ${item.count} submissions`);
        } else {
          console.log(`- NULL date - ${item.count} submissions`);
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAllSubmissions();
