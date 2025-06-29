const cron = require('node-cron');
const { performDailyReset } = require('../services/dailyResetService');

/**
 * Daily reset cron job that runs at 12:00 AM IST every day
 * Timezone: Asia/Kolkata (IST)
 */
const initializeDailyResetJob = () => {
  console.log('🕐 Initializing daily reset cron job...');
  
  // Run at 12:00 AM IST every day
  const resetJob = cron.schedule('0 0 * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`\n🌅 [${timestamp}] Daily reset job triggered`);
    
    try {
      const result = await performDailyReset();
      console.log(`✅ [${timestamp}] Daily reset completed:`, result);
    } catch (error) {
      console.error(`❌ [${timestamp}] Daily reset failed:`, error);
      
      // Here you could add alerting (email, Slack, etc.)
      // For now, we'll just log the error
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // IST timezone
  });
  
  console.log('✅ Daily reset cron job initialized');
  console.log('📅 Will run at 12:00 AM IST every day');
  
  // Optional: Log next scheduled run (node-cron doesn't have nextDate method)
  console.log('⏰ Next scheduled reset: Daily at 12:00 AM IST');
  
  return resetJob;
};

/**
 * Get cron job status
 */
const getJobStatus = () => {
  return {
    scheduled: true,
    timezone: 'Asia/Kolkata',
    schedule: '0 0 * * *', // 12:00 AM daily
    description: 'Daily progress reset at midnight IST'
  };
};

module.exports = {
  initializeDailyResetJob,
  getJobStatus
};
