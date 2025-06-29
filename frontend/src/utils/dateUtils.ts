/**
 * Date utilities for consistent date handling across the application
 * All dates are handled in IST timezone for daily task tracking
 */

/**
 * Get current date in IST timezone formatted as YYYY-MM-DD
 * This ensures consistent date handling between frontend and backend
 */
export const getCurrentDateIST = (): string => {
  // Get current time in IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  
  return istTime.toISOString().split('T')[0];
};

/**
 * Get start of day in IST timezone
 * This matches the backend's getStartOfDay logic
 */
export const getStartOfDayIST = (date?: Date | string): Date => {
  const d = date ? new Date(date) : new Date();
  
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(d.getTime() + istOffset);
  
  // Get start of day in IST
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const day = istTime.getUTCDate();
  
  // Create start of day in IST, then convert back to UTC
  const istStartOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  return new Date(istStartOfDay.getTime() - istOffset);
};

/**
 * Check if it's a new day in IST timezone
 * Used for determining when to reset daily progress
 */
export const isNewDayIST = (lastDate: string): boolean => {
  const currentDateIST = getCurrentDateIST();
  return currentDateIST !== lastDate;
};

/**
 * Format date consistently for API calls
 */
export const formatDateForAPI = (date?: Date): string => {
  if (!date) {
    return getCurrentDateIST();
  }
  
  // Ensure we're using IST timezone
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffset);
  return istTime.toISOString().split('T')[0];
};

/**
 * Check if current time is past midnight IST (for daily reset)
 */
export const shouldResetDailyProgress = (lastResetDate: string): boolean => {
  const currentDateIST = getCurrentDateIST();
  return currentDateIST !== lastResetDate;
};
