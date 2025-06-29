/**
 * Get the start of day (00:00:00) for a given date in IST timezone
 * This ensures consistent daily task tracking regardless of server timezone
 * @param {Date|string} date - Input date
 * @returns {Date} - Start of day in IST, returned as UTC Date
 */
const getStartOfDay = (date) => {
  const d = new Date(date);
  
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(d.getTime() + istOffset);
  
  // Get start of day in IST
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const day = istTime.getUTCDate();
  
  // Create start of day in IST, then convert back to UTC for storage
  const istStartOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  return new Date(istStartOfDay.getTime() - istOffset);
};

/**
 * Get the end of day (23:59:59.999) for a given date in IST timezone
 * @param {Date|string} date - Input date
 * @returns {Date} - End of day in IST, returned as UTC Date
 */
const getEndOfDay = (date) => {
  const d = new Date(date);
  
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(d.getTime() + istOffset);
  
  // Get end of day in IST
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const day = istTime.getUTCDate();
  
  // Create end of day in IST, then convert back to UTC for storage
  const istEndOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  return new Date(istEndOfDay.getTime() - istOffset);
};

/**
 * Check if a submission is within the time limit for a subtask
 * @param {Date} submittedAt - When the task was submitted
 * @param {Date} targetDate - The target date for completion
 * @param {number} timeLimitMinutes - Time limit in minutes from start of day (0 = anytime)
 * @param {string} subtaskKey - Subtask key for special validation rules
 * @returns {Object} - Validation result
 */
const validateSubmissionTime = (submittedAt, targetDate, timeLimitMinutes, subtaskKey = '') => {
  const submitted = new Date(submittedAt);
  const target = new Date(targetDate);
  
  // Check if submission is on the correct date
  const isCorrectDate = (
    submitted.getDate() === target.getDate() &&
    submitted.getMonth() === target.getMonth() &&
    submitted.getFullYear() === target.getFullYear()
  );
  
  if (!isCorrectDate) {
    return {
      isValid: false,
      message: 'Submission must be on the target date'
    };
  }
  
  // Special case for hair tablets - must be between 11:00 AM and 6:00 PM
  if (subtaskKey === 'hair-tablets') {
    const startOfDay = getStartOfDay(target);
    const startWindow = new Date(startOfDay.getTime() + (11 * 60 * 60 * 1000)); // 11:00 AM
    const endWindow = new Date(startOfDay.getTime() + (18 * 60 * 60 * 1000)); // 6:00 PM
    
    if (submitted < startWindow || submitted > endWindow) {
      return {
        isValid: false,
        message: 'Hair tablets must be taken between 11:00 AM and 6:00 PM'
      };
    }
    
    return {
      isValid: true,
      message: 'Task completed within allowed time window'
    };
  }
  
  // If timeLimitMinutes is 0 or 1440 (24 hours), task can be done anytime during the day
  if (timeLimitMinutes === 0 || timeLimitMinutes >= 1440) {
    return {
      isValid: true,
      message: 'Task completed within allowed time'
    };
  }
  
  // Check if submitted within the time limit (from start of day)
  const startOfDay = getStartOfDay(target);
  const deadline = new Date(startOfDay.getTime() + (timeLimitMinutes * 60 * 1000));
  
  if (submitted > deadline) {
    const deadlineStr = deadline.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return {
      isValid: false,
      message: `Task must be completed before ${deadlineStr}`
    };
  }
  
  return {
    isValid: true,
    message: 'Task completed within time limit'
  };
};

/**
 * Format date to YYYY-MM-DD string
 * @param {Date|string} date - Input date
 * @returns {string} - Formatted date string
 */
const formatDateString = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Get date range for a given period
 * @param {string} period - 'today', 'week', 'month'
 * @param {Date} referenceDate - Reference date (default: today)
 * @returns {Object} - Start and end dates
 */
const getDateRange = (period, referenceDate = new Date()) => {
  const ref = new Date(referenceDate);
  
  switch (period) {
    case 'today':
      return {
        start: getStartOfDay(ref),
        end: getEndOfDay(ref)
      };
      
    case 'week':
      const startOfWeek = new Date(ref);
      startOfWeek.setDate(ref.getDate() - ref.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return {
        start: getStartOfDay(startOfWeek),
        end: getEndOfDay(endOfWeek)
      };
      
    case 'month':
      const startOfMonth = new Date(ref.getFullYear(), ref.getMonth(), 1);
      const endOfMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
      
      return {
        start: getStartOfDay(startOfMonth),
        end: getEndOfDay(endOfMonth)
      };
      
    default:
      throw new Error('Invalid period. Use "today", "week", or "month"');
  }
};

/**
 * Check if two dates are the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} - Whether dates are the same day
 */
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

/**
 * Calculate days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} - Number of days
 */
const daysBetween = (startDate, endDate) => {
  const start = getStartOfDay(startDate);
  const end = getStartOfDay(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get current streak for a user based on submission history
 * @param {Array} submissions - Array of submission dates
 * @param {Date} currentDate - Current date reference
 * @returns {number} - Current streak count
 */
const calculateStreak = (submissions, currentDate = new Date()) => {
  if (!submissions || submissions.length === 0) return 0;
  
  // Sort submissions by date (most recent first)
  const sortedDates = submissions
    .map(sub => formatDateString(sub.date))
    .sort((a, b) => new Date(b) - new Date(a));
  
  // Remove duplicates
  const uniqueDates = [...new Set(sortedDates)];
  
  let streak = 0;
  let checkDate = formatDateString(currentDate);
  
  for (const submissionDate of uniqueDates) {
    if (submissionDate === checkDate) {
      streak++;
      // Move to previous day
      const prevDay = new Date(checkDate);
      prevDay.setDate(prevDay.getDate() - 1);
      checkDate = formatDateString(prevDay);
    } else {
      break;
    }
  }
  
  return streak;
};

module.exports = {
  getStartOfDay,
  getEndOfDay,
  validateSubmissionTime,
  formatDateString,
  getDateRange,
  isSameDay,
  daysBetween,
  calculateStreak
};
