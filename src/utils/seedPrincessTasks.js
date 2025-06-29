const Task = require('../models/Task');

const princessTasks = [
  {
    name: 'Morning Princess Ritual',
    key: 'morning-princess-ritual',
    description: 'Start your day like royalty with essential morning rituals',
    reward_rs: 100,
    reward_xp: 20,
    is_active: true,
    subtasks: [
      {
        name: 'Brush',
        key: 'brush',
        time_limit: 615 // 10:15 AM (615 minutes from midnight)
      },
      {
        name: 'Bath', 
        key: 'bath',
        time_limit: 615 // 10:15 AM
      },
      {
        name: 'Clean bed',
        key: 'clean-bed',
        time_limit: 615 // 10:15 AM
      }
    ]
  },
  {
    name: 'Glow Goddess Routine',
    key: 'glow-goddess-routine',
    description: 'Complete your skin and hair care routine to maintain your goddess glow',
    reward_rs: 100,
    reward_xp: 20,
    is_active: true,
    subtasks: [
      {
        name: 'Morning skin + hair care',
        key: 'morning-skincare',
        time_limit: 645 // 10:45 AM (645 minutes from midnight)
      },
      {
        name: 'Night skin + hair care', 
        key: 'night-skincare',
        time_limit: 1380 // 11:00 PM (1380 minutes from midnight)
      },
      {
        name: 'Hair tablets',
        key: 'hair-tablets',
        time_limit: 1080 // Special case: between 11:00 AM and 6:00 PM (we'll use 6:00 PM as deadline)
      }
    ]
  },
  {
    name: 'Castle Keeper Mission',
    key: 'castle-keeper-mission', 
    description: 'Maintain your royal castle with cleaning duties',
    reward_rs: 200,
    reward_xp: 30,
    is_active: true,
    subtasks: [
      {
        name: 'Cleaning',
        key: 'cleaning',
        time_limit: 585 // 9:45 AM (585 minutes from midnight)
      },
      {
        name: 'Mopping',
        key: 'mopping',
        time_limit: 585 // 9:45 AM
      }
    ]
  },
  {
    name: 'Wellness Princess Path',
    key: 'wellness-princess-path',
    description: 'Nourish your body with proper nutrition and hydration',
    reward_rs: 150,
    reward_xp: 25,
    is_active: true,
    subtasks: [
      {
        name: 'Breakfast',
        key: 'breakfast',
        time_limit: 720 // 12:00 PM (720 minutes from midnight)
      },
      {
        name: 'Lunch',
        key: 'lunch',
        time_limit: 960 // 4:00 PM (960 minutes from midnight)
      },
      {
        name: 'Dinner', 
        key: 'dinner',
        time_limit: 1320 // 10:00 PM (1320 minutes from midnight)
      },
      {
        name: '7L water',
        key: 'water-7l',
        time_limit: 0 // Anytime during the day
      }
    ]
  },
  {
    name: "Pet Fairy's Care",
    key: 'pet-fairy-care',
    description: 'Take care of your beloved pets with love and attention',
    reward_rs: 100,
    reward_xp: 20,
    is_active: true,
    subtasks: [
      {
        name: '3x pet food',
        key: 'pet-food',
        time_limit: 0 // Anytime during the day
      },
      {
        name: '2x pet treats',
        key: 'pet-treats', 
        time_limit: 0 // Anytime during the day
      }
    ]
  },
  {
    name: 'Knowledge Belle Challenge',
    key: 'knowledge-belle-challenge',
    description: 'Watch 5 YouTube videos to expand your knowledge',
    reward_rs: 100,
    reward_xp: 20,
    is_active: true,
    subtasks: [
      {
        name: 'Watch 5 YouTube videos',
        key: 'watch-5-videos',
        time_limit: 0 // Anytime during the day
      }
    ]
  },
  {
    name: 'Reel Empress Task',
    key: 'reel-empress-task',
    description: 'Create and post engaging Instagram content',
    reward_rs: 50,
    reward_xp: 10,
    is_active: true,
    subtasks: [
      {
        name: 'Post Instagram video',
        key: 'post-instagram-video',
        time_limit: 0 // Anytime during the day
      }
    ]
  },
  {
    name: 'Creative Queen Quest',
    key: 'creative-queen-quest',
    description: 'Express your creativity through hobby activities',
    reward_rs: 100,
    reward_xp: 20,
    is_active: true,
    subtasks: [
      {
        name: 'Hobby activity',
        key: 'hobby-activity',
        time_limit: 0 // Anytime during the day
      }
    ]
  },
  {
    name: 'Social Sentry Duty',
    key: 'social-sentry-duty',
    description: 'Monitor and limit Instagram usage to maintain healthy digital habits',
    reward_rs: 100,
    reward_xp: 20,
    is_active: true,
    subtasks: [
      {
        name: 'Instagram usage < 1.5 hrs',
        key: 'instagram-limit',
        time_limit: 0 // Check anytime during the day
      }
    ]
  }
];

/**
 * Seed the database with princess-themed tasks
 */
const seedPrincessTasks = async (userId) => {
  try {
    console.log('🌸 Starting to seed princess tasks...');
    
    // Clear existing tasks
    await Task.deleteMany({});
    console.log('🗑️ Cleared existing tasks');
    
    // Add userId to all tasks
    const tasksWithUserId = princessTasks.map(task => ({
      ...task,
      userId: userId
    }));
    
    // Insert new tasks
    const createdTasks = await Task.insertMany(tasksWithUserId);
    console.log(`✨ Created ${createdTasks.length} princess tasks`);
    
    // Log created tasks
    createdTasks.forEach(task => {
      console.log(`👑 ${task.name} (${task.subtasks.length} subtasks)`);
    });
    
    console.log('🎉 Princess tasks seeded successfully!');
    return createdTasks;
  } catch (error) {
    console.error('❌ Error seeding princess tasks:', error);
    throw error;
  }
};

module.exports = {
  princessTasks,
  seedPrincessTasks
};
