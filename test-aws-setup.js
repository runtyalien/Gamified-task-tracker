#!/usr/bin/env node

/**
 * Test AWS S3 permissions and configuration
 */

const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

async function testAWSSetup() {
  console.log('🧪 Testing AWS S3 Setup...\n');
  
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    console.error('❌ S3_BUCKET_NAME not found in environment variables');
    return false;
  }
  
  console.log(`📦 Testing bucket: ${bucketName}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION}`);
  console.log(`👤 Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...`);
  console.log();
  
  let testsPassed = 0;
  let totalTests = 0;
  
  // Test 1: List bucket (basic access)
  totalTests++;
  try {
    console.log('1. Testing bucket access...');
    await s3.listObjects({ Bucket: bucketName, MaxKeys: 1 }).promise();
    console.log('✅ Bucket access: PASSED\n');
    testsPassed++;
  } catch (error) {
    console.log(`❌ Bucket access: FAILED - ${error.message}\n`);
  }
  
  // Test 2: Put object permission
  totalTests++;
  try {
    console.log('2. Testing PutObject permission...');
    const testKey = 'test-permissions.txt';
    await s3.putObject({
      Bucket: bucketName,
      Key: testKey,
      Body: 'Test upload for permissions',
      ContentType: 'text/plain',
      ACL: 'public-read'
    }).promise();
    
    console.log('✅ PutObject permission: PASSED');
    console.log(`   Successfully uploaded: ${testKey}\n`);
    testsPassed++;
    
    // Clean up test file
    try {
      await s3.deleteObject({ Bucket: bucketName, Key: testKey }).promise();
      console.log('🧹 Test file cleaned up\n');
    } catch (cleanupError) {
      console.log('⚠️  Could not clean up test file (this is okay)\n');
    }
    
  } catch (error) {
    console.log(`❌ PutObject permission: FAILED - ${error.message}\n`);
    
    if (error.code === 'AccessDenied') {
      console.log('💡 Fix: Add s3:PutObject permission to your IAM user policy');
    }
  }
  
  // Test 3: CORS configuration
  totalTests++;
  try {
    console.log('3. Testing CORS configuration...');
    const corsResult = await s3.getBucketCors({ Bucket: bucketName }).promise();
    console.log('✅ CORS configuration: EXISTS');
    console.log(`   Found ${corsResult.CORSRules.length} CORS rule(s)\n`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ CORS configuration: ${error.code === 'NoSuchCORSConfiguration' ? 'NOT CONFIGURED' : 'ERROR'}\n`);
    
    if (error.code === 'NoSuchCORSConfiguration') {
      console.log('💡 Fix: Add CORS configuration to your S3 bucket (see aws-s3-cors.json)\n');
    }
  }
  
  console.log('📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${testsPassed}/${totalTests} tests`);
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 AWS S3 is properly configured!');
    console.log('✅ Your bucket is ready for uploads');
    return true;
  } else {
    console.log('\n❌ AWS S3 configuration issues found');
    console.log('\n📋 To fix the issues:');
    console.log('1. Apply the IAM policy from aws-s3-policy.json to your user');
    console.log('2. Add CORS configuration from aws-s3-cors.json to your bucket');
    console.log('3. Ensure bucket allows public read access for uploaded files');
    return false;
  }
}

testAWSSetup().catch(console.error);
