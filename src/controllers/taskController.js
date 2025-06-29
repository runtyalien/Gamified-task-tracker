const { submitSubtask, getUserStats, submitBonusActivity } = require('../services/taskService');
const Task = require('../models/Task');

/**
 * Submit a subtask with image proof
 * POST /api/tasks/:taskId/subtasks/:subtaskKey/submit
 */
const submitSubtaskController = async (req, res, next) => {
  try {
    const { taskId, subtaskKey } = req.params;
    const { image_url, presigned_url, s3_key, submitted_at, user_id } = req.body;
    
    // If user_id not provided in body, it should come from authentication middleware
    const userId = user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const result = await submitSubtask(
      userId,
      taskId,
      subtaskKey,
      image_url,
      new Date(submitted_at),
      presigned_url,
      s3_key
    );
    
    res.status(201).json({
      success: true,
      data: {
        submission: {
          id: result.submission._id,
          user_id: result.submission.user_id,
          task_id: result.submission.task_id,
          subtask_key: result.submission.subtask_key,
          image_url: result.submission.image_url,
          submitted_at: result.submission.submitted_at,
          date: result.submission.date,
          is_valid: result.submission.is_valid,
          validation_message: result.submission.validation_message
        },
        task_completed: result.taskCompleted,
        reward: result.reward ? {
          id: result.reward._id,
          reward_rs: result.reward.totalRewardRs,
          reward_xp: result.reward.totalRewardXp,
          awarded_at: result.reward.awarded_at
        } : null
      },
      message: result.taskCompleted 
        ? 'Subtask submitted and task completed! Reward issued.' 
        : 'Subtask submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a bonus activity
 * POST /api/tasks/:taskId/subtasks/:subtaskKey/bonus
 */
const submitBonusActivityController = async (req, res, next) => {
  try {
    const { taskId, subtaskKey } = req.params;
    const { image_url, presigned_url, s3_key, submitted_at, user_id, bonus_type, reward_rs } = req.body;
    
    // If user_id not provided in body, it should come from authentication middleware
    const userId = user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const result = await submitBonusActivity(
      userId,
      taskId,
      subtaskKey,
      bonus_type || 'additional_video',
      image_url,
      new Date(submitted_at),
      reward_rs || 20,
      presigned_url,
      s3_key
    );
    
    res.status(201).json({
      success: true,
      data: {
        submission: {
          id: result.submission._id,
          user_id: result.submission.user_id,
          task_id: result.submission.task_id,
          subtask_key: result.submission.subtask_key,
          bonus_type: result.submission.bonus_type,
          image_url: result.submission.image_url,
          submitted_at: result.submission.submitted_at,
          date: result.submission.date,
          is_valid: result.submission.is_valid,
          validation_message: result.submission.validation_message
        },
        reward: result.reward ? {
          id: result.reward._id,
          reward_rs: result.reward.totalRewardRs,
          reward_xp: result.reward.totalRewardXp,
          awarded_at: result.reward.awarded_at
        } : null
      },
      message: 'Bonus activity submitted successfully! Bonus reward issued.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks
 * GET /api/tasks
 */
const getAllTasks = async (req, res, next) => {
  try {
    const { active } = req.query;
    
    const filter = {};
    if (active !== undefined) {
      filter.is_active = active === 'true';
    }
    
    const tasks = await Task.find(filter).sort({ created_at: -1 });
    
    res.status(200).json({
      success: true,
      data: tasks.map(task => ({
        id: task._id,
        name: task.name,
        key: task.key,
        description: task.description,
        subtasks: task.subtasks,
        reward_rs: task.reward_rs,
        reward_xp: task.reward_xp,
        is_active: task.is_active,
        created_at: task.created_at,
        updated_at: task.updated_at
      })),
      count: tasks.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific task
 * GET /api/tasks/:taskId
 */
const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: task._id,
        name: task.name,
        key: task.key,
        description: task.description,
        subtasks: task.subtasks,
        reward_rs: task.reward_rs,
        reward_xp: task.reward_xp,
        is_active: task.is_active,
        created_at: task.created_at,
        updated_at: task.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 * POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const taskData = req.body;
    
    const task = new Task(taskData);
    await task.save();
    
    res.status(201).json({
      success: true,
      data: {
        id: task._id,
        name: task.name,
        key: task.key,
        description: task.description,
        subtasks: task.subtasks,
        reward_rs: task.reward_rs,
        reward_xp: task.reward_xp,
        is_active: task.is_active,
        created_at: task.created_at,
        updated_at: task.updated_at
      },
      message: 'Task created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 * PUT /api/tasks/:taskId
 */
const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;
    
    const task = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: task._id,
        name: task.name,
        key: task.key,
        description: task.description,
        subtasks: task.subtasks,
        reward_rs: task.reward_rs,
        reward_xp: task.reward_xp,
        is_active: task.is_active,
        created_at: task.created_at,
        updated_at: task.updated_at
      },
      message: 'Task updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:taskId
 */
const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findByIdAndDelete(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitSubtaskController,
  submitBonusActivityController,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
