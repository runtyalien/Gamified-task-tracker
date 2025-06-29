const { generatePresignedUrl, fileExists, deleteFile } = require('../utils/s3Utils');

/**
 * Generate pre-signed URL for S3 upload
 * POST /api/s3/presign
 */
const generatePresignedUrlController = async (req, res, next) => {
  try {
    const { fileName, fileType, userId } = req.body;
    
    const result = await generatePresignedUrl(fileName, fileType, userId);
    
    res.status(200).json({
      success: true,
      data: {
        presignedUrl: result.presignedUrl,
        key: result.key,
        publicUrl: result.publicUrl
      },
      message: 'Pre-signed URL generated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if file exists in S3
 * GET /api/s3/exists?key=filename
 */
const checkFileExists = async (req, res, next) => {
  try {
    const { key } = req.query;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key is required'
      });
    }
    
    const exists = await fileExists(key);
    
    res.status(200).json({
      success: true,
      data: {
        exists,
        key
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete file from S3
 * DELETE /api/s3/delete?key=filename
 */
const deleteFileController = async (req, res, next) => {
  try {
    const { key } = req.query;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key is required'
      });
    }
    
    const deleted = await deleteFile(key);
    
    res.status(200).json({
      success: true,
      data: {
        deleted,
        key
      },
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePresignedUrlController,
  checkFileExists,
  deleteFileController
};
