#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function testCompleteImageFlow() {
  console.log('🧪 Testing Complete Image Upload and Persistence Flow...\n');
  
  try {
    // 1. Upload an image
    console.log('1. 📤 Uploading test image...');
    
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC9, 0x88, 0x4B, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-wellness-task.png',
      contentType: 'image/png'
    });
    formData.append('userId', USER_ID);
    
    const uploadResponse = await axios.post(`${BACKEND_URL}/api/s3/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('✅ Image uploaded successfully!');
    console.log(`   Public URL: ${uploadResponse.data.data.publicUrl}`);
    console.log(`   S3 Key: ${uploadResponse.data.data.key}`);
    
    // 2. Submit the subtask with the uploaded image
    console.log('\n2. 📝 Submitting subtask...');
    
    // Use Wellness Princess Path task
    const taskId = '686053e5069ed8946b40b132';
    const subtaskKey = 'breakfast';
    
    const submissionData = {
      image_url: uploadResponse.data.data.publicUrl,
      presigned_url: uploadResponse.data.data.presignedUrl,
      s3_key: uploadResponse.data.data.key,
      submitted_at: new Date().toISOString(),
      user_id: USER_ID
    };
    
    console.log('Submitting to:', `${BACKEND_URL}/api/tasks/${taskId}/subtasks/${subtaskKey}/submit`);
    console.log('Submission data:', JSON.stringify(submissionData, null, 2));
    
    const submitResponse = await axios.post(
      `${BACKEND_URL}/api/tasks/${taskId}/subtasks/${subtaskKey}/submit`,
      submissionData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Subtask submitted successfully!');
    console.log(`   Submission ID: ${submitResponse.data.data.submission.id}`);
    console.log(`   Task Completed: ${submitResponse.data.data.task_completed}`);
    
    // 3. Wait a moment then check progress
    console.log('\n3. ⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Fetch today's progress
    console.log('\n4. 🔍 Fetching updated progress...');
    const today = new Date().toISOString().split('T')[0];
    const progressResponse = await axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
    
    const wellnessTask = progressResponse.data.data.tasks.find(t => t.task_id === taskId);
    
    if (!wellnessTask) {
      console.log('❌ Wellness task not found in progress');
      return;
    }
    
    console.log('✅ Found Wellness Princess Path in progress:');
    console.log(`   Completed: ${wellnessTask.is_completed}`);
    console.log(`   Progress: ${wellnessTask.progress.completed}/${wellnessTask.progress.total}`);
    
    const breakfastSubtask = wellnessTask.subtasks.find(st => st.key === subtaskKey);
    
    if (!breakfastSubtask) {
      console.log('❌ Breakfast subtask not found');
      return;
    }
    
    console.log('\n📋 Breakfast subtask details:');
    console.log(`   Completed: ${breakfastSubtask.completed}`);
    console.log(`   Has submission: ${!!breakfastSubtask.submission}`);
    
    if (breakfastSubtask.submission) {
      console.log(`   Image URL: ${breakfastSubtask.submission.image_url}`);
      console.log(`   Presigned URL: ${breakfastSubtask.submission.presigned_url ? 'Present' : 'Missing'}`);
      console.log(`   Submitted At: ${breakfastSubtask.submission.submitted_at}`);
      
      console.log('\n🎉 SUCCESS: Image persisted correctly!');
      console.log('✅ When you navigate to Wellness Princess Path, you should see the breakfast image');
    } else {
      console.log('\n❌ FAILURE: No submission data in progress');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.includes('already submitted')) {
      console.log('\n💡 This subtask was already submitted today. That\'s why it failed.');
      console.log('   The image should still be visible in the task.');
    }
  }
}

testCompleteImageFlow().catch(console.error);
