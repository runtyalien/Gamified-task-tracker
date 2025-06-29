const mongoose = require('mongoose');

const bonusSubmissionSchema = new mongoose.Schema({
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
  subtask_key: {
    type: String,
    required: [true, 'Subtask key is required'],
    trim: true
  },
  bonus_type: {
    type: String,
    required: [true, 'Bonus type is required'],
    enum: ['additional_video', 'extra_activity'],
    trim: true
  },
  image_url: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  presigned_url: {
    type: String,
    trim: true
  },
  s3_key: {
    type: String,
    trim: true
  },
  submitted_at: {
    type: Date,
    required: [true, 'Submission time is required']
  },
  date: {
    type: Date,
    required: [true, 'Submission date is required']
  },
  reward_rs: {
    type: Number,
    required: [true, 'Bonus reward Rs is required'],
    min: [0, 'Reward Rs cannot be negative']
  },
  reward_xp: {
    type: Number,
    default: 0,
    min: [0, 'Reward XP cannot be negative']
  },
  is_valid: {
    type: Boolean,
    default: true
  },
  validation_message: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
bonusSubmissionSchema.index({ user_id: 1, task_id: 1, date: 1 });
bonusSubmissionSchema.index({ user_id: 1, date: 1 });
bonusSubmissionSchema.index({ bonus_type: 1, date: 1 });

// Static methods
bonusSubmissionSchema.statics.getBonusCountForDate = function(userId, taskId, subtaskKey, date) {
  return this.countDocuments({
    user_id: userId,
    task_id: taskId,
    subtask_key: subtaskKey,
    date: date,
    is_valid: true
  });
};

bonusSubmissionSchema.statics.getTotalBonusRewardsForDate = function(userId, date) {
  return this.aggregate([
    {
      $match: {
        user_id: mongoose.Types.ObjectId(userId),
        date: date,
        is_valid: true
      }
    },
    {
      $group: {
        _id: null,
        total_rs: { $sum: '$reward_rs' },
        total_xp: { $sum: '$reward_xp' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance methods
bonusSubmissionSchema.methods.toJSON = function() {
  const bonus = this.toObject();
  bonus.id = bonus._id;
  delete bonus._id;
  delete bonus.__v;
  return bonus;
};

module.exports = mongoose.model('BonusSubmission', bonusSubmissionSchema);
