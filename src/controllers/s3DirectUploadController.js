const multer = require('multer');
const { generatePresignedUrl } = require('../utils/s3Utils');
const AWS = require('aws-sdk');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * Upload image directly through backend to S3
 * POST /api/s3/upload
 */
const uploadImageDirect = async (req, res, next) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      try {
        // Generate unique file key
        const timestamp = Date.now();
        const fileExtension = req.file.originalname.split('.').pop();
        const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(2)}`;
        const key = `uploads/${userId}/${uniqueFileName}.${fileExtension}`;

        // Upload directly to S3 using the backend
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          // Remove ACL since bucket doesn't allow ACLs
          // ACL: 'public-read'
        };

        console.log('Uploading to S3 with params:', {
          bucket: uploadParams.Bucket,
          key: uploadParams.Key,
          contentType: uploadParams.ContentType,
          size: req.file.buffer.length
        });

        const result = await s3.upload(uploadParams).promise();
        
        console.log('S3 upload successful:', {
          location: result.Location,
          bucket: result.Bucket,
          key: result.Key
        });

        // Generate a presigned URL for viewing the uploaded image
        let presignedUrl;
        try {
          const presignedParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Expires: 3600 // URL expires in 1 hour
          };
          presignedUrl = await s3.getSignedUrlPromise('getObject', presignedParams);
          console.log('Generated presigned URL for viewing:', presignedUrl);
        } catch (presignedError) {
          console.warn('Failed to generate presigned URL:', presignedError.message);
          presignedUrl = null;
        }
        
        res.status(200).json({
          success: true,
          data: {
            key: key,
            publicUrl: result.Location,
            presignedUrl: presignedUrl,
            bucket: result.Bucket,
            etag: result.ETag,
            size: req.file.size,
            contentType: req.file.mimetype
          },
          message: 'Image uploaded successfully to S3'
        });

      } catch (uploadError) {
        console.error('S3 upload error details:', {
          message: uploadError.message,
          code: uploadError.code,
          statusCode: uploadError.statusCode,
          region: process.env.AWS_REGION,
          bucket: process.env.S3_BUCKET_NAME
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to upload image to S3';
        if (uploadError.code === 'AccessDenied') {
          errorMessage = 'AWS permissions error: Please check IAM policy for s3:PutObject permission';
        } else if (uploadError.code === 'NoSuchBucket') {
          errorMessage = 'S3 bucket not found: Please check bucket name in environment variables';
        } else if (uploadError.code === 'InvalidAccessKeyId') {
          errorMessage = 'Invalid AWS credentials: Please check access key ID';
        } else if (uploadError.code === 'SignatureDoesNotMatch') {
          errorMessage = 'Invalid AWS credentials: Please check secret access key';
        }
        
        res.status(500).json({
          success: false,
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImageDirect
};
