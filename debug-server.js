const express = require('express');
const mongoose = require('mongoose');
const TaskSubmission = require('./src/models/TaskSubmission');
const { getStartOfDay } = require('./src/utils/dateUtils');

const app = express();

// Quick debug endpoint
app.get('/debug/submissions/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;
    const targetDate = getStartOfDay(new Date(date));
    
    console.log('Debug request for:', { userId, date, targetDate: targetDate.toISOString() });
    
    // Method 1: Direct query with exact date match
    const exactMatch = await TaskSubmission.find({
      user_id: userId,
      date: targetDate
    });
    
    // Method 2: Using the static method
    const staticMethod = await TaskSubmission.getSubmissionsByUserAndDate(userId, targetDate);
    
    // Method 3: All submissions for this user
    const allUserSubmissions = await TaskSubmission.find({ user_id: userId }).sort({ submitted_at: -1 });
    
    res.json({
      query: { userId, date, targetDate: targetDate.toISOString() },
      results: {
        exactMatch: exactMatch.length,
        staticMethod: staticMethod.length,
        allUserSubmissions: allUserSubmissions.length
      },
      exactMatchData: exactMatch.map(sub => ({
        id: sub._id,
        task_id: sub.task_id,
        subtask_key: sub.subtask_key,
        image_url: sub.image_url,
        submitted_at: sub.submitted_at,
        date: sub.date
      })),
      staticMethodData: staticMethod.map(sub => ({
        id: sub._id,
        task_id: sub.task_id,
        subtask_key: sub.subtask_key,
        image_url: sub.image_url,
        submitted_at: sub.submitted_at,
        date: sub.date
      })),
      allUserSubmissionsData: allUserSubmissions.slice(0, 5).map(sub => ({
        id: sub._id,
        task_id: sub.task_id,
        subtask_key: sub.subtask_key,
        image_url: sub.image_url,
        submitted_at: sub.submitted_at,
        date: sub.date
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to MongoDB and start server
mongoose.connect('mongodb://localhost:27017/princess_tracker')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3002, () => {
      console.log('Debug server running on http://localhost:3002');
      console.log('Test with: http://localhost:3002/debug/submissions/test-user/2025-06-29');
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
