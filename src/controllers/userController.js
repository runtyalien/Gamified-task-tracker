const { getUserStats } = require('../services/taskService');
const User = require('../models/User');

/**
 * Create a new user
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    const user = new User({ name });
    await user.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        xp: user.xp,
        rs_earned: user.rs_earned,
        level: user.level,
        streak_count: user.streak_count,
        next_level_xp: user.nextLevelXP,
        created_at: user.created_at
      },
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:userId
 */
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const userStats = await getUserStats(userId);
    
    res.status(200).json({
      success: true,
      data: userStats
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    next(error);
  }
};

/**
 * Update user
 * PUT /api/users/:userId
 */
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be directly updated
    delete updateData.level; // Level is calculated from XP
    delete updateData.created_at;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        xp: user.xp,
        rs_earned: user.rs_earned,
        level: user.level,
        streak_count: user.streak_count,
        next_level_xp: user.nextLevelXP,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * DELETE /api/users/:userId
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (paginated)
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-xp' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const users = await User.find()
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    const totalUsers = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      data: users.map(user => ({
        id: user._id,
        name: user.name,
        xp: user.xp,
        rs_earned: user.rs_earned,
        level: user.level,
        streak_count: user.streak_count,
        next_level_xp: user.nextLevelXP,
        created_at: user.created_at,
        updated_at: user.updated_at
      })),
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(totalUsers / limitNum),
        total_users: totalUsers,
        has_next: pageNum < Math.ceil(totalUsers / limitNum),
        has_prev: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user leaderboard
 * GET /api/users/leaderboard
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10, type = 'xp' } = req.query;
    
    let sortField;
    switch (type) {
      case 'xp':
        sortField = '-xp';
        break;
      case 'rs':
        sortField = '-rs_earned';
        break;
      case 'level':
        sortField = '-level';
        break;
      case 'streak':
        sortField = '-streak_count';
        break;
      default:
        sortField = '-xp';
    }
    
    const users = await User.find()
      .sort(sortField)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        leaderboard_type: type,
        rankings: users.map((user, index) => ({
          rank: index + 1,
          id: user._id,
          name: user.name,
          xp: user.xp,
          rs_earned: user.rs_earned,
          level: user.level,
          streak_count: user.streak_count,
          value: type === 'xp' ? user.xp 
                : type === 'rs' ? user.rs_earned 
                : type === 'level' ? user.level 
                : user.streak_count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset user progress
 * POST /api/users/:userId/reset
 */
const resetUserProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reset_type = 'all' } = req.body; // 'all', 'xp', 'rs', 'streak'
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    switch (reset_type) {
      case 'all':
        user.xp = 0;
        user.rs_earned = 0;
        user.streak_count = 0;
        break;
      case 'xp':
        user.xp = 0;
        break;
      case 'rs':
        user.rs_earned = 0;
        break;
      case 'streak':
        user.streak_count = 0;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid reset type. Use: all, xp, rs, or streak'
        });
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        xp: user.xp,
        rs_earned: user.rs_earned,
        level: user.level,
        streak_count: user.streak_count,
        next_level_xp: user.nextLevelXP,
        reset_type: reset_type
      },
      message: `User ${reset_type} progress reset successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getLeaderboard,
  resetUserProgress
};
