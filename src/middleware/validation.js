const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

// Task submission validation
const validateTaskSubmission = [
  param('taskId')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  param('subtaskKey')
    .isLength({ min: 1, max: 50 })
    .withMessage('Subtask key must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Subtask key can only contain letters, numbers, hyphens, and underscores'),
  body('image_url')
    .isURL()
    .withMessage('Invalid image URL format'),
  body('submitted_at')
    .isISO8601()
    .withMessage('Invalid date format for submitted_at'),
  body('user_id')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  handleValidationErrors
];

// Bonus activity submission validation
const validateBonusSubmission = [
  param('taskId')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  param('subtaskKey')
    .isLength({ min: 1, max: 50 })
    .withMessage('Subtask key must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Subtask key can only contain letters, numbers, hyphens, and underscores'),
  body('image_url')
    .isURL()
    .withMessage('Invalid image URL format'),
  body('submitted_at')
    .isISO8601()
    .withMessage('Invalid date format for submitted_at'),
  body('user_id')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('bonus_type')
    .optional()
    .isIn(['additional_video', 'extra_activity'])
    .withMessage('Invalid bonus type. Must be either additional_video or extra_activity'),
  body('reward_rs')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Reward Rs must be between 1 and 1000'),
  handleValidationErrors
];

// Date validation
const validateDate = [
  param('date')
    .isISO8601({ strict: false })
    .withMessage('Invalid date format (use YYYY-MM-DD)'),
  handleValidationErrors
];

// S3 presign validation
const validateS3Presign = [
  body('fileName')
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters')
    .matches(/\.(jpg|jpeg|png|gif|webp)$/i)
    .withMessage('Only image files are allowed (jpg, jpeg, png, gif, webp)'),
  body('fileType')
    .isIn(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
    .withMessage('Invalid file type'),
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  handleValidationErrors
];

// User creation validation
const validateUserCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  handleValidationErrors
];

// User update validation
const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  body('xp')
    .optional()
    .isInt({ min: 0 })
    .withMessage('XP must be a non-negative integer'),
  body('rs_earned')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Rs earned must be a non-negative integer'),
  body('streak_count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Streak count must be a non-negative integer'),
  handleValidationErrors
];

// Task creation validation
const validateTaskCreation = [
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Task name must be between 1 and 200 characters')
    .trim(),
  body('key')
    .isLength({ min: 1, max: 50 })
    .withMessage('Task key must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Task key can only contain letters, numbers, hyphens, and underscores')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  body('subtasks')
    .isArray({ min: 1 })
    .withMessage('At least one subtask is required'),
  body('subtasks.*.name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Subtask name must be between 1 and 100 characters')
    .trim(),
  body('subtasks.*.key')
    .isLength({ min: 1, max: 50 })
    .withMessage('Subtask key must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Subtask key can only contain letters, numbers, hyphens, and underscores')
    .trim(),
  body('subtasks.*.time_limit')
    .isInt({ min: 0 })
    .withMessage('Time limit must be 0 or positive (0 = anytime during day)'),
  body('reward_rs')
    .isInt({ min: 0 })
    .withMessage('Reward Rs must be a non-negative integer'),
  body('reward_xp')
    .isInt({ min: 0 })
    .withMessage('Reward XP must be a non-negative integer'),
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  handleValidationErrors
];

module.exports = {
  validateTaskSubmission,
  validateBonusSubmission,
  validateDate,
  validateS3Presign,
  validateUserCreation,
  validateUserUpdate,
  validateTaskCreation,
  validateObjectId,
  handleValidationErrors
};
