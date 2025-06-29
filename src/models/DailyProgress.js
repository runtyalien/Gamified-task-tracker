const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  task_progress: [{
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    task_key: {
      type: String,
      required: true
    },
    completed_subtasks: [{
      subtask_key: String,
      completed_at: Date,
      image_url: String,
      presigned_url: String,
      s3_key: String,
      is_valid: {
        type: Boolean,
        default: true
      },
      validation_message: String
    }],
    is_task_completed: {
      type: Boolean,
      default: false
    },
    reward_earned: {
      type: Boolean,
      default: false
    },
    completion_rate: {
      type: Number,
      default: 0
    }
  }],
  daily_stats: {
    total_tasks: {
      type: Number,
      default: 0
    },
    completed_tasks: {
      type: Number,
      default: 0
    },
    total_subtasks: {
      type: Number,
      default: 0
    },
    completed_subtasks: {
      type: Number,
      default: 0
    },
    total_rewards_rs: {
      type: Number,
      default: 0
    },
    total_rewards_xp: {
      type: Number,
      default: 0
    }
  },
  is_reset_day: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
dailyProgressSchema.index({ user_id: 1, date: 1 }, { unique: true });
dailyProgressSchema.index({ date: 1, is_reset_day: 1 });

// Update the updated_at field before saving
dailyProgressSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Static method to get or create daily progress
dailyProgressSchema.statics.getOrCreateDailyProgress = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  let dailyProgress = await this.findOne({
    user_id: userId,
    date: startOfDay
  });
  
  if (!dailyProgress) {
    // Get all active tasks to initialize progress
    const Task = require('./Task');
    const activeTasks = await Task.find({ is_active: true });
    
    const taskProgress = activeTasks.map(task => ({
      task_id: task._id,
      task_key: task.key,
      completed_subtasks: [],
      is_task_completed: false,
      reward_earned: false,
      completion_rate: 0
    }));
    
    dailyProgress = new this({
      user_id: userId,
      date: startOfDay,
      task_progress: taskProgress,
      daily_stats: {
        total_tasks: activeTasks.length,
        total_subtasks: activeTasks.reduce((sum, task) => sum + task.subtasks.length, 0)
      }
    });
    
    await dailyProgress.save();
  }
  
  return dailyProgress;
};

// Static method to mark progress as completed for a subtask
dailyProgressSchema.statics.markSubtaskCompleted = async function(userId, date, taskId, subtaskKey, submissionData) {
  const dailyProgress = await this.getOrCreateDailyProgress(userId, date);
  
  const taskProgress = dailyProgress.task_progress.find(tp => tp.task_id.toString() === taskId.toString());
  if (!taskProgress) {
    throw new Error('Task not found in daily progress');
  }
  
  // Check if subtask already completed
  const existingSubtask = taskProgress.completed_subtasks.find(st => st.subtask_key === subtaskKey);
  if (existingSubtask) {
    throw new Error('Subtask already completed for this day');
  }
  
  // Add completed subtask
  taskProgress.completed_subtasks.push({
    subtask_key: subtaskKey,
    completed_at: new Date(),
    image_url: submissionData.image_url,
    presigned_url: submissionData.presigned_url,
    s3_key: submissionData.s3_key,
    is_valid: submissionData.is_valid,
    validation_message: submissionData.validation_message
  });
  
  // Update completion rate and task status
  const Task = require('./Task');
  const task = await Task.findById(taskId);
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = taskProgress.completed_subtasks.length;
  
  taskProgress.completion_rate = Math.round((completedSubtasks / totalSubtasks) * 100);
  taskProgress.is_task_completed = completedSubtasks === totalSubtasks;
  
  // Check if reward should be earned (all subtasks completed and valid)
  if (taskProgress.is_task_completed) {
    const allValid = taskProgress.completed_subtasks.every(st => st.is_valid);
    taskProgress.reward_earned = allValid;
    
    if (allValid) {
      dailyProgress.daily_stats.total_rewards_rs += task.reward_rs;
      dailyProgress.daily_stats.total_rewards_xp += task.reward_xp;
    }
  }
  
  // Update daily stats
  dailyProgress.daily_stats.completed_subtasks = dailyProgress.task_progress.reduce(
    (sum, tp) => sum + tp.completed_subtasks.length, 0
  );
  dailyProgress.daily_stats.completed_tasks = dailyProgress.task_progress.filter(
    tp => tp.is_task_completed
  ).length;
  
  await dailyProgress.save();
  return dailyProgress;
};

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
