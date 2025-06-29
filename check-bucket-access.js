#!/usr/bin/env node

/**
 * Check S3 bucket ownership and permissions
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

async function checkBucketAccess() {
  console.log('🔍 Checking S3 Bucket Access...\n');
  
  const bucketName = process.env.S3_BUCKET_NAME;
  console.log(`📦 Bucket: ${bucketName}`);
  console.log(`👤 User: lazyjoshi`);
  console.log(`🌍 Region: ${process.env.AWS_REGION}`);
  console.log();

  // Test 1: Can we list the bucket?
  try {
    console.log('1. Testing bucket access (list objects)...');
    const listResult = await s3.listObjects({ Bucket: bucketName, MaxKeys: 5 }).promise();
    console.log(`✅ Can read bucket - Found ${listResult.Contents?.length || 0} objects`);
  } catch (error) {
    console.log(`❌ Cannot read bucket: ${error.code} - ${error.message}`);
    if (error.code === 'AccessDenied') {
      console.log('   → Need s3:ListBucket permission');
    }
  }

  // Test 2: Can we upload?
  try {
    console.log('\n2. Testing upload permission...');
    const testKey = 'test-permission-check.txt';
    await s3.putObject({
      Bucket: bucketName,
      Key: testKey,
      Body: 'Permission test',
      ContentType: 'text/plain'
    }).promise();
    
    console.log('✅ Can upload to bucket');
    
    // Clean up test file
    try {
      await s3.deleteObject({ Bucket: bucketName, Key: testKey }).promise();
      console.log('✅ Can delete from bucket (cleanup successful)');
    } catch (deleteError) {
      console.log('⚠️  Cannot delete test file (this is okay)');
    }
    
  } catch (error) {
    console.log(`❌ Cannot upload: ${error.code} - ${error.message}`);
    if (error.code === 'AccessDenied') {
      console.log('   → Need s3:PutObject permission');
    }
  }

  // Test 3: Check bucket location
  try {
    console.log('\n3. Getting bucket info...');
    const location = await s3.getBucketLocation({ Bucket: bucketName }).promise();
    console.log(`✅ Bucket region: ${location.LocationConstraint || 'us-east-1'}`);
  } catch (error) {
    console.log(`❌ Cannot get bucket info: ${error.code}`);
  }

  console.log('\n📋 What you need to do:');
  console.log('=====================================');
  console.log('Since lazyjoshi did not create this bucket, you need to:');
  console.log('');
  console.log('Option 1 - Add permissions to lazyjoshi user:');
  console.log('  1. Go to AWS IAM Console');
  console.log('  2. Find the lazyjoshi user');
  console.log('  3. Add the policy from aws-s3-policy.json');
  console.log('');
  console.log('Option 2 - Have the bucket owner add lazyjoshi:');
  console.log('  1. Go to S3 Console → lazyjoshi bucket → Permissions');
  console.log('  2. Edit Bucket Policy and add permissions for lazyjoshi user');
  console.log('');
  console.log('Option 3 - Create a new bucket with lazyjoshi:');
  console.log('  1. Create a new S3 bucket using lazyjoshi credentials');
  console.log('  2. Update S3_BUCKET_NAME in .env to the new bucket');
}

checkBucketAccess().catch(console.error);
