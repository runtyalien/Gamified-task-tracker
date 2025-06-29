const mongoose = require('mongoose');

const taskSubmissionSchema = new mongoose.Schema({
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
taskSubmissionSchema.index({ user_id: 1, task_id: 1, subtask_key: 1, date: 1 });
taskSubmissionSchema.index({ user_id: 1, date: 1 });
taskSubmissionSchema.index({ task_id: 1, date: 1 });

// Ensure one submission per subtask per day per user
taskSubmissionSchema.index(
  { user_id: 1, task_id: 1, subtask_key: 1, date: 1 },
  { unique: true }
);

// Virtual to check if submission is within time limit
taskSubmissionSchema.virtual('isWithinTimeLimit').get(function() {
  if (!this.submitted_at || !this.date) return false;
  
  const submissionTime = new Date(this.submitted_at);
  const targetDate = new Date(this.date);
  
  // Check if submission is on the same day
  return (
    submissionTime.getDate() === targetDate.getDate() &&
    submissionTime.getMonth() === targetDate.getMonth() &&
    submissionTime.getFullYear() === targetDate.getFullYear()
  );
});

// Static method to get submissions for a user on a specific date
taskSubmissionSchema.statics.getSubmissionsByUserAndDate = function(userId, date) {
  const { getStartOfDay } = require('../utils/dateUtils');
  const targetDate = getStartOfDay(date);
  
  return this.find({
    user_id: userId,
    date: targetDate
  }).populate('task_id');
};

// Static method to check if all subtasks are completed for a task on a date
taskSubmissionSchema.statics.areAllSubtasksCompleted = async function(userId, taskId, date, subtaskKeys) {
  const { getStartOfDay } = require('../utils/dateUtils');
  const targetDate = getStartOfDay(date);
  
  const submissions = await this.find({
    user_id: userId,
    task_id: taskId,
    date: targetDate,
    is_valid: true
  });
  
  const submittedSubtaskKeys = submissions.map(sub => sub.subtask_key);
  return subtaskKeys.every(key => submittedSubtaskKeys.includes(key));
};

taskSubmissionSchema.set('toJSON', { virtuals: true });
taskSubmissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TaskSubmission', taskSubmissionSchema);
