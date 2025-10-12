import AccessLog from '../models/AccessLog.js';
import { UAParser } from 'ua-parser-js';
import { getIPLocation } from '../services/geolocationService.js';

// Helper function to get client IP
const getClientIP = (req) => {
  // Try to get real IP from various headers
  const ip = req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.headers['x-client-ip'] ||
         req.headers['cf-connecting-ip'] || // Cloudflare
         req.headers['x-cluster-client-ip'] ||
         '127.0.0.1';
  
  // Convert IPv6 loopback to IPv4 for better readability
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  
  // Remove IPv6 prefix if present
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  
  return ip;
};

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    device: result.device.type || 'Desktop'
  };
};

// Helper function to determine risk level
const calculateRiskLevel = (action, ipAddress, userAgent, location) => {
  let riskScore = 0;
  
  // Failed login attempts increase risk
  if (action === 'login_failed') riskScore += 30;
  
  // Multiple failed attempts from same IP
  // This would need to be checked against recent logs
  
  // Suspicious user agents
  if (userAgent.includes('bot') || userAgent.includes('crawler')) riskScore += 20;
  
  // Unknown locations
  if (!location || !location.country) riskScore += 10;
  
  // Determine risk level
  if (riskScore >= 70) return 'critical';
  if (riskScore >= 50) return 'high';
  if (riskScore >= 30) return 'medium';
  return 'low';
};

// Middleware to log access events - ONLY for auth-related events
export const logAccess = async (req, res, next) => {
  try {
    // Only log authentication-related events
    const shouldLog = 
      req.path.includes('/auth/login') ||
      req.path.includes('/auth/logout') ||
      req.path.includes('/auth/register') ||
      req.path.includes('/patient-auth/login') ||
      req.path.includes('/patient-auth/logout');
    
    if (!shouldLog) {
      return next(); // Skip logging for non-auth events
    }

    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const parsedUA = parseUserAgent(userAgent);
    
    // Determine action based on route
    let action = 'api_access';
    let status = 'success';
    let details = `${req.method} ${req.path}`;
    
    if (req.path.includes('/auth/login') || req.path.includes('/patient-auth/login')) {
      action = 'login';
      details = `LOGIN attempt from ${ipAddress}`;
    } else if (req.path.includes('/auth/logout') || req.path.includes('/patient-auth/logout')) {
      action = 'logout';
      details = `LOGOUT from ${ipAddress}`;
    } else if (req.path.includes('/auth/register')) {
      action = 'register';
      details = `REGISTER attempt from ${ipAddress}`;
    }
    
    // Get user info if authenticated
    const userId = req.user?.id || null;
    const email = req.user?.email || req.body?.email || 'anonymous';
    
    // Get real IP geolocation
    const location = await getIPLocation(ipAddress);
    
    const riskLevel = calculateRiskLevel(action, ipAddress, userAgent, location);
    
    // Log the access event
    await AccessLog.logAccess({
      userId,
      email,
      action,
      ipAddress,
      userAgent,
      location,
      status,
      details,
      sessionId: req.sessionID || null,
      riskLevel,
      ...parsedUA,
      referrer: req.headers.referer || 'Direct'
    });
    
    next();
  } catch (error) {
    console.error('Error in logAccess middleware:', error);
    // Don't block the request if logging fails
    next();
  }
};

// Middleware specifically for login attempts
export const logLoginAttempt = async (req, res, next) => {
  try {
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const parsedUA = parseUserAgent(userAgent);
    const email = req.body?.email || 'unknown';
    
    // Get real IP geolocation
    const location = await getIPLocation(ipAddress);
    
    // Log the login attempt (success/failure will be determined later)
    await AccessLog.logAccess({
      userId: null,
      email,
      action: 'login',
      ipAddress,
      userAgent,
      location,
      status: 'success', // Will be updated if login fails
      details: `LOGIN attempt from ${ipAddress}`,
      sessionId: req.sessionID || null,
      riskLevel: 'low',
      ...parsedUA,
      referrer: req.headers.referer || 'Direct'
    });
    
    next();
  } catch (error) {
    console.error('Error in logLoginAttempt middleware:', error);
    next();
  }
};

// Middleware to update login status after authentication
export const updateLoginStatus = async (req, res, next) => {
  try {
    if (req.path.includes('/auth/login')) {
      const ipAddress = getClientIP(req);
      const email = req.body?.email || 'unknown';
      
      // Find the most recent login attempt for this IP and email
      const recentLog = await AccessLog.findOne({
        ipAddress,
        email,
        action: 'login'
      }).sort({ createdAt: -1 });
      
      if (recentLog) {
        // Update the log with actual result
        recentLog.status = req.user ? 'success' : 'failed';
        recentLog.action = req.user ? 'login' : 'login_failed';
        recentLog.userId = req.user?.id || null;
        recentLog.sessionId = req.sessionID || null;
        recentLog.details = req.user 
          ? `LOGIN success from ${ipAddress}` 
          : `LOGIN failed from ${ipAddress}`;
        
        await recentLog.save();
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in updateLoginStatus middleware:', error);
    next();
  }
};

// Middleware for logout events
export const logLogout = async (req, res, next) => {
  try {
    if (req.path.includes('/auth/logout')) {
      const ipAddress = getClientIP(req);
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const parsedUA = parseUserAgent(userAgent);
      
      // Get real IP geolocation
      const location = await getIPLocation(ipAddress);
      
      await AccessLog.logAccess({
        userId: req.user?.id || null,
        email: req.user?.email || 'unknown',
        action: 'logout',
        ipAddress,
        userAgent,
        location,
        status: 'success',
        details: `LOGOUT from ${ipAddress}`,
        sessionId: req.sessionID || null,
        riskLevel: 'low',
        ...parsedUA,
        referrer: req.headers.referer || 'Direct'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in logLogout middleware:', error);
    next();
  }
};
