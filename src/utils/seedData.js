const Task = require('../models/Task');
const User = require('../models/User');
const { seedPrincessTasks } = require('./seedPrincessTasks');

const sampleTasks = [
  {
    name: "Morning Workout Routine",
    key: "morning-workout",
    description: "Complete morning exercise routine for a healthy start",
    subtasks: [
      {
        name: "Warm-up Exercise",
        key: "warmup",
        time_limit: 10
      },
      {
        name: "Cardio Session",
        key: "cardio",
        time_limit: 30
      },
      {
        name: "Strength Training",
        key: "strength",
        time_limit: 45
      },
      {
        name: "Cool-down Stretching",
        key: "cooldown",
        time_limit: 15
      }
    ],
    reward_rs: 50,
    reward_xp: 100
  },
  {
    name: "Daily Learning Goals",
    key: "daily-learning",
    description: "Dedicate time to learning and skill development",
    subtasks: [
      {
        name: "Read Technical Article",
        key: "read-article",
        time_limit: 30
      },
      {
        name: "Watch Educational Video",
        key: "watch-video",
        time_limit: 45
      },
      {
        name: "Practice Coding",
        key: "practice-coding",
        time_limit: 60
      }
    ],
    reward_rs: 30,
    reward_xp: 75
  },
  {
    name: "Healthy Eating Habits",
    key: "healthy-eating",
    description: "Maintain proper nutrition throughout the day",
    subtasks: [
      {
        name: "Healthy Breakfast",
        key: "breakfast",
        time_limit: 30
      },
      {
        name: "Nutritious Lunch",
        key: "lunch",
        time_limit: 45
      },
      {
        name: "Light Dinner",
        key: "dinner",
        time_limit: 45
      },
      {
        name: "Drink 8 Glasses Water",
        key: "water-intake",
        time_limit: 1440 // All day
      }
    ],
    reward_rs: 25,
    reward_xp: 60
  },
  {
    name: "Productivity Tasks",
    key: "productivity",
    description: "Complete important daily productivity goals",
    subtasks: [
      {
        name: "Morning Planning",
        key: "morning-plan",
        time_limit: 15
      },
      {
        name: "Focus Work Session",
        key: "focus-work",
        time_limit: 120
      },
      {
        name: "Email Management",
        key: "email-management",
        time_limit: 30
      },
      {
        name: "Evening Review",
        key: "evening-review",
        time_limit: 15
      }
    ],
    reward_rs: 40,
    reward_xp: 80
  },
  {
    name: "Self-care Routine",
    key: "self-care",
    description: "Take care of mental and physical well-being",
    subtasks: [
      {
        name: "Meditation",
        key: "meditation",
        time_limit: 20
      },
      {
        name: "Journaling",
        key: "journaling",
        time_limit: 15
      },
      {
        name: "Skincare Routine",
        key: "skincare",
        time_limit: 10
      }
    ],
    reward_rs: 20,
    reward_xp: 50
  }
];

const sampleUsers = [
  {
    name: "Akanksha Gadkar",
    xp: 890,
    rs_earned: 445,
    streak_count: 15
  }
];

/**
 * Seed the database with sample data
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Task.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Get user for princess tasks
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} sample users`);
    const user = users[0]; // Akanksha Gadkar
    
    // Insert princess tasks for the user
    const tasks = await seedPrincessTasks(user._id);
    console.log(`✅ Created ${tasks.length} princess tasks`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\nPrincess Tasks:');
    tasks.forEach(task => {
      console.log(`  - ${task.name} (${task.key}): ${task.reward_rs}₹ / ${task.reward_xp}XP`);
    });
    
    console.log('\nSample Users:');
    users.forEach(user => {
      console.log(`  - ${user.name}: Level ${user.level} (${user.xp}XP, ${user.rs_earned}₹, ${user.streak_count} streak)`);
    });
    
    return { tasks, users };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

/**
 * Clear all data from the database
 */
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    await Task.deleteMany({});
    await User.deleteMany({});
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

module.exports = {
  seedDatabase,
  clearDatabase,
  sampleTasks,
  sampleUsers
};
