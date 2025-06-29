const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subtask name is required'],
    trim: true
  },
  key: {
    type: String,
    required: [true, 'Subtask key is required'],
    trim: true
  },
  time_limit: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: [0, 'Time limit cannot be negative (0 = anytime during day)']
  }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [200, 'Task name cannot exceed 200 characters']
  },
  key: {
    type: String,
    required: [true, 'Task key is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  subtasks: [subtaskSchema],
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  is_active: {
    type: Boolean,
    default: true
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

// Update timestamp on save
taskSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Validate subtask keys are unique within a task
taskSchema.pre('save', function(next) {
  const subtaskKeys = this.subtasks.map(st => st.key);
  const uniqueKeys = [...new Set(subtaskKeys)];
  
  if (subtaskKeys.length !== uniqueKeys.length) {
    return next(new Error('Subtask keys must be unique within a task'));
  }
  
  next();
});

// Instance method to get subtask by key
taskSchema.methods.getSubtaskByKey = function(subtaskKey) {
  return this.subtasks.find(subtask => subtask.key === subtaskKey);
};

module.exports = mongoose.model('Task', taskSchema);
