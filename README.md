# Gamified Task Tracker Backend

A production-ready Node.js + Express + MongoDB backend for a gamified task tracker application with AWS S3 integration for image uploads.

## Features

- ✅ RESTful API with Express.js
- ✅ MongoDB integration with Mongoose ODM
- ✅ AWS S3 pre-signed URLs for secure image uploads
- ✅ Gamification system with XP, levels, streaks, and rewards
- ✅ Task and subtask management
- ✅ Progress tracking and analytics
- ✅ Input validation and error handling
- ✅ Security middleware (Helmet, CORS)
- ✅ Request logging with Morgan

## Data Models

### 1. User
```javascript
{
  name: String,           // User's name
  xp: Number,            // Total experience points
  rs_earned: Number,     // Total rupees earned
  level: Number,         // Current level (calculated from XP)
  streak_count: Number   // Current streak count
}
```

### 2. Task (Master List)
```javascript
{
  name: String,                    // Task name
  key: String,                     // Unique task identifier
  subtasks: [{
    name: String,                  // Subtask name
    key: String,                   // Unique subtask identifier
    time_limit: Number             // Time limit in minutes
  }],
  reward_rs: Number,               // Reward in rupees
  reward_xp: Number                // Reward in XP
}
```

### 3. TaskSubmission (Daily Log)
```javascript
{
  user_id: ObjectId,               // Reference to User
  task_id: ObjectId,               // Reference to Task
  subtask_key: String,             // Subtask identifier
  image_url: String,               // S3 image URL
  submitted_at: Date,              // Submission timestamp
  date: Date                       // Target completion date
}
```

### 4. Reward (Daily Awarded Reward)
```javascript
{
  user_id: ObjectId,               // Reference to User
  task_id: ObjectId,               // Reference to Task
  date: Date,                      // Reward date
  reward_rs: Number,               // Rupees awarded
  reward_xp: Number,               // XP awarded
  awarded_at: Date                 // When reward was issued
}
```

## API Endpoints

### S3 Operations
- `POST /api/s3/presign` - Get pre-signed S3 URL for image upload
- `GET /api/s3/exists/:key` - Check if file exists in S3
- `DELETE /api/s3/delete/:key` - Delete file from S3

### Task Management
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:taskId` - Get specific task
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task
- `POST /api/tasks/:taskId/subtasks/:subtaskKey/submit` - Submit subtask with image proof

### Progress Tracking
- `GET /api/progress/:date` - Get task completion status for date
- `POST /api/progress/range` - Get progress for date range
- `GET /api/progress/weekly/:date` - Get weekly progress summary

### Rewards System
- `GET /api/rewards/:date` - Get reward details for date
- `POST /api/rewards/range` - Get rewards for date range
- `GET /api/rewards/stats/:period` - Get reward statistics (today/week/month)
- `GET /api/rewards` - Get all rewards (paginated)

### User Management
- `GET /api/users` - Get all users (paginated)
- `POST /api/users` - Create new user
- `GET /api/users/:userId` - Get user details and stats
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user
- `GET /api/users/leaderboard` - Get user leaderboard
- `POST /api/users/:userId/reset` - Reset user progress

### Health Check
- `GET /health` - API health status

## Business Logic

### Subtask Submission Flow
1. User submits subtask with image proof and timestamp
2. System validates submission time against subtask time limit
3. Image URL and submission details are stored in TaskSubmission collection
4. System checks if all subtasks for the parent task are completed
5. If all subtasks complete → automatic reward issuance
6. User XP, rupees, and level are updated
7. Reward record is stored in Rewards collection

### Level Calculation
- Level is automatically calculated based on XP
- Formula: `level = Math.floor(xp / 100) + 1`
- Each level requires 100 XP more than the previous

### Streak Calculation
- Streaks are calculated based on consecutive days with valid submissions
- Updated automatically when fetching user stats

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- AWS S3 bucket configured

### Steps

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Environment Configuration:**
Copy `.env.example` to `.env` and configure:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/gamified-task-tracker

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name
```

3. **Start the server:**
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

4. **Verify installation:**
```bash
curl http://localhost:3000/health
```

## Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── s3Controller.js
│   ├── taskController.js
│   ├── progressController.js
│   ├── rewardController.js
│   └── userController.js
├── middleware/           # Custom middleware
│   ├── errorHandler.js
│   └── validation.js
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Task.js
│   ├── TaskSubmission.js
│   └── Reward.js
├── routes/              # API routes
│   ├── s3Routes.js
│   ├── taskRoutes.js
│   ├── progressRoutes.js
│   ├── rewardRoutes.js
│   └── userRoutes.js
├── services/            # Business logic
│   └── taskService.js
└── utils/               # Utility functions
    ├── s3Utils.js
    └── dateUtils.js
```

## AWS S3 Setup

### Bucket Configuration
1. Create an S3 bucket in your AWS account
2. Enable public read access for uploaded images
3. Configure CORS policy:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### IAM Permissions
Ensure your AWS credentials have the following permissions:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:GetObjectAcl`
- `s3:PutObjectAcl`

## API Usage Examples

### 1. Get Pre-signed URL for Image Upload
```bash
curl -X POST http://localhost:3000/api/s3/presign \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "workout-proof.jpg",
    "fileType": "image/jpeg",
    "userId": "60a7c8b4f10b2c001f5e4e8d"
  }'
```

### 2. Submit Subtask with Image Proof
```bash
curl -X POST http://localhost:3000/api/tasks/60a7c8b4f10b2c001f5e4e8e/subtasks/morning-run/submit \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://your-bucket.s3.amazonaws.com/uploads/user123/image.jpg",
    "submitted_at": "2024-01-15T06:30:00Z",
    "user_id": "60a7c8b4f10b2c001f5e4e8d"
  }'
```

### 3. Get Progress for Date
```bash
curl "http://localhost:3000/api/progress/2024-01-15?user_id=60a7c8b4f10b2c001f5e4e8d"
```

### 4. Get Rewards for Date
```bash
curl "http://localhost:3000/api/rewards/2024-01-15?user_id=60a7c8b4f10b2c001f5e4e8d"
```

## Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message",
  "details": ["Array of validation errors"]
}
```

## Security Features

- **Helmet.js**: Sets security-related HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation with express-validator
- **MongoDB Injection Protection**: Mongoose built-in protections
- **Pre-signed URLs**: Secure file uploads without exposing AWS credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License
