import rateLimit from 'express-rate-limit';

// Global rate limiter instance
let globalRateLimiter = null;

// Default rate limit settings
const defaultRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting for health check endpoints
    return req.path.includes('/health') || req.path.includes('/api/health');
  }
};

// Create rate limiter with custom settings
export const createRateLimiter = (maxRequests = 100, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      message: `Too many requests from this IP, please try again later. (Limit: ${maxRequests} requests per ${windowMinutes} minutes)`
    },
    skip: (req) => {
      // Skip rate limiting for health check endpoints
      return req.path.includes('/health') || req.path.includes('/api/health');
    }
  });
};

// Initialize global rate limiter
export const initializeRateLimiter = () => {
  globalRateLimiter = createRateLimiter();
  return globalRateLimiter;
};

// Update global rate limiter
export const updateRateLimiter = (maxRequests, windowMinutes = 15) => {
  globalRateLimiter = createRateLimiter(maxRequests, windowMinutes);
  return globalRateLimiter;
};

// Get current rate limiter
export const getRateLimiter = () => {
  if (!globalRateLimiter) {
    globalRateLimiter = initializeRateLimiter();
  }
  return globalRateLimiter;
};

// Get current rate limit settings
export const getRateLimitSettings = () => {
  return {
    max: globalRateLimiter?.max || defaultRateLimit.max,
    windowMs: globalRateLimiter?.windowMs || defaultRateLimit.windowMs,
    windowMinutes: Math.round((globalRateLimiter?.windowMs || defaultRateLimit.windowMs) / (60 * 1000))
  };
};
