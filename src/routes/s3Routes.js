const express = require('express');
const { 
  generatePresignedUrlController,
  checkFileExists,
  deleteFileController
} = require('../controllers/s3Controller');
const { uploadImageDirect } = require('../controllers/s3DirectUploadController');
const { validateS3Presign } = require('../middleware/validation');

const router = express.Router();

// POST /api/s3/upload - Direct upload through backend (primary method)
router.post('/upload', uploadImageDirect);

// POST /api/s3/presign - Generate pre-signed URL for S3 upload (fallback method)
router.post('/presign', validateS3Presign, generatePresignedUrlController);

// GET /api/s3/exists/:key - Check if file exists in S3
router.get('/exists/:key(*)', checkFileExists);

// DELETE /api/s3/delete/:key - Delete file from S3
router.delete('/delete/:key(*)', deleteFileController);

module.exports = router;
