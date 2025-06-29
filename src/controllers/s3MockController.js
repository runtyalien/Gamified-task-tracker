const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local storage (development mode)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;
    cb(null, uniqueFileName);
  }
});

const upload = multer({
  storage: storage,
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
 * Mock upload for development (saves locally, returns mock S3 URL)
 * POST /api/s3/upload-mock
 */
const uploadImageMock = async (req, res, next) => {
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
        // Generate mock S3-like URLs for development
        const filename = req.file.filename;
        const mockS3Key = `uploads/${userId}/${filename}`;
        const mockS3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${mockS3Key}`;
        
        // Also provide local URL for actual access during development
        const localUrl = `http://localhost:${process.env.PORT || 3001}/uploads/${filename}`;
        
        res.status(200).json({
          success: true,
          data: {
            key: mockS3Key,
            publicUrl: mockS3Url, // Mock S3 URL for consistency
            localUrl: localUrl,   // Actual accessible URL
            filename: filename,
            size: req.file.size,
            mimetype: req.file.mimetype
          },
          message: 'Image uploaded successfully (development mode)'
        });

      } catch (error) {
        console.error('Mock upload error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to process image upload'
        });
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImageMock
};
