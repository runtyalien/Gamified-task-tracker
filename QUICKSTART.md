# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. **Configure Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings:
# - MONGODB_URI (your MongoDB connection string)
# - AWS credentials (for S3 image uploads)
```

### 2. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Cloud (Atlas) - just update MONGODB_URI in .env
```

### 3. **Seed Sample Data**
```bash
npm run seed
```

### 4. **Start Development Server**
```bash
npm run dev
```

### 5. **Test the API**
```bash
npm run test:api
```

## 🔗 API Endpoints

### Core Functionality
- **Health Check**: `GET /health`
- **Submit Task**: `POST /api/tasks/:taskId/subtasks/:subtaskKey/submit`
- **Get Progress**: `GET /api/progress/:date?user_id=USER_ID`
- **Get Rewards**: `GET /api/rewards/:date?user_id=USER_ID`

### S3 Integration
- **Get Upload URL**: `POST /api/s3/presign`

### Management
- **Tasks**: `GET|POST|PUT|DELETE /api/tasks`
- **Users**: `GET|POST|PUT|DELETE /api/users`
- **Leaderboard**: `GET /api/users/leaderboard`

## 📱 Example API Calls

### 1. Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

### 2. Get Upload URL for Image
```bash
curl -X POST http://localhost:3000/api/s3/presign \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "workout.jpg",
    "fileType": "image/jpeg", 
    "userId": "USER_ID_HERE"
  }'
```

### 3. Submit Subtask with Image
```bash
curl -X POST http://localhost:3000/api/tasks/TASK_ID/subtasks/SUBTASK_KEY/submit \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://your-bucket.s3.amazonaws.com/image.jpg",
    "submitted_at": "2024-01-15T06:30:00Z",
    "user_id": "USER_ID_HERE"
  }'
```

### 4. Check Progress
```bash
curl "http://localhost:3000/api/progress/2024-01-15?user_id=USER_ID_HERE"
```

## 🎯 Sample Workflow

1. **User signs up** → `POST /api/users`
2. **Get available tasks** → `GET /api/tasks`
3. **User wants to submit proof** → `POST /api/s3/presign`
4. **Upload image to S3** → Use presigned URL
5. **Submit subtask** → `POST /api/tasks/:taskId/subtasks/:key/submit`
6. **System auto-checks completion** → Issues rewards if all subtasks done
7. **Check progress** → `GET /api/progress/:date`
8. **View rewards** → `GET /api/rewards/:date`

## 🏆 Gamification Features

- **XP System**: Complete tasks to earn experience points
- **Levels**: Automatic level calculation (100 XP per level)
- **Rewards**: Earn rupees (₹) for completed tasks
- **Streaks**: Track consecutive days of activity
- **Leaderboards**: Compare with other users

## 📊 Sample Data Included

The seed script creates:
- 5 sample tasks (workout, learning, eating, productivity, self-care)
- 5 sample users with different progress levels
- Ready to test all API endpoints

## 🔧 NPM Scripts

```bash
npm run dev         # Start development server with auto-reload
npm run start       # Start production server
npm run seed        # Add sample data
npm run seed:clear  # Clear all data
npm run seed:reset  # Clear and re-seed data
npm run test:api    # Test all endpoints
npm run validate    # Validate project setup
```

## 📝 Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/gamified-task-tracker
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket

# Optional
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### AWS S3 Issues
- Verify AWS credentials in `.env`
- Check bucket permissions (public read for uploaded images)
- Ensure CORS is configured on your S3 bucket

### Port Already in Use
```bash
# Change PORT in .env file or:
PORT=3001 npm run dev
```

## 🎉 You're Ready!

Visit `http://localhost:3000/health` to confirm everything is working!
