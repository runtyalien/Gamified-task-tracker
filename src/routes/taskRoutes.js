const express = require('express');
const {
  submitSubtaskController,
  submitBonusActivityController,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const {
  validateTaskSubmission,
  validateBonusSubmission,
  validateTaskCreation,
  validateObjectId
} = require('../middleware/validation');

const router = express.Router();

// POST /api/tasks/:taskId/subtasks/:subtaskKey/submit - Submit subtask with image proof
router.post(
  '/:taskId/subtasks/:subtaskKey/submit',
  validateTaskSubmission,
  submitSubtaskController
);

// POST /api/tasks/:taskId/subtasks/:subtaskKey/bonus - Submit bonus activity
router.post(
  '/:taskId/subtasks/:subtaskKey/bonus',
  validateBonusSubmission,
  submitBonusActivityController
);

// GET /api/tasks - Get all tasks
router.get('/', getAllTasks);

// POST /api/tasks - Create a new task
router.post('/', validateTaskCreation, createTask);

// GET /api/tasks/:taskId - Get specific task
router.get('/:taskId', validateObjectId('taskId'), getTaskById);

// PUT /api/tasks/:taskId - Update task
router.put('/:taskId', validateObjectId('taskId'), updateTask);

// DELETE /api/tasks/:taskId - Delete task
router.delete('/:taskId', validateObjectId('taskId'), deleteTask);

module.exports = router;
