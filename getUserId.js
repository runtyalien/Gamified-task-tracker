const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function getUserId() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-task-tracker');
    console.log('Connected to MongoDB');
    
    console.log('Searching for user: Akanksha');
    const user = await User.findOne({ name: 'Akanksha' });
    if (user) {
      console.log('✅ Found user!');
      console.log('User ID:', user._id.toString());
      console.log('User details:', {
        name: user.name,
        xp: user.xp,
        rs_earned: user.rs_earned,
        level: user.level,
        streak_count: user.streak_count
      });
    } else {
      console.log('❌ User not found');
      console.log('Let me check all users...');
      const allUsers = await User.find({});
      console.log('All users:', allUsers.map(u => ({ id: u._id, name: u.name })));
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

getUserId();
