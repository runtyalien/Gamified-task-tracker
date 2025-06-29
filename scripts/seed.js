#!/usr/bin/env node

const mongoose = require('mongoose');
const { seedDatabase, clearDatabase } = require('../src/utils/seedData');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-task-tracker';

async function main() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const command = process.argv[2];
    
    switch (command) {
      case 'seed':
        await seedDatabase();
        break;
      case 'clear':
        await clearDatabase();
        break;
      case 'reset':
        await clearDatabase();
        await seedDatabase();
        break;
      default:
        console.log(`
Usage: node scripts/seed.js <command>

Commands:
  seed   - Add sample data to the database
  clear  - Remove all data from the database
  reset  - Clear and then seed the database

Examples:
  node scripts/seed.js seed
  node scripts/seed.js clear
  node scripts/seed.js reset
        `);
        process.exit(1);
    }
    
    console.log('✅ Operation completed successfully!');
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

main();
