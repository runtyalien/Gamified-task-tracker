const DailyProgress = require('../models/DailyProgress');
const User = require('../models/User');
const TaskSubmission = require('../models/TaskSubmission');
const Reward = require('../models/Reward');
const { getStartOfDay } = require('../utils/dateUtils');

/**
 * Reset daily progress at midnight IST
 * This function:
 * 1. Archives yesterday's progress
 * 2. Awards accumulated XP and rewards to users
 * 3. Marks the reset as completed
 */
const performDailyReset = async () => {
  console.log('🌅 Starting daily reset process...');
  
  try {
    const now = new Date();
    const today = getStartOfDay(now);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    console.log(`📅 Resetting for transition: ${yesterday.toISOString()} → ${today.toISOString()}`);
    
    // 1. Find all users who had progress yesterday
    const yesterdayProgress = await DailyProgress.find({
      date: yesterday,
      is_reset_day: false
    }).populate('user_id');
    
    console.log(`👥 Found ${yesterdayProgress.length} users with progress from yesterday`);
    
    // 2. Award accumulated rewards to users
    for (const progress of yesterdayProgress) {
      try {
        const user = progress.user_id;
        const stats = progress.daily_stats;
        
        if (stats.total_rewards_rs > 0 || stats.total_rewards_xp > 0) {
          // Update user's accumulated rewards
          await User.findByIdAndUpdate(user._id, {
            $inc: {
              rs_earned: stats.total_rewards_rs,
              xp: stats.total_rewards_xp
            }
          });
          
          console.log(`💰 Awarded to ${user.name}: ₹${stats.total_rewards_rs} + ${stats.total_rewards_xp}XP`);
        }
        
        // Mark this progress as reset
        progress.is_reset_day = true;
        await progress.save();
        
      } catch (userError) {
        console.error(`❌ Error processing user ${progress.user_id._id}:`, userError);
      }
    }
    
    // 3. Clean up old data (keep last 30 days)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const cleanupResult = await DailyProgress.deleteMany({
      date: { $lt: thirtyDaysAgo },
      is_reset_day: true
    });
    
    console.log(`🧹 Cleaned up ${cleanupResult.deletedCount} old progress records`);
    
    // 4. Also clean up old TaskSubmissions (optional - for database size management)
    const oldSubmissions = await TaskSubmission.deleteMany({
      date: { $lt: thirtyDaysAgo }
    });
    
    console.log(`🧹 Cleaned up ${oldSubmissions.deletedCount} old submissions`);
    
    // 5. Summary
    const totalRewardsRs = yesterdayProgress.reduce((sum, p) => sum + p.daily_stats.total_rewards_rs, 0);
    const totalRewardsXp = yesterdayProgress.reduce((sum, p) => sum + p.daily_stats.total_rewards_xp, 0);
    
    console.log('✅ Daily reset completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users processed: ${yesterdayProgress.length}`);
    console.log(`   - Total ₹ awarded: ₹${totalRewardsRs}`);
    console.log(`   - Total XP awarded: ${totalRewardsXp}`);
    console.log(`   - Records cleaned: ${cleanupResult.deletedCount}`);
    
    return {
      success: true,
      usersProcessed: yesterdayProgress.length,
      totalRewardsRs,
      totalRewardsXp,
      recordsCleaned: cleanupResult.deletedCount
    };
    
  } catch (error) {
    console.error('❌ Daily reset failed:', error);
    throw error;
  }
};

/**
 * Get daily progress for a user on a specific date
 */
const getDailyProgress = async (userId, date) => {
  try {
    const dailyProgress = await DailyProgress.getOrCreateDailyProgress(userId, date);
    return dailyProgress;
  } catch (error) {
    console.error('Error getting daily progress:', error);
    throw error;
  }
};

/**
 * Manual reset function for testing
 */
const manualReset = async () => {
  console.log('🔧 Performing manual reset...');
  return await performDailyReset();
};

/**
 * Get reset statistics
 */
const getResetStats = async (days = 7) => {
  const endDate = getStartOfDay(new Date());
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const stats = await DailyProgress.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lt: endDate },
        is_reset_day: true
      }
    },
    {
      $group: {
        _id: '$date',
        userCount: { $sum: 1 },
        totalRewardsRs: { $sum: '$daily_stats.total_rewards_rs' },
        totalRewardsXp: { $sum: '$daily_stats.total_rewards_xp' },
        totalCompletedTasks: { $sum: '$daily_stats.completed_tasks' }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
  
  return stats;
};

module.exports = {
  performDailyReset,
  getDailyProgress,
  manualReset,
  getResetStats
};
