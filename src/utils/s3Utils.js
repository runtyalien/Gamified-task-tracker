const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

/**
 * Generate a pre-signed URL for S3 upload
 * @param {string} fileName - Name of the file
 * @param {string} fileType - MIME type of the file
 * @param {string} userId - User ID for organizing uploads
 * @returns {Promise<Object>} - Pre-signed URL and key
 */
const generatePresignedUrl = async (fileName, fileType, userId) => {
  try {
    // Generate unique file key with timestamp and user ID
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(2)}`;
    const key = `uploads/${userId}/${uniqueFileName}.${fileExtension}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Expires: 300, // URL expires in 5 minutes
      ACL: 'public-read' // Make uploaded images publicly readable
    };

    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
    
    // The public URL where the image will be accessible after upload
    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      presignedUrl,
      key,
      publicUrl
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

/**
 * Delete a file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>} - Success status
 */
const deleteFile = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Check if a file exists in S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>} - File existence status
 */
const fileExists = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

/**
 * Get file metadata from S3
 * @param {string} key - S3 object key
 * @returns {Promise<Object>} - File metadata
 */
const getFileMetadata = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    const metadata = await s3.headObject(params).promise();
    return {
      contentType: metadata.ContentType,
      contentLength: metadata.ContentLength,
      lastModified: metadata.LastModified,
      etag: metadata.ETag
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error('Failed to get file metadata');
  }
};

/**
 * Extract S3 key from public URL
 * @param {string} publicUrl - Public S3 URL
 * @returns {string} - S3 object key
 */
const extractKeyFromUrl = (publicUrl) => {
  try {
    const url = new URL(publicUrl);
    // Remove leading slash
    return url.pathname.substring(1);
  } catch (error) {
    throw new Error('Invalid S3 URL format');
  }
};

module.exports = {
  generatePresignedUrl,
  deleteFile,
  fileExists,
  getFileMetadata,
  extractKeyFromUrl
};
