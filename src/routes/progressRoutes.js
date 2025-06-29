const express = require('express');
const {
  getProgressByDate,
  getProgressRange,
  getWeeklyProgress
} = require('../controllers/progressController');
const { validateDate } = require('../middleware/validation');

const router = express.Router();

// GET /api/progress/:date - Get task progress for a specific date
router.get('/:date', validateDate, getProgressByDate);

// POST /api/progress/range - Get progress for multiple dates
router.post('/range', getProgressRange);

// GET /api/progress/weekly/:date - Get weekly progress summary
router.get('/weekly/:date', validateDate, getWeeklyProgress);

module.exports = router;
