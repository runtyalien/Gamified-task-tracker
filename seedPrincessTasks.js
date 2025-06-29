const mongoose = require('mongoose');
const { seedPrincessTasks } = require('./src/utils/seedPrincessTasks');
require('dotenv').config();

/**
 * Script to seed princess tasks into the database
 */
async function runSeed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-task-tracker');
    console.log('🔗 Connected to MongoDB');
    
    // Seed princess tasks
    await seedPrincessTasks();
    
    console.log('✅ Princess tasks seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
