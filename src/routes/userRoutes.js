const express = require('express');
const {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getLeaderboard,
  resetUserProgress
} = require('../controllers/userController');
const {
  validateUserCreation,
  validateUserUpdate,
  validateObjectId
} = require('../middleware/validation');

const router = express.Router();

// GET /api/users - Get all users (paginated)
router.get('/', getAllUsers);

// POST /api/users - Create a new user
router.post('/', validateUserCreation, createUser);

// GET /api/users/leaderboard - Get user leaderboard
router.get('/leaderboard', getLeaderboard);

// GET /api/users/:userId - Get user by ID
router.get('/:userId', validateObjectId('userId'), getUserById);

// PUT /api/users/:userId - Update user
router.put('/:userId', validateObjectId('userId'), validateUserUpdate, updateUser);

// DELETE /api/users/:userId - Delete user
router.delete('/:userId', validateObjectId('userId'), deleteUser);

// POST /api/users/:userId/reset - Reset user progress
router.post('/:userId/reset', validateObjectId('userId'), resetUserProgress);

module.exports = router;
