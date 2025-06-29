const { getRewardsForDate } = require('../services/taskService');
const Reward = require('../models/Reward');
const { getDateRange } = require('../utils/dateUtils');

/**
 * Get rewards for a specific date
 * GET /api/rewards/:date
 */
const getRewardsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { user_id } = req.query;
    
    // If user_id not provided in query, it should come from authentication middleware
    const userId = user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Validate date format
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const rewardData = await getRewardsForDate(userId, targetDate);
    
    res.status(200).json({
      success: true,
      data: {
        date: date,
        rewards: rewardData.rewards,
        summary: {
          total_rewards: rewardData.count,
          total_rs: rewardData.total.rs,
          total_xp: rewardData.total.xp
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rewards for a date range
 * POST /api/rewards/range
 */
const getRewardsRange = async (req, res, next) => {
  try {
    const { start_date, end_date, user_id } = req.body;
    
    // If user_id not provided in body, it should come from authentication middleware
    const userId = user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date must be before or equal to end date'
      });
    }
    
    // Get total rewards in range
    const totalRewards = await Reward.getTotalRewardsInRange(userId, startDate, endDate);
    
    // Get detailed rewards
    const rewards = await Reward.find({
      user_id: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('task_id', 'name key')
    .sort({ date: -1, awarded_at: -1 });
    
    // Group by date
    const rewardsByDate = rewards.reduce((acc, reward) => {
      const dateKey = reward.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        reward_id: reward._id,
        task_id: reward.task_id._id,
        task_name: reward.task_id.name,
        task_key: reward.task_id.key,
        reward_rs: reward.reward_rs,
        reward_xp: reward.reward_xp,
        bonus_multiplier: reward.bonus_multiplier,
        total_reward_rs: reward.totalRewardRs,
        total_reward_xp: reward.totalRewardXp,
        bonus_reason: reward.bonus_reason,
        awarded_at: reward.awarded_at
      });
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      data: {
        start_date,
        end_date,
        rewards_by_date: rewardsByDate,
        summary: {
          total_rs: totalRewards.rs,
          total_xp: totalRewards.xp,
          total_rewards: rewards.length,
          unique_dates: Object.keys(rewardsByDate).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reward statistics for different periods
 * GET /api/rewards/stats/:period
 */
const getRewardStats = async (req, res, next) => {
  try {
    const { period } = req.params; // 'today', 'week', 'month'
    const { user_id } = req.query;
    
    // If user_id not provided in query, it should come from authentication middleware
    const userId = user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    let dateRange;
    try {
      dateRange = getDateRange(period);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    // Get rewards for the period
    const rewards = await Reward.find({
      user_id: userId,
      date: {
        $gte: dateRange.start,
        $lte: dateRange.end
      }
    }).populate('task_id', 'name key');
    
    // Calculate statistics
    const totalRs = rewards.reduce((sum, reward) => sum + reward.totalRewardRs, 0);
    const totalXp = rewards.reduce((sum, reward) => sum + reward.totalRewardXp, 0);
    
    // Group by task
    const rewardsByTask = rewards.reduce((acc, reward) => {
      const taskKey = reward.task_id.key;
      if (!acc[taskKey]) {
        acc[taskKey] = {
          task_name: reward.task_id.name,
          count: 0,
          total_rs: 0,
          total_xp: 0
        };
      }
      acc[taskKey].count++;
      acc[taskKey].total_rs += reward.totalRewardRs;
      acc[taskKey].total_xp += reward.totalRewardXp;
      return acc;
    }, {});
    
    // Daily averages for week/month periods
    let dailyAverages = null;
    if (period === 'week' || period === 'month') {
      const totalDays = period === 'week' ? 7 : 30;
      dailyAverages = {
        avg_rs_per_day: Math.round(totalRs / totalDays),
        avg_xp_per_day: Math.round(totalXp / totalDays),
        avg_rewards_per_day: Math.round(rewards.length / totalDays)
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        period,
        period_start: dateRange.start.toISOString().split('T')[0],
        period_end: dateRange.end.toISOString().split('T')[0],
        summary: {
          total_rewards: rewards.length,
          total_rs: totalRs,
          total_xp: totalXp
        },
        rewards_by_task: rewardsByTask,
        ...(dailyAverages && { daily_averages: dailyAverages })
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all rewards for a user (paginated)
 * GET /api/rewards
 */
const getAllRewards = async (req, res, next) => {
  try {
    const { user_id, page = 1, limit = 20, sort = '-awarded_at' } = req.query;
    
    // If user_id not provided in query, it should come from authentication middleware
    const userId = user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const rewards = await Reward.find({ user_id: userId })
      .populate('task_id', 'name key')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    const totalRewards = await Reward.countDocuments({ user_id: userId });
    
    res.status(200).json({
      success: true,
      data: rewards.map(reward => ({
        reward_id: reward._id,
        task_id: reward.task_id._id,
        task_name: reward.task_id.name,
        task_key: reward.task_id.key,
        date: reward.date,
        reward_rs: reward.reward_rs,
        reward_xp: reward.reward_xp,
        bonus_multiplier: reward.bonus_multiplier,
        total_reward_rs: reward.totalRewardRs,
        total_reward_xp: reward.totalRewardXp,
        bonus_reason: reward.bonus_reason,
        awarded_at: reward.awarded_at
      })),
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(totalRewards / limitNum),
        total_rewards: totalRewards,
        has_next: pageNum < Math.ceil(totalRewards / limitNum),
        has_prev: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRewardsByDate,
  getRewardsRange,
  getRewardStats,
  getAllRewards
};
