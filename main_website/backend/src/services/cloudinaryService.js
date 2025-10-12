import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, audio, and documents are allowed.'));
    }
  }
});

// Helper function to upload file buffer to Cloudinary
export const uploadBufferToCloudinary = async (buffer, folder = 'aayulink', resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) throw error;
        return result;
      }
    ).end(buffer);
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary buffer upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to upload base64 image
export const uploadBase64ToCloudinary = async (base64Data, folder = 'aayulink') => {
  try {
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Data}`, {
      folder: folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary base64 upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result: result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export { upload, cloudinary };
