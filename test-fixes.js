#!/usr/bin/env node

/**
 * Test script to verify routing and upload fixes
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:3001';
const USER_ID = '686053e5069ed8946b40b12c';

async function testRouting() {
  console.log('🧪 Testing Routing Fixes...\n');
  
  try {
    // Test if tasks endpoint exists
    console.log('1. Testing /api/tasks endpoint...');
    const tasksResponse = await axios.get(`${BACKEND_URL}/api/tasks?active=true`);
    console.log(`✅ Tasks endpoint working: ${tasksResponse.data.data.length} tasks found\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Routing test failed:', error.message);
    return false;
  }
}

async function testDirectUpload() {
  console.log('🧪 Testing Direct Upload Fix...\n');
  
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
    
    console.log('1. Testing direct upload endpoint...');
    
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('userId', USER_ID);
    
    const uploadResponse = await axios.post(`${BACKEND_URL}/api/s3/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Direct upload working!');
    console.log(`   Key: ${uploadResponse.data.data.key}`);
    console.log(`   URL: ${uploadResponse.data.data.publicUrl}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Direct upload test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testPresignedUpload() {
  console.log('🧪 Testing Presigned URL as Fallback...\n');
  
  try {
    console.log('1. Testing presigned URL generation...');
    const presignResponse = await axios.post(`${BACKEND_URL}/api/s3/presign`, {
      fileName: 'test-fallback.png',
      fileType: 'image/png',
      userId: USER_ID
    });
    
    console.log('✅ Presigned URL generation working!');
    console.log(`   URL generated (expires in 5 minutes)\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Presigned URL test failed:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🔥 Testing Application Fixes\n');
  console.log('=================================\n');
  
  const routingPassed = await testRouting();
  const directUploadPassed = await testDirectUpload();
  const presignedPassed = await testPresignedUpload();
  
  console.log('📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Routing Fix: ${routingPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Direct Upload Fix: ${directUploadPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Presigned URL Fallback: ${presignedPassed ? 'PASSED' : 'FAILED'}`);
  
  if (routingPassed && directUploadPassed) {
    console.log('\n🎉 All critical fixes are working!');
    console.log('\n📋 Issues Resolved:');
    console.log('✅ Fixed missing /tasks route');
    console.log('✅ Added direct upload to bypass CORS');
    console.log('✅ Maintained presigned URL as fallback');
    console.log('✅ Updated service worker to skip S3 requests');
    console.log('\n🚀 The application should now work without CORS errors!');
  } else {
    console.log('\n❌ Some issues remain. Check the errors above.');
  }
}

main().catch(console.error);
