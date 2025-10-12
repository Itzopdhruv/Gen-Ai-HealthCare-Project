import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { updateRateLimiter, getRateLimitSettings } from '../services/rateLimiterService.js';

const router = express.Router();

// Default security settings
const defaultSecuritySettings = {
  twoFactorAuth: true,
  sessionTimeout: 30,
  passwordPolicy: 'strong',
  apiSecurity: 'enabled',
  autoBlock: true,
  rateLimit: 100,
  maxLoginAttempts: 5,
  ipWhitelist: ['192.168.1.0/24'],
  encryptionLevel: 'high',
  auditLogging: true,
  lastModified: new Date().toISOString(),
  modifiedBy: 'admin'
};

// Get security logs - directly fetch from access logs
router.get('/logs', async (req, res) => {
  try {
    // Import AccessLog model
    const AccessLog = (await import('../models/AccessLog.js')).default;
    
    const { 
      limit = 50, 
      page = 1, 
      action, 
      status, 
      riskLevel, 
      ipAddress,
      userId 
    } = req.query;

    // Build filter object
    const filter = {};
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (ipAddress) filter.ipAddress = ipAddress;
    if (userId) filter.user = userId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch logs with pagination (newest first)
    const logs = await AccessLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await AccessLog.countDocuments(filter);

    res.json({
      success: true,
      logs: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security logs',
      error: error.message
    });
  }
});

// Get security settings
router.get('/settings', async (req, res) => {
  try {
    // Get current rate limit settings
    const currentRateLimit = getRateLimitSettings();
    
    // In a real app, this would come from database
    const settings = { 
      ...defaultSecuritySettings,
      rateLimit: currentRateLimit.max // Use current rate limit from service
    };
    
    res.json({
      success: true,
      settings: settings,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security settings',
      error: error.message
    });
  }
});

// Update security settings
router.put('/settings', async (req, res) => {
  try {
    const { setting, value } = req.body;
    
    console.log('Received setting update:', { setting, value, type: typeof value });
    
    if (!setting || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Setting name and value are required'
      });
    }
    
    // Convert string numbers to actual numbers for validation
    let processedValue = value;
    if (setting === 'rateLimit' || setting === 'sessionTimeout' || setting === 'maxLoginAttempts') {
      processedValue = Number(value);
      if (isNaN(processedValue)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid numeric value'
        });
      }
    }
    
    // Validate setting values
    const validSettings = {
      twoFactorAuth: typeof processedValue === 'boolean',
      sessionTimeout: typeof processedValue === 'number' && processedValue > 0,
      passwordPolicy: ['basic', 'strong', 'very-strong'].includes(processedValue),
      apiSecurity: ['disabled', 'enabled', 'strict'].includes(processedValue),
      autoBlock: typeof processedValue === 'boolean',
      rateLimit: typeof processedValue === 'number' && processedValue > 0,
      maxLoginAttempts: typeof processedValue === 'number' && processedValue > 0,
      encryptionLevel: ['low', 'medium', 'high'].includes(processedValue),
      auditLogging: typeof processedValue === 'boolean'
    };
    
    console.log('Validation check:', { setting, processedValue, isValid: validSettings[setting] });
    
    if (!validSettings[setting]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid setting or value'
      });
    }
    
    // Handle special cases for certain settings
    if (setting === 'rateLimit') {
      // Update the actual rate limiter
      updateRateLimiter(processedValue, 15); // 15 minutes window
      console.log(`Rate limit updated to ${processedValue} requests per 15 minutes`);
    }
    
    // In a real app, this would update the database
    const updatedSettings = {
      ...defaultSecuritySettings,
      [setting]: processedValue,
      lastModified: new Date().toISOString(),
      modifiedBy: req.user?.name || 'admin'
    };
    
    res.json({
      success: true,
      message: 'Security setting updated successfully',
      settings: updatedSettings,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security settings',
      error: error.message
    });
  }
});

// Get security metrics - directly fetch from access logs stats
router.get('/metrics', async (req, res) => {
  try {
    // Import AccessLog model
    const AccessLog = (await import('../models/AccessLog.js')).default;
    
    const { timeRange = '24h' } = req.query;
    
    const stats = await AccessLog.getAccessStats(timeRange);
    
    res.json({
      success: true,
      stats: stats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security metrics',
      error: error.message
    });
  }
});

// Get threat alerts - simplified for real data
router.get('/alerts', requireAdmin, async (req, res) => {
  try {
    // Return empty alerts - real alerts will be generated by frontend based on real data
    res.json({
      success: true,
      alerts: [],
      total: 0,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching threat alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threat alerts',
      error: error.message
    });
  }
});

// Block IP address
router.post('/block-ip', requireAdmin, async (req, res) => {
  try {
    const { ip, reason } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required'
      });
    }
    
    // In a real app, this would add IP to blocked list
    res.json({
      success: true,
      message: `IP address ${ip} has been blocked`,
      blockedIP: ip,
      reason: reason || 'Manual block by admin',
      blockedAt: new Date().toISOString(),
      blockedBy: req.user.name || 'admin'
    });
  } catch (error) {
    console.error('Error blocking IP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block IP address',
      error: error.message
    });
  }
});

// Unblock IP address
router.post('/unblock-ip', requireAdmin, async (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required'
      });
    }
    
    // In a real app, this would remove IP from blocked list
    res.json({
      success: true,
      message: `IP address ${ip} has been unblocked`,
      unblockedIP: ip,
      unblockedAt: new Date().toISOString(),
      unblockedBy: req.user.name || 'admin'
    });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock IP address',
      error: error.message
    });
  }
});

// Get system health
router.get('/system-health', requireAdmin, async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        api: 'healthy',
        auth: 'healthy',
        logging: 'healthy'
      }
    };
    
    res.json({
      success: true,
      health: health
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error.message
    });
  }
});

export default router;
