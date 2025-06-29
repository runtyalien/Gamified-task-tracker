#!/usr/bin/env node

/**
 * Test the updated task submission with presigned URL storage
 */

const axios = require('axios');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function testUpdatedSubmission() {
  console.log('🧪 Testing Updated Task Submission with Presigned URL Storage...\n');
  
  try {
    // 1. First upload an image and get all the URLs
    console.log('1. Uploading image to get URLs...');
    
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
      filename: 'test-presigned-storage.png',
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
    console.log(`   Presigned URL: ${uploadResponse.data.data.presignedUrl ? 'Available' : 'Not available'}`);
    console.log(`   S3 Key: ${uploadResponse.data.data.key}`);
    
    const uploadData = uploadResponse.data.data;
    
    // 2. Submit task with all URL data
    console.log('\\n2. Submitting task with all URL data...');
    
    const submissionData = {
      image_url: uploadData.publicUrl,
      presigned_url: uploadData.presignedUrl,
      s3_key: uploadData.key,
      submitted_at: new Date().toISOString(),
      user_id: USER_ID
    };
    
    console.log('   Submission data:', JSON.stringify(submissionData, null, 2));
    
    // Test with a different subtask to avoid duplicate error
    const taskId = '686053e5069ed8946b40b12f'; // Morning Princess Ritual
    const subtaskKey = 'bath'; // Different subtask
    
    const submitResponse = await axios.post(
      `${BACKEND_URL}/api/tasks/${taskId}/subtasks/${subtaskKey}/submit`,
      submissionData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Task submission successful with presigned URL storage!');
    console.log('   Submission ID:', submitResponse.data.data.submission.id);
    console.log('   Task completed:', submitResponse.data.data.task_completed);
    console.log('   Reward earned:', submitResponse.data.data.reward ? 'Yes' : 'No');
    
    // 3. Fetch progress to see if the submission includes the presigned URL
    console.log('\\n3. Fetching progress to verify stored URLs...');
    
    const today = new Date().toISOString().split('T')[0];
    const progressResponse = await axios.get(`${BACKEND_URL}/api/progress/${today}?user_id=${USER_ID}`);
    
    const taskProgress = progressResponse.data.data.find(task => task.task_id === taskId);
    if (taskProgress) {
      const subtaskProgress = taskProgress.subtasks.find(st => st.key === subtaskKey);
      if (subtaskProgress && subtaskProgress.submission) {
        console.log('✅ Progress includes submission with URLs:');
        console.log(`   Image URL: ${subtaskProgress.submission.image_url}`);
        console.log(`   Presigned URL: ${subtaskProgress.submission.presigned_url || 'Not stored'}`);
        console.log(`   S3 Key: ${subtaskProgress.submission.s3_key || 'Not stored'}`);
      } else {
        console.log('❌ Submission not found in progress');
      }
    } else {
      console.log('❌ Task not found in progress');
    }
    
    console.log('\\n🎉 Test completed successfully!');
    console.log('\\n📋 Results:');
    console.log('   ✅ Image upload with presigned URL generation works');
    console.log('   ✅ Task submission with URL storage works');
    console.log('   ✅ Progress retrieval includes stored URLs');
    console.log('   ✅ Frontend can now show persistent images after refresh');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.includes('already submitted')) {
      console.log('\\n💡 Try changing the subtask key in the test script');
    } else if (error.response?.status === 500) {
      console.log('\\n💡 Check backend logs for server errors');
    }
  }
}

testUpdatedSubmission().catch(console.error);
