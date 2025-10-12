import express from 'express';
import { upload, uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Upload profile image
router.post('/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      'aayulink/profiles',
      'image'
    );

    if (uploadResult.success) {
      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          url: uploadResult.url,
          public_id: uploadResult.public_id,
          size: uploadResult.size
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile image',
        error: uploadResult.error
      });
    }
  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Upload medical report
router.post('/report', authenticateToken, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Determine resource type based on file type
    const resourceType = req.file.mimetype.startsWith('image/') ? 'image' : 'raw';

    // Upload to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      'aayulink/reports',
      resourceType
    );

    if (uploadResult.success) {
      res.json({
        success: true,
        message: 'Report uploaded successfully',
        data: {
          url: uploadResult.url,
          public_id: uploadResult.public_id,
          size: uploadResult.size,
          filename: req.file.originalname
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to upload report',
        error: uploadResult.error
      });
    }
  } catch (error) {
    console.error('Report upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Upload audio recording
router.post('/audio', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      'aayulink/recordings',
      'video' // Cloudinary treats audio as video
    );

    if (uploadResult.success) {
      res.json({
        success: true,
        message: 'Audio recording uploaded successfully',
        data: {
          url: uploadResult.url,
          public_id: uploadResult.public_id,
          size: uploadResult.size,
          filename: req.file.originalname
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to upload audio recording',
        error: uploadResult.error
      });
    }
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
