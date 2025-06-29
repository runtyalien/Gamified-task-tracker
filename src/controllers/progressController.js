const { getTaskProgress } = require('../services/taskService');
const { getStartOfDay } = require('../utils/dateUtils');

/**
 * Get task progress for a specific date
 * GET /api/progress/:date
 */
const getProgressByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { user_id } = req.query;
    
    // If user_id not provided in query, it should come from authentication middleware
    const userId = user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Validate date format
    const inputDate = new Date(date);
    if (isNaN(inputDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // Convert to IST-aware start of day for consistent querying
    const targetDate = getStartOfDay(inputDate);
    
    // Debug logging
    console.log('🔍 Progress request:', { userId, date, inputDate: inputDate.toISOString(), targetDate: targetDate.toISOString() });
    
    const progress = await getTaskProgress(userId, targetDate);
    
    // Debug logging for progress results
    console.log(`📊 Progress result: ${progress.length} tasks found`);
    progress.forEach((task, index) => {
      const completedWithImages = task.subtasks.filter(st => st.completed && st.submission && st.submission.image_url).length;
      console.log(`   ${index + 1}. ${task.task_name}: ${task.progress.completed}/${task.progress.total} completed, ${completedWithImages} with images`);
    });
    
    // Calculate overall progress
    const totalTasks = progress.length;
    const completedTasks = progress.filter(p => p.is_completed).length;
    const totalSubtasks = progress.reduce((sum, p) => sum + p.progress.total, 0);
    const completedSubtasks = progress.reduce((sum, p) => sum + p.progress.completed, 0);
    
    res.status(200).json({
      success: true,
      data: {
        date: date,
        tasks: progress,
        summary: {
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          task_completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          total_subtasks: totalSubtasks,
          completed_subtasks: completedSubtasks,
          subtask_completion_rate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get progress for multiple dates
 * POST /api/progress/range
 */
const getProgressRange = async (req, res, next) => {
  try {
    const { start_date, end_date, user_id } = req.body;
    
    // If user_id not provided in body, it should come from authentication middleware
    const userId = user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date must be before or equal to end date'
      });
    }
    
    // Get progress for each date in range
    const progressData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateProgress = await getTaskProgress(userId, currentDate);
      
      const totalTasks = dateProgress.length;
      const completedTasks = dateProgress.filter(p => p.is_completed).length;
      const totalSubtasks = dateProgress.reduce((sum, p) => sum + p.progress.total, 0);
      const completedSubtasks = dateProgress.reduce((sum, p) => sum + p.progress.completed, 0);
      
      progressData.push({
        date: currentDate.toISOString().split('T')[0],
        summary: {
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          task_completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          total_subtasks: totalSubtasks,
          completed_subtasks: completedSubtasks,
          subtask_completion_rate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
        },
        tasks: dateProgress
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.status(200).json({
      success: true,
      data: {
        start_date,
        end_date,
        progress: progressData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get weekly progress summary
 * GET /api/progress/weekly/:date
 */
const getWeeklyProgress = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { user_id } = req.query;
    
    // If user_id not provided in query, it should come from authentication middleware
    const userId = user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const referenceDate = new Date(date);
    if (isNaN(referenceDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // Get start of week (Sunday)
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
    
    // Get end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Get progress for each day of the week
    const weeklyProgress = [];
    const currentDate = new Date(startOfWeek);
    
    while (currentDate <= endOfWeek) {
      const dayProgress = await getTaskProgress(userId, currentDate);
      
      const totalTasks = dayProgress.length;
      const completedTasks = dayProgress.filter(p => p.is_completed).length;
      
      weeklyProgress.push({
        date: currentDate.toISOString().split('T')[0],
        day_name: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        completed_tasks: completedTasks,
        total_tasks: totalTasks,
        completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate weekly summary
    const weeklyTotalTasks = weeklyProgress.reduce((sum, day) => sum + day.total_tasks, 0);
    const weeklyCompletedTasks = weeklyProgress.reduce((sum, day) => sum + day.completed_tasks, 0);
    
    res.status(200).json({
      success: true,
      data: {
        week_start: startOfWeek.toISOString().split('T')[0],
        week_end: endOfWeek.toISOString().split('T')[0],
        daily_progress: weeklyProgress,
        weekly_summary: {
          total_tasks: weeklyTotalTasks,
          completed_tasks: weeklyCompletedTasks,
          completion_rate: weeklyTotalTasks > 0 ? Math.round((weeklyCompletedTasks / weeklyTotalTasks) * 100) : 0,
          productive_days: weeklyProgress.filter(day => day.completion_rate > 0).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgressByDate,
  getProgressRange,
  getWeeklyProgress
};
