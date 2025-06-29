// Test script to simulate complete upload -> submit -> refresh -> view flow
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a simple test image file
const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const testImagePath = path.join(__dirname, 'test-upload-image.png');
fs.writeFileSync(testImagePath, testImageContent);

const BASE_URL = 'http://localhost:3001';
const USER_ID = 'test-user';

async function testCompleteUploadFlow() {
  console.log('🧪 Testing Complete Upload -> Submit -> Refresh -> View Flow\n');

  try {
    // Step 1: Upload image
    console.log('1. 📤 Uploading test image...');
    const uploadFormData = new FormData();
    uploadFormData.append('image', fs.createReadStream(testImagePath));
    uploadFormData.append('userId', USER_ID);

    const uploadResponse = await axios.post(`${BASE_URL}/api/s3/upload`, uploadFormData, {
      headers: uploadFormData.getHeaders(),
    });

    console.log('✅ Upload successful!');
    const uploadData = uploadResponse.data.data;
    console.log(`   Public URL: ${uploadData.publicUrl}`);
    console.log(`   S3 Key: ${uploadData.key}\n`);

    // Step 2: Submit subtask
    console.log('2. 📝 Submitting subtask...');
    const taskId = '676467c3b5e7b8c8b5a49c51'; // Morning routine task
    const subtaskKey = 'skin-care';
    const now = new Date();

    const submissionData = {
      image_url: uploadData.publicUrl,
      presigned_url: uploadData.presignedUrl,
      s3_key: uploadData.key,
      submitted_at: now.toISOString(),
      user_id: USER_ID
    };

    const submitResponse = await axios.post(
      `${BASE_URL}/api/tasks/${taskId}/subtasks/${subtaskKey}/submit`,
      submissionData
    );

    console.log('✅ Subtask submission successful!');
    const submissionResult = submitResponse.data.data;
    console.log(`   Submission ID: ${submissionResult.submission.id}`);
    console.log(`   Date stored: ${submissionResult.submission.date}`);
    console.log(`   Image URL stored: ${submissionResult.submission.image_url}\n`);

    // Step 3: Wait a moment (simulate time between submit and refresh)
    console.log('3. ⏳ Waiting 2 seconds (simulating page refresh delay)...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Fetch progress (simulating page refresh)
    console.log('4. 🔄 Fetching progress (simulating page refresh)...');
    const today = now.toISOString().split('T')[0];
    console.log(`   Requesting progress for date: ${today}`);
    
    const progressResponse = await axios.get(`${BASE_URL}/api/progress/${today}?user_id=${USER_ID}`);

    console.log('✅ Progress fetched successfully!');
    const progressData = progressResponse.data.data;
    console.log(`   Found ${progressData.tasks.length} tasks in progress\n`);

    // Step 5: Verify the submission appears in progress
    console.log('5. 🔍 Verifying submitted image appears in progress...');
    
    const taskProgress = progressData.tasks.find(t => t.task_id === taskId);
    if (!taskProgress) {
      console.log('❌ Task not found in progress!');
      return;
    }

    console.log(`   Task found: ${taskProgress.task_name}`);
    console.log(`   Completed subtasks: ${taskProgress.progress.completed}/${taskProgress.progress.total}`);

    const submittedSubtask = taskProgress.subtasks.find(st => st.key === subtaskKey);
    if (!submittedSubtask) {
      console.log('❌ Subtask not found in task!');
      return;
    }

    console.log(`   Subtask found: ${submittedSubtask.name}`);
    console.log(`   Subtask completed: ${submittedSubtask.completed}`);
    console.log(`   Has submission: ${!!submittedSubtask.submission}`);

    if (submittedSubtask.completed && submittedSubtask.submission) {
      console.log('✅ SUCCESS: Submitted image is visible in progress!');
      console.log(`   Submission image URL: ${submittedSubtask.submission.image_url}`);
      console.log(`   Submission presigned URL: ${submittedSubtask.submission.presigned_url || 'None'}`);
      console.log(`   Submission date: ${submittedSubtask.submission.submitted_at}`);
      
      // Verify the image URL matches
      if (submittedSubtask.submission.image_url === uploadData.publicUrl) {
        console.log('✅ Image URL matches uploaded URL!');
      } else {
        console.log('⚠️  Image URL mismatch:');
        console.log(`    Uploaded: ${uploadData.publicUrl}`);
        console.log(`    Retrieved: ${submittedSubtask.submission.image_url}`);
      }
    } else {
      console.log('❌ FAILURE: Submitted image is NOT visible in progress!');
      if (!submittedSubtask.completed) {
        console.log('   Reason: Subtask not marked as completed');
      }
      if (!submittedSubtask.submission) {
        console.log('   Reason: No submission data found');
      }
    }

    // Step 6: Show complete progress data for debugging
    console.log('\n6. 📊 Complete progress data:');
    console.log(JSON.stringify(progressData, null, 2));

  } catch (error) {
    console.error('❌ Error during test:', error.response?.data || error.message);
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    // Clean up
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

testCompleteUploadFlow();
