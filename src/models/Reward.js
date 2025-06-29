const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Reward date is required']
  },
  reward_rs: {
    type: Number,
    required: [true, 'Reward Rs is required'],
    min: [0, 'Reward Rs cannot be negative']
  },
  reward_xp: {
    type: Number,
    required: [true, 'Reward XP is required'],
    min: [0, 'Reward XP cannot be negative']
  },
  awarded_at: {
    type: Date,
    default: Date.now
  },
  bonus_multiplier: {
    type: Number,
    default: 1,
    min: [0.1, 'Bonus multiplier cannot be less than 0.1']
  },
  bonus_reason: {
    type: String,
    trim: true
  }
});

// Compound index for efficient queries
rewardSchema.index({ user_id: 1, task_id: 1, date: 1 });
rewardSchema.index({ user_id: 1, date: 1 });
rewardSchema.index({ task_id: 1, date: 1 });

// Ensure one reward per task per day per user
rewardSchema.index(
  { user_id: 1, task_id: 1, date: 1 },
  { unique: true }
);

// Virtual for total reward amount
rewardSchema.virtual('totalRewardRs').get(function() {
  return Math.round(this.reward_rs * this.bonus_multiplier);
});

rewardSchema.virtual('totalRewardXp').get(function() {
  return Math.round(this.reward_xp * this.bonus_multiplier);
});

// Static method to get rewards for a user on a specific date
rewardSchema.statics.getRewardsByUserAndDate = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    user_id: userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('task_id', 'name key');
};

// Static method to calculate total rewards for a user in a date range
rewardSchema.statics.getTotalRewardsInRange = async function(userId, startDate, endDate) {
  const rewards = await this.find({
    user_id: userId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });
  
  return rewards.reduce((total, reward) => {
    return {
      rs: total.rs + reward.totalRewardRs,
      xp: total.xp + reward.totalRewardXp
    };
  }, { rs: 0, xp: 0 });
};

rewardSchema.set('toJSON', { virtuals: true });
rewardSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reward', rewardSchema);
