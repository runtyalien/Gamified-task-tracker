const Task = require('../models/Task');
const TaskSubmission = require('../models/TaskSubmission');
const Reward = require('../models/Reward');
const User = require('../models/User');
const BonusSubmission = require('../models/BonusSubmission');
const DailyProgress = require('../models/DailyProgress');
const { validateSubmissionTime, getStartOfDay, getEndOfDay } = require('../utils/dateUtils');

/**
 * Submit a subtask with image proof
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {string} subtaskKey - Subtask key
 * @param {string} imageUrl - Uploaded image URL
 * @param {Date} submittedAt - Submission timestamp
 * @param {string} presignedUrl - Presigned URL for viewing image
 * @param {string} s3Key - S3 object key
 * @returns {Promise<Object>} - Submission result
 */
const submitSubtask = async (userId, taskId, subtaskKey, imageUrl, submittedAt, presignedUrl = null, s3Key = null) => {
  // Get the task and validate subtask
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  
  if (!task.is_active) {
    throw new Error('Task is not active');
  }
  
  const subtask = task.getSubtaskByKey(subtaskKey);
  if (!subtask) {
    throw new Error('Subtask not found');
  }
  
  // Validate submission date
  const submissionDate = getStartOfDay(submittedAt);
  const timeValidation = validateSubmissionTime(submittedAt, submissionDate, subtask.time_limit, subtaskKey);
  
  // Check if already submitted
  const existingSubmission = await TaskSubmission.findOne({
    user_id: userId,
    task_id: taskId,
    subtask_key: subtaskKey,
    date: submissionDate
  });
  
  if (existingSubmission) {
    console.log('Duplicate submission attempt:', {
      userId,
      taskId,
      subtaskKey,
      submissionDate: submissionDate.toISOString(),
      existingSubmissionDate: existingSubmission.date.toISOString(),
      existingSubmissionId: existingSubmission._id
    });
    
    const error = new Error('Subtask already submitted for this date');
    error.code = 'DUPLICATE_SUBMISSION';
    error.details = {
      existingSubmissionId: existingSubmission._id,
      submittedAt: existingSubmission.submitted_at,
      imageUrl: existingSubmission.image_url
    };
    throw error;
  }
  
  // Create submission
  const submission = new TaskSubmission({
    user_id: userId,
    task_id: taskId,
    subtask_key: subtaskKey,
    image_url: imageUrl,
    presigned_url: presignedUrl,
    s3_key: s3Key,
    submitted_at: submittedAt,
    date: submissionDate,
    is_valid: timeValidation.isValid,
    validation_message: timeValidation.message
  });
  
  await submission.save();
  
  // Update DailyProgress table
  try {
    await DailyProgress.markSubtaskCompleted(userId, submissionDate, taskId, subtaskKey, {
      image_url: imageUrl,
      presigned_url: presignedUrl,
      s3_key: s3Key,
      is_valid: timeValidation.isValid,
      validation_message: timeValidation.message
    });
  } catch (dailyProgressError) {
    console.log('Daily progress update failed (non-critical):', dailyProgressError.message);
    // Continue with existing logic - DailyProgress is supplementary
  }
  
  // Check if all subtasks are completed for this task AND within time limits
  const allSubtaskKeys = task.subtasks.map(st => st.key);
  const allSubmissions = await TaskSubmission.find({
    user_id: userId,
    task_id: taskId,
    date: submissionDate,
    subtask_key: { $in: allSubtaskKeys }
  });

  const allCompleted = allSubmissions.length === allSubtaskKeys.length;
  const allOnTime = allSubmissions.every(sub => sub.is_valid);

  let reward = null;
  if (allCompleted && allOnTime) {
    // Check if reward already exists
    const existingReward = await Reward.findOne({
      user_id: userId,
      task_id: taskId,
      date: submissionDate
    });
    
    if (!existingReward) {
      // Issue reward only if all subtasks completed on time
      reward = await issueReward(userId, taskId, submissionDate, task.reward_rs, task.reward_xp);
    }
  } else if (allCompleted && !allOnTime) {
    // All completed but not on time - no reward
    console.log(`Task ${task.name} completed but not within time limits. No reward issued.`);
  }

  return {
    submission,
    reward,
    taskCompleted: allCompleted,
    allOnTime: allOnTime,
    rewardEligible: allCompleted && allOnTime
  };
};

/**
 * Issue a reward to a user
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {Date} date - Reward date
 * @param {number} rewardRs - Reward Rs amount
 * @param {number} rewardXp - Reward XP amount
 * @returns {Promise<Object>} - Created reward
 */
const issueReward = async (userId, taskId, date, rewardRs, rewardXp) => {
  // Create reward
  const reward = new Reward({
    user_id: userId,
    task_id: taskId,
    date: date,
    reward_rs: rewardRs,
    reward_xp: rewardXp
  });
  
  await reward.save();
  
  // Update user stats
  const user = await User.findById(userId);
  if (user) {
    user.rs_earned += reward.totalRewardRs;
    user.xp += reward.totalRewardXp;
    // Level will be automatically calculated in the pre-save hook
    await user.save();
  }
  
  return reward;
};

/**
 * Submit a bonus activity (like additional YouTube videos)
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {string} subtaskKey - Subtask key
 * @param {string} bonusType - Type of bonus ('additional_video', 'extra_activity')
 * @param {string} imageUrl - Uploaded image URL
 * @param {Date} submittedAt - Submission timestamp
 * @param {number} rewardRs - Bonus reward amount
 * @param {string} presignedUrl - Presigned URL for viewing image
 * @param {string} s3Key - S3 object key
 * @returns {Promise<Object>} - Submission result
 */
const submitBonusActivity = async (userId, taskId, subtaskKey, bonusType, imageUrl, submittedAt, rewardRs = 20, presignedUrl = null, s3Key = null) => {
  // Get the task to validate
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  
  if (!task.is_active) {
    throw new Error('Task is not active');
  }
  
  const submissionDate = getStartOfDay(submittedAt);
  
  // Create bonus submission
  const bonusSubmission = new BonusSubmission({
    user_id: userId,
    task_id: taskId,
    subtask_key: subtaskKey,
    bonus_type: bonusType,
    image_url: imageUrl,
    presigned_url: presignedUrl,
    s3_key: s3Key,
    submitted_at: submittedAt,
    date: submissionDate,
    reward_rs: rewardRs,
    reward_xp: 0, // No XP for bonus activities
    is_valid: true
  });
  
  await bonusSubmission.save();
  
  // Issue bonus reward immediately
  const bonusReward = await issueBonusReward(userId, taskId, submissionDate, rewardRs, 0, bonusType);
  
  return {
    submission: bonusSubmission,
    reward: bonusReward
  };
};

/**
 * Issue a bonus reward to a user
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {Date} date - Reward date
 * @param {number} rewardRs - Reward Rs amount
 * @param {number} rewardXp - Reward XP amount
 * @param {string} bonusType - Type of bonus activity
 * @returns {Promise<Object>} - Created reward
 */
const issueBonusReward = async (userId, taskId, date, rewardRs, rewardXp, bonusType) => {
  // Create bonus reward
  const reward = new Reward({
    user_id: userId,
    task_id: taskId,
    date: date,
    reward_rs: rewardRs,
    reward_xp: rewardXp,
    bonus_multiplier: 1,
    bonus_reason: `Bonus activity: ${bonusType}`
  });
  
  await reward.save();
  
  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: {
      rs_earned: rewardRs,
      xp: rewardXp
    }
  });
  
  return reward;
};

/**
 * Get task progress for a specific date
 * Uses DailyProgress as primary source with TaskSubmission fallback
 * @param {string} userId - User ID
 * @param {Date} date - Target date
 * @returns {Promise<Array>} - Task progress data
 */
const getTaskProgress = async (userId, date) => {
  const targetDate = getStartOfDay(date);
  
  // Debug logging
  console.log('🔍 getTaskProgress called:', { userId, date: date.toISOString(), targetDate: targetDate.toISOString() });
  
  try {
    // Try to get progress from DailyProgress table first
    const dailyProgress = await DailyProgress.findOne({
      user_id: userId,
      date: targetDate
    }).populate('task_progress.task_id');
    
    if (dailyProgress && dailyProgress.task_progress.length > 0) {
      console.log('📊 Using DailyProgress data');
      
      // Convert DailyProgress format to expected format
      return dailyProgress.task_progress.map(taskProgress => {
        const task = taskProgress.task_id;
        
        const subtaskProgress = task.subtasks.map(subtask => {
          const completedSubtask = taskProgress.completed_subtasks.find(
            cs => cs.subtask_key === subtask.key
          );
          
          return {
            key: subtask.key,
            name: subtask.name,
            time_limit: subtask.time_limit,
            completed: !!completedSubtask,
            submission: completedSubtask ? {
              id: `daily_${dailyProgress._id}_${subtask.key}`,
              user_id: userId,
              task_id: task._id,
              subtask_key: subtask.key,
              image_url: completedSubtask.image_url,
              presigned_url: completedSubtask.presigned_url,
              s3_key: completedSubtask.s3_key,
              submitted_at: completedSubtask.completed_at,
              date: targetDate.toISOString(),
              is_valid: completedSubtask.is_valid,
              validation_message: completedSubtask.validation_message
            } : null
          };
        });
        
        return {
          task_id: task._id,
          task_name: task.name,
          task_key: task.key,
          description: task.description,
          reward_rs: task.reward_rs,
          reward_xp: task.reward_xp,
          subtasks: subtaskProgress,
          progress: {
            completed: taskProgress.completed_subtasks.length,
            total: task.subtasks.length,
            percentage: taskProgress.completion_rate
          },
          is_completed: taskProgress.is_task_completed,
          is_reward_eligible: taskProgress.reward_earned
        };
      });
    }
  } catch (dailyProgressError) {
    console.log('⚠️ DailyProgress query failed, falling back to TaskSubmission:', dailyProgressError.message);
  }
  
  console.log('📊 Falling back to TaskSubmission data');
  
  // Get all active tasks
  const tasks = await Task.find({ is_active: true });
  console.log(`📋 Found ${tasks.length} active tasks`);
  
  // Get submissions for the date
  const submissions = await TaskSubmission.getSubmissionsByUserAndDate(userId, targetDate);
  console.log(`📝 Found ${submissions.length} submissions for user ${userId} on ${targetDate.toISOString()}`);
  
  // Debug: Log submission details
  if (submissions.length > 0) {
    console.log('📝 Submission details:');
    submissions.forEach((sub, index) => {
      console.log(`   ${index + 1}. Task: ${sub.task_id}, Subtask: ${sub.subtask_key}, Image: ${!!sub.image_url}`);
    });
  }
  
  // Group submissions by task (handle populated task_id correctly)
  const submissionsByTask = submissions.reduce((acc, sub) => {
    // Handle both populated and non-populated task_id
    const taskIdStr = (sub.task_id._id || sub.task_id).toString();
    if (!acc[taskIdStr]) {
      acc[taskIdStr] = [];
    }
    acc[taskIdStr].push(sub);
    return acc;
  }, {});
  
  // Debug: Log submission grouping
  console.log('📝 Submissions grouped by task:');
  Object.keys(submissionsByTask).forEach(taskId => {
    console.log(`   Task ${taskId}: ${submissionsByTask[taskId].length} submissions`);
  });
  
  // Build progress data
  const progress = tasks.map(task => {
    const taskIdStr = task._id.toString();
    const taskSubmissions = submissionsByTask[taskIdStr] || [];
    const submittedSubtaskKeys = taskSubmissions.map(sub => sub.subtask_key);
    
    const subtaskProgress = task.subtasks.map(subtask => ({
      key: subtask.key,
      name: subtask.name,
      time_limit: subtask.time_limit,
      completed: submittedSubtaskKeys.includes(subtask.key),
      submission: taskSubmissions.find(sub => sub.subtask_key === subtask.key) || null
    }));
    
    const completedSubtasks = subtaskProgress.filter(st => st.completed).length;
    const totalSubtasks = task.subtasks.length;
    const isCompleted = completedSubtasks === totalSubtasks;
    
    // Check if all completed subtasks are valid (within time limit)
    const allValidSubmissions = subtaskProgress
      .filter(st => st.completed && st.submission)
      .every(st => st.submission.is_valid);
    
    const isRewardEligible = isCompleted && allValidSubmissions;
    
    return {
      task_id: task._id,
      task_name: task.name,
      task_key: task.key,
      description: task.description,
      reward_rs: task.reward_rs,
      reward_xp: task.reward_xp,
      subtasks: subtaskProgress,
      progress: {
        completed: completedSubtasks,
        total: totalSubtasks,
        percentage: Math.round((completedSubtasks / totalSubtasks) * 100)
      },
      is_completed: isCompleted,
      is_reward_eligible: isRewardEligible
    };
  });
  
  return progress;
};

/**
 * Get rewards for a specific date
 * @param {string} userId - User ID
 * @param {Date} date - Target date
 * @returns {Promise<Array>} - Rewards data
 */
const getRewardsForDate = async (userId, date) => {
  const rewards = await Reward.getRewardsByUserAndDate(userId, date);
  
  const totalRewards = rewards.reduce((total, reward) => ({
    rs: total.rs + reward.totalRewardRs,
    xp: total.xp + reward.totalRewardXp
  }), { rs: 0, xp: 0 });
  
  return {
    rewards: rewards.map(reward => ({
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
    })),
    total: totalRewards,
    count: rewards.length
  };
};

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User statistics
 */
const getUserStats = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Get recent submissions for streak calculation
  const recentSubmissions = await TaskSubmission.find({
    user_id: userId,
    is_valid: true
  }).sort({ date: -1 }).limit(30);
  
  // Calculate current streak
  const submissionDates = recentSubmissions.map(sub => ({ date: sub.date }));
  const { calculateStreak } = require('../utils/dateUtils');
  const currentStreak = calculateStreak(submissionDates);
  
  // Update user streak if different
  if (user.streak_count !== currentStreak) {
    user.streak_count = currentStreak;
    await user.save();
  }
  
  return {
    id: user._id,
    name: user.name,
    xp: user.xp,
    rs_earned: user.rs_earned,
    level: user.level,
    streak_count: user.streak_count,
    next_level_xp: user.nextLevelXP,
    created_at: user.created_at
  };
};

module.exports = {
  submitSubtask,
  issueReward,
  submitBonusActivity,
  issueBonusReward,
  getTaskProgress,
  getRewardsForDate,
  getUserStats
};
