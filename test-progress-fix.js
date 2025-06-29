const mongoose = require('mongoose');
const TaskSubmission = require('./src/models/TaskSubmission');
const { getTaskProgress } = require('./src/services/taskService');
const { getStartOfDay } = require('./src/utils/dateUtils');

async function testProgressAfterFix() {
  try {
    await mongoose.connect('mongodb://localhost:27017/princess_tracker');
    console.log('Connected to MongoDB');

    const userId = 'test-user';
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    console.log(`Testing progress for user: ${userId}`);
    console.log(`Date: ${todayFormatted}`);
    console.log(`Today normalized: ${getStartOfDay(today).toISOString()}\n`);

    // First check if there are any submissions for today
    console.log('1. Checking submissions with fixed method...');
    const submissions = await TaskSubmission.getSubmissionsByUserAndDate(userId, today);
    console.log(`Found ${submissions.length} submissions using getSubmissionsByUserAndDate`);
    
    if (submissions.length > 0) {
      console.log('\nSubmission details:');
      submissions.forEach((sub, index) => {
        console.log(`${index + 1}. Task: ${sub.task_id}, Subtask: ${sub.subtask_key}`);
        console.log(`   Image URL: ${sub.image_url}`);
        console.log(`   Submitted: ${sub.submitted_at?.toISOString()}`);
        console.log(`   Date: ${sub.date?.toISOString()}`);
        console.log();
      });
    }

    // Test direct database query for comparison
    console.log('2. Direct database query for today...');
    const directQuery = await TaskSubmission.find({
      user_id: userId,
      date: getStartOfDay(today)
    });
    console.log(`Found ${directQuery.length} submissions with direct query`);

    // Test the getTaskProgress function
    console.log('3. Testing getTaskProgress function...');
    const progress = await getTaskProgress(userId, today);
    console.log(`Progress returned ${progress.length} tasks`);
    
    if (progress.length > 0) {
      console.log('\nProgress details:');
      progress.forEach((task, index) => {
        console.log(`${index + 1}. Task: ${task.task_name} (${task.task_id})`);
        console.log(`   Completed subtasks: ${task.progress.completed}/${task.progress.total}`);
        
        const completedSubtasks = task.subtasks.filter(st => st.completed);
        if (completedSubtasks.length > 0) {
          console.log('   Completed subtasks with submissions:');
          completedSubtasks.forEach(st => {
            console.log(`     - ${st.name} (${st.key}): ${st.submission ? 'HAS SUBMISSION' : 'NO SUBMISSION'}`);
            if (st.submission) {
              console.log(`       Image URL: ${st.submission.image_url}`);
              console.log(`       Submitted: ${st.submission.submitted_at}`);
            }
          });
        }
        console.log();
      });
    }

    console.log('4. Summary:');
    console.log(`- Database submissions: ${directQuery.length}`);
    console.log(`- Service method submissions: ${submissions.length}`);
    console.log(`- Progress tasks: ${progress.length}`);
    
    const totalCompletedSubtasks = progress.reduce((sum, task) => 
      sum + task.subtasks.filter(st => st.completed).length, 0
    );
    console.log(`- Total completed subtasks: ${totalCompletedSubtasks}`);
    
    const subtasksWithImages = progress.reduce((sum, task) => 
      sum + task.subtasks.filter(st => st.completed && st.submission && st.submission.image_url).length, 0
    );
    console.log(`- Completed subtasks with images: ${subtasksWithImages}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testProgressAfterFix();
