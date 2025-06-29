/**
 * AWS S3 CORS Configuration Script
 * Run this script to configure CORS for your S3 bucket
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

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://your-production-domain.com' // Replace with your actual domain
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000
    }
  ]
};

async function configureCORS() {
  try {
    console.log('🔧 Configuring CORS for S3 bucket:', process.env.S3_BUCKET_NAME);
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    };
    
    await s3.putBucketCors(params).promise();
    console.log('✅ CORS configuration applied successfully!');
    
    // Verify the configuration
    const corsResult = await s3.getBucketCors({ Bucket: process.env.S3_BUCKET_NAME }).promise();
    console.log('🔍 Current CORS configuration:');
    console.log(JSON.stringify(corsResult.CORSRules, null, 2));
    
  } catch (error) {
    console.error('❌ Error configuring CORS:', error.message);
    
    if (error.code === 'AccessDenied') {
      console.log('\n💡 Make sure your AWS credentials have the following permissions:');
      console.log('   - s3:GetBucketCors');
      console.log('   - s3:PutBucketCors');
    }
  }
}

async function checkCurrentCORS() {
  try {
    console.log('🔍 Checking current CORS configuration...');
    const result = await s3.getBucketCors({ Bucket: process.env.S3_BUCKET_NAME }).promise();
    console.log('✅ Current CORS rules:');
    console.log(JSON.stringify(result.CORSRules, null, 2));
  } catch (error) {
    if (error.code === 'NoSuchCORSConfiguration') {
      console.log('❌ No CORS configuration found. Run this script to add one.');
    } else {
      console.error('❌ Error checking CORS:', error.message);
    }
  }
}

async function main() {
  const command = process.argv[2];
  
  if (!process.env.S3_BUCKET_NAME) {
    console.error('❌ S3_BUCKET_NAME environment variable is required');
    process.exit(1);
  }
  
  if (command === 'check') {
    await checkCurrentCORS();
  } else if (command === 'set') {
    await configureCORS();
  } else {
    console.log('📖 Usage:');
    console.log('  node configure-s3-cors.js check  - Check current CORS configuration');
    console.log('  node configure-s3-cors.js set    - Apply CORS configuration');
  }
}

main().catch(console.error);
