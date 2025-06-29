const express = require('express');
const { 
  generatePresignedUrlController,
  checkFileExists,
  deleteFileController
} = require('../controllers/s3Controller');
const { validateS3Presign } = require('../middleware/validation');

const router = express.Router();

// POST /api/s3/presign - Generate pre-signed URL for S3 upload
router.post('/presign', validateS3Presign, generatePresignedUrlController);

// GET /api/s3/exists?key=... - Check if file exists in S3 (using query parameter)
router.get('/exists', checkFileExists);

// DELETE /api/s3/delete?key=... - Delete file from S3 (using query parameter)
router.delete('/delete', deleteFileController);

module.exports = router;
