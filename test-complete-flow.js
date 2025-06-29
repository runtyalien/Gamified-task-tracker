const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a simple test image file
const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const testImagePath = path.join(__dirname, 'test-image.png');
fs.writeFileSync(testImagePath, testImageContent);

const BASE_URL = 'http://localhost:3001';
const USER_ID = 'test-user';

async function testCompleteFlow() {
  try {
    console.log('=== Testing Complete Image Upload and Submission Flow ===\n');

    // Step 1: Upload image to S3
    console.log('1. Uploading test image to S3...');
    const uploadFormData = new FormData();
    uploadFormData.append('image', fs.createReadStream(testImagePath));
    uploadFormData.append('userId', USER_ID);

    const uploadResponse = await axios.post(`${BASE_URL}/api/s3/upload`, uploadFormData, {
      headers: {
        ...uploadFormData.getHeaders(),
      },
    });

    console.log('Upload successful!');
    console.log('Public URL:', uploadResponse.data.data.publicUrl);
    console.log('S3 Key:', uploadResponse.data.data.key);

    // Step 2: Submit subtask with the uploaded image
    console.log('\n2. Submitting subtask with uploaded image...');
    const taskId = '676467c3b5e7b8c8b5a49c51'; // Morning routine task
    const subtaskKey = 'skin-care';

    const submissionData = {
      image_url: uploadResponse.data.data.publicUrl,
      presigned_url: uploadResponse.data.data.presignedUrl,
      s3_key: uploadResponse.data.data.key,
      submitted_at: new Date().toISOString(),
      user_id: USER_ID
    };

    const submitResponse = await axios.post(
      `${BASE_URL}/api/tasks/${taskId}/subtasks/${subtaskKey}/submit`,
      submissionData
    );

    console.log('Subtask submission successful!');
    console.log('Submission ID:', submitResponse.data.data.submission.id);
    console.log('Task completed:', submitResponse.data.data.task_completed);

    // Step 3: Check progress for today
    console.log('\n3. Checking progress for today...');
    const today = new Date().toISOString().split('T')[0];
    const progressResponse = await axios.get(`${BASE_URL}/api/progress/${USER_ID}?date=${today}`);

    console.log('Progress data:', JSON.stringify(progressResponse.data.data, null, 2));

    // Step 4: Check if the submitted subtask appears in progress
    const taskProgress = progressResponse.data.data.find(p => p.task_id === taskId);
    if (taskProgress) {
      const completedSubtask = taskProgress.completed_subtasks.find(s => s.subtask_key === subtaskKey);
      if (completedSubtask && completedSubtask.submission && completedSubtask.submission.image_url) {
        console.log('\n✅ SUCCESS: Submitted image is visible in progress!');
        console.log('Image URL in progress:', completedSubtask.submission.image_url);
      } else {
        console.log('\n❌ ISSUE: Submitted subtask not found in progress or missing image');
      }
    } else {
      console.log('\n❌ ISSUE: Task not found in progress');
    }

  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testCompleteFlow();
}

module.exports = { testCompleteFlow };
