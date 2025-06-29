const express = require('express');
const {
  getRewardsByDate,
  getRewardsRange,
  getRewardStats,
  getAllRewards
} = require('../controllers/rewardController');
const { validateDate } = require('../middleware/validation');

const router = express.Router();

// GET /api/rewards - Get all rewards (paginated)
router.get('/', getAllRewards);

// GET /api/rewards/:date - Get rewards for a specific date
router.get('/:date', validateDate, getRewardsByDate);

// POST /api/rewards/range - Get rewards for a date range
router.post('/range', getRewardsRange);

// GET /api/rewards/stats/:period - Get reward statistics (today/week/month)
router.get('/stats/:period', getRewardStats);

module.exports = router;
