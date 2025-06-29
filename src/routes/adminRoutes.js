const express = require('express');
const { manualReset, getResetStats, getDailyProgress } = require('../services/dailyResetService');
const { getJobStatus } = require('../jobs/dailyResetJob');
const router = express.Router();

/**
 * Manual reset endpoint for testing/admin
 * POST /api/admin/reset-daily
 */
router.post('/reset-daily', async (req, res) => {
  try {
    console.log('🔧 Manual reset triggered via API');
    const result = await manualReset();
    
    res.status(200).json({
      success: true,
      message: 'Daily reset completed successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Manual reset failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Daily reset failed'
    });
  }
});

/**
 * Get reset statistics
 * GET /api/admin/reset-stats?days=7
 */
router.get('/reset-stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = await getResetStats(days);
    
    res.status(200).json({
      success: true,
      data: {
        period_days: days,
        stats
      }
    });
  } catch (error) {
    console.error('❌ Error getting reset stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get cron job status
 * GET /api/admin/job-status
 */
router.get('/job-status', (req, res) => {
  try {
    const status = getJobStatus();
    
    res.status(200).json({
      success: true,
      data: {
        daily_reset_job: status,
        server_time: new Date().toISOString(),
        server_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's daily progress
 * GET /api/admin/daily-progress/:userId/:date
 */
router.get('/daily-progress/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;
    const targetDate = new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const dailyProgress = await getDailyProgress(userId, targetDate);
    
    res.status(200).json({
      success: true,
      data: dailyProgress
    });
  } catch (error) {
    console.error('❌ Error getting daily progress:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
