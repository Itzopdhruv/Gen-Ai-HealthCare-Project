import express from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Generate 2FA secret and QR code
router.post('/generate', async (req, res) => {
  try {
    // Get user from request headers or use a default for testing
    const authHeader = req.headers.authorization;
    let userId;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production");
        userId = decoded.userId;
      } catch (error) {
        console.log('Token verification failed, using default user');
        userId = null;
      }
    }
    
    // If no valid user, find the actual logged-in admin user
    if (!userId) {
      // Try to find the actual admin user (pre@gmail.com)
      let defaultUser = await User.findOne({ email: 'pre@gmail.com' });
      
      if (!defaultUser) {
        // Try to find any existing admin user
        defaultUser = await User.findOne({ role: 'admin' });
        
        if (!defaultUser) {
          return res.status(400).json({
            success: false,
            message: 'No admin user found. Please log in first.'
          });
        }
      }
      
      userId = defaultUser._id;
      console.log('Using actual admin user for 2FA setup:', defaultUser.email, userId);
    }
    
    // Get user details for QR code
    const user = await User.findById(userId);
    
    // Generate secret key
    const secret = speakeasy.generateSecret({
      name: user.email,
      issuer: 'Healthcare Platform',
      length: 32
    });
    
    // Ensure the URL is properly formatted
    const qrCodeData = secret.otpauth_url;
    
    console.log('Generated QR Code Data:', qrCodeData);
    console.log('Secret Key:', secret.base32);
    console.log('User ID:', userId);
    
    // Store secret temporarily in user document (not enabled yet)
    await User.findByIdAndUpdate(userId, {
      'twoFactorAuth.secret': secret.base32,
      'twoFactorAuth.enabled': false
    });
    
    res.json({
      success: true,
      secretKey: secret.base32,
      qrCodeData: qrCodeData,
      otpauth_url: secret.otpauth_url
    });
  } catch (error) {
    console.error('Error generating 2FA secret:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate 2FA secret',
      error: error.message
    });
  }
});

// Verify 2FA code
router.post('/verify', async (req, res) => {
  try {
    const { secretKey, verificationCode } = req.body;
    
    // Get user from request headers or use a default for testing
    const authHeader = req.headers.authorization;
    let userId;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production");
        userId = decoded.userId;
      } catch (error) {
        console.log('Token verification failed, using default user');
        userId = null;
      }
    }
    
    // If no valid user, find default admin user
    if (!userId) {
      // Try to find the actual admin user (pre@gmail.com)
      let defaultUser = await User.findOne({ email: 'pre@gmail.com' });
      
      if (!defaultUser) {
        // Try to find any existing admin user
        defaultUser = await User.findOne({ role: 'admin' });
        
        if (!defaultUser) {
          return res.status(400).json({
            success: false,
            message: 'No admin user found. Please log in first.'
          });
        }
      }
      
      userId = defaultUser._id;
      console.log('Using actual admin user for 2FA:', defaultUser.email, userId);
    }
    
    if (!secretKey || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Secret key and verification code are required'
      });
    }
    
    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: secretKey,
      encoding: 'base32',
      token: verificationCode,
      window: 2 // Allow 2 time windows (60 seconds) for clock drift
    });
    
    if (verified) {
      // Update user with verification status
      await User.findByIdAndUpdate(userId, {
        'twoFactorAuth.lastUsed': new Date()
      });
      
      res.json({
        success: true,
        message: 'Verification successful'
      });
    } else {
      res.json({
        success: false,
        message: 'Invalid verification code'
      });
    }
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA code',
      error: error.message
    });
  }
});

// Enable 2FA for user
router.post('/enable', async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    // Get user from request headers or use a default for testing
    const authHeader = req.headers.authorization;
    let userId;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production");
        userId = decoded.userId;
      } catch (error) {
        console.log('Token verification failed, using default user');
        userId = null;
      }
    }
    
    // If no valid user, find default admin user
    if (!userId) {
      // Try to find the actual admin user (pre@gmail.com)
      let defaultUser = await User.findOne({ email: 'pre@gmail.com' });
      
      if (!defaultUser) {
        // Try to find any existing admin user
        defaultUser = await User.findOne({ role: 'admin' });
        
        if (!defaultUser) {
          return res.status(400).json({
            success: false,
            message: 'No admin user found. Please log in first.'
          });
        }
      }
      
      userId = defaultUser._id;
      console.log('Using actual admin user for 2FA:', defaultUser.email, userId);
    }
    
    // Get user to check if secret exists
    const user = await User.findById(userId);
    
    if (!user || !user.twoFactorAuth.secret) {
      return res.status(400).json({
        success: false,
        message: '2FA setup not completed. Please complete verification first.'
      });
    }
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Enable 2FA and store backup codes
    await User.findByIdAndUpdate(userId, {
      'twoFactorAuth.enabled': true,
      'twoFactorAuth.enabledAt': new Date(),
      'twoFactorAuth.backupCodes': backupCodes.map(code => ({
        code: code,
        used: false
      }))
    });
    
    res.json({
      success: true,
      message: 'Two-Factor Authentication enabled successfully',
      backupCodes: backupCodes,
      enabledAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable 2FA',
      error: error.message
    });
  }
});

// Disable 2FA
router.post('/disable', async (req, res) => {
  try {
    // Find the pre@gmail.com user and disable 2FA
    const user = await User.findOne({ email: 'pre@gmail.com' });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Disabling 2FA for user:', user.email, 'Current 2FA status:', user.twoFactorAuth?.enabled);
    
    // Disable 2FA in database
    await User.findByIdAndUpdate(user._id, {
      'twoFactorAuth.enabled': false,
      'twoFactorAuth.disabledAt': new Date(),
      'twoFactorAuth.secret': null,
      'twoFactorAuth.backupCodes': []
    });
    
    // Verify the update
    const updatedUser = await User.findById(user._id);
    console.log('After disable - 2FA status:', updatedUser.twoFactorAuth?.enabled);
    
    res.json({
      success: true,
      message: 'Two-Factor Authentication disabled successfully for pre@gmail.com',
      disabledAt: new Date().toISOString(),
      previousStatus: user.twoFactorAuth?.enabled,
      newStatus: false
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA',
      error: error.message
    });
  }
});

// Verify 2FA during login
router.post('/verify-login', async (req, res) => {
  try {
    const { userId, verificationCode, backupCode } = req.body;
    
    console.log('2FA Login Verification Request:', { userId, verificationCode, backupCode });
    
    if (!userId || (!verificationCode && !backupCode)) {
      return res.status(400).json({
        success: false,
        message: 'User ID and verification code or backup code required'
      });
    }
    
    // Get user from database using the provided userId
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('Found user for verification:', user.email, '2FA enabled:', user.twoFactorAuth?.enabled);
    
    if (!user.twoFactorAuth?.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA not enabled for this user'
      });
    }
    
    let verified = false;
    
    if (verificationCode) {
      // Verify TOTP code
      console.log('Verifying TOTP code:', verificationCode);
      console.log('Using secret:', user.twoFactorAuth.secret);
      
      verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: verificationCode,
        window: 5
      });
      
      console.log('TOTP verification result:', verified);
    } else if (backupCode) {
      // Verify backup code
      console.log('Verifying backup code:', backupCode);
      verified = await verifyBackupCode(user, backupCode);
      console.log('Backup code verification result:', verified);
    }
    
    if (verified) {
      // Update last used timestamp
      await User.findByIdAndUpdate(user._id, {
        'twoFactorAuth.lastUsed': new Date()
      });
      
      res.json({
        success: true,
        message: '2FA verification successful'
      });
    } else {
      res.json({
        success: false,
        message: 'Invalid verification code'
      });
    }
  } catch (error) {
    console.error('Error verifying 2FA login:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA login',
      error: error.message
    });
  }
});

// Generate backup codes
function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(generateRandomCode());
  }
  return codes;
}

// Generate random backup code
function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Verify backup code (check against database)
async function verifyBackupCode(user, code) {
  try {
    const backupCode = user.twoFactorAuth.backupCodes.find(bc => 
      bc.code === code && !bc.used
    );
    
    if (backupCode) {
      // Mark backup code as used
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'twoFactorAuth.backupCodes.$[elem].used': true,
          'twoFactorAuth.backupCodes.$[elem].usedAt': new Date()
        }
      }, {
        arrayFilters: [{ 'elem.code': code }]
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return false;
  }
}

// Get 2FA status
router.get('/status', async (req, res) => {
  try {
    // Get user from request headers or use a default for testing
    const authHeader = req.headers.authorization;
    let userId;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production");
        userId = decoded.userId;
      } catch (error) {
        console.log('Token verification failed, using default user');
        userId = null;
      }
    }
    
    // If no valid user, find the actual logged-in admin user
    if (!userId) {
      // Try to find the actual admin user (pre@gmail.com)
      let defaultUser = await User.findOne({ email: 'pre@gmail.com' });
      
      if (!defaultUser) {
        // Try to find any existing admin user
        defaultUser = await User.findOne({ role: 'admin' });
        
        if (!defaultUser) {
          return res.json({
            success: true,
            enabled: false,
            enabledAt: null,
            lastUsed: null,
            backupCodesRemaining: 0
          });
        }
      }
      
      userId = defaultUser._id;
      console.log('Using actual admin user for 2FA status:', defaultUser.email, userId);
    }
    
    // Get user from database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.json({
        success: true,
        enabled: false,
        enabledAt: null,
        lastUsed: null,
        backupCodesRemaining: 0
      });
    }
    
    const remainingBackupCodes = user.twoFactorAuth.backupCodes?.filter(bc => !bc.used).length || 0;
    
    res.json({
      success: true,
      enabled: user.twoFactorAuth.enabled || false,
      enabledAt: user.twoFactorAuth.enabledAt,
      lastUsed: user.twoFactorAuth.lastUsed,
      backupCodesRemaining: remainingBackupCodes
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get 2FA status',
      error: error.message
    });
  }
});

export default router;
