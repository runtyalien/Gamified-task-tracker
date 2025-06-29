require('dotenv').config();
const mongoose = require('mongoose');

async function checkTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-task-tracker');
    console.log('Connected to MongoDB');
    
    const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Find Akanksha
    const user = await User.findOne({ name: 'Akanksha Gadkar' });
    console.log('User found:', user ? user._id : 'Not found');
    
    if (user) {
      // Find tasks for this user
      const tasks = await Task.find({ userId: user._id });
      console.log(`Found ${tasks.length} tasks for Akanksha Gadkar`);
      
      if (tasks.length === 0) {
        // Check all tasks in database
        const allTasks = await Task.find({});
        console.log(`Total tasks in database: ${allTasks.length}`);
        
        allTasks.forEach((task, index) => {
          console.log(`${index + 1}. ${task.name} (${task.category || 'No category'})`);
          console.log(`   User ID: ${task.userId || 'undefined'}`);
          console.log(`   Task object keys:`, Object.keys(task.toObject()));
        });
      } else {
        tasks.forEach((task, index) => {
          console.log(`${index + 1}. ${task.name} (${task.category})`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTasks();
