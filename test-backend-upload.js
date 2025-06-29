#!/usr/bin/env node

/**
 * Simple test for backend S3 upload
 */

const axios = require('axios');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function testBackendUpload() {
  console.log('🧪 Testing Backend S3 Upload...\n');
  
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC9, 0x88, 0x4B, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    console.log('📤 Uploading test image through backend...');
    console.log(`   User ID: ${USER_ID}`);
    console.log(`   Image size: ${testImageBuffer.length} bytes`);
    console.log();
    
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-backend-upload.png',
      contentType: 'image/png'
    });
    formData.append('userId', USER_ID);
    
    const uploadResponse = await axios.post(`${BACKEND_URL}/api/s3/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Upload successful!');
    console.log(`   S3 Key: ${uploadResponse.data.data.key}`);
    console.log(`   Public URL: ${uploadResponse.data.data.publicUrl}`);
    console.log(`   File size: ${uploadResponse.data.data.size} bytes`);
    console.log(`   Content type: ${uploadResponse.data.data.contentType}`);
    console.log();
    
    // Try to access the uploaded file
    console.log('🔍 Testing if uploaded file is accessible...');
    try {
      const accessResponse = await axios.head(uploadResponse.data.data.publicUrl);
      console.log('✅ File is publicly accessible!');
      console.log(`   Status: ${accessResponse.status}`);
      console.log(`   Content-Type: ${accessResponse.headers['content-type']}`);
    } catch (accessError) {
      console.log('❌ File is not publicly accessible');
      console.log(`   This might be okay if bucket policy isn't set for public read`);
    }
    
    console.log('\n🎉 Backend S3 upload is working perfectly!');
    console.log('✅ Frontend can now upload images through the backend API');
    console.log('✅ No CORS issues since everything goes through your backend');
    
    return true;
    
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.includes('AccessDenied')) {
      console.log('\n💡 Fix: Add the IAM policy from aws-s3-policy.json to your AWS user');
      console.log('   1. Go to AWS IAM Console');
      console.log('   2. Find user "lazyjoshi"');
      console.log('   3. Add the policy for s3:PutObject permission');
    }
    
    return false;
  }
}

testBackendUpload().catch(console.error);
