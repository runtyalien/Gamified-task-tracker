const axios = require('axios');

async function testProgressAPI() {
  try {
    console.log('Testing Progress API...\n');
    
    const BASE_URL = 'http://localhost:3001';
    const USER_ID = 'test-user';
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Requesting progress for user: ${USER_ID}`);
    console.log(`Date: ${today}\n`);
    
    const response = await axios.get(`${BASE_URL}/api/progress/${USER_ID}?date=${today}`);
    
    console.log('Progress API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Check if any completed subtasks have images
    const progressData = response.data.data;
    let foundImages = 0;
    
    progressData.forEach(task => {
      task.completed_subtasks.forEach(subtask => {
        if (subtask.submission && subtask.submission.image_url) {
          foundImages++;
          console.log(`\nFound image in task ${task.task_name}, subtask ${subtask.subtask_key}:`);
          console.log(`Image URL: ${subtask.submission.image_url}`);
          console.log(`Submitted at: ${subtask.submission.submitted_at}`);
        }
      });
    });
    
    console.log(`\nTotal completed subtasks with images: ${foundImages}`);
    
  } catch (error) {
    console.error('Error testing progress API:', error.response?.data || error.message);
  }
}

testProgressAPI();
