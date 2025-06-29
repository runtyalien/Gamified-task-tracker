const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  xp: {
    type: Number,
    default: 0,
    min: [0, 'XP cannot be negative']
  },
  rs_earned: {
    type: Number,
    default: 0,
    min: [0, 'Rs earned cannot be negative']
  },
  level: {
    type: Number,
    default: 1,
    min: [1, 'Level cannot be less than 1']
  },
  streak_count: {
    type: Number,
    default: 0,
    min: [0, 'Streak count cannot be negative']
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

// Calculate level based on XP
userSchema.methods.calculateLevel = function() {
  // Level progression: 100 XP for level 1, 200 for level 2, etc.
  const baseXP = 100;
  const level = Math.floor(this.xp / baseXP) + 1;
  return level;
};

// Update level based on current XP
userSchema.pre('save', function(next) {
  this.level = this.calculateLevel();
  this.updated_at = new Date();
  next();
});

// Virtual for next level XP requirement
userSchema.virtual('nextLevelXP').get(function() {
  const currentLevel = this.level;
  const baseXP = 100;
  return currentLevel * baseXP;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
