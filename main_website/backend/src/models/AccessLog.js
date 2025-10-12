import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for failed login attempts
  },
  email: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['login', 'logout', 'login_failed', 'password_change', 'profile_update', 'api_access', 'admin_access'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  location: {
    country: String,
    city: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'blocked', 'warning'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: false
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  metadata: {
    browser: String,
    os: String,
    device: String,
    referrer: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  indexes: [
    { userId: 1, timestamp: -1 },
    { ipAddress: 1, timestamp: -1 },
    { action: 1, timestamp: -1 },
    { status: 1, timestamp: -1 },
    { riskLevel: 1, timestamp: -1 }
  ]
});

// Static method to log an access event
accessLogSchema.statics.logAccess = async function(logData) {
  try {
    const log = new this({
      userId: logData.userId || null,
      email: logData.email,
      action: logData.action,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      location: logData.location || {},
      status: logData.status,
      details: logData.details,
      sessionId: logData.sessionId || null,
      riskLevel: logData.riskLevel || 'low',
      metadata: {
        browser: logData.browser || 'Unknown',
        os: logData.os || 'Unknown',
        device: logData.device || 'Unknown',
        referrer: logData.referrer || 'Direct',
        timestamp: new Date()
      }
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging access:', error);
    throw error;
  }
};

// Static method to get recent access logs
accessLogSchema.statics.getRecentLogs = async function(limit = 50, filters = {}) {
  try {
    const query = {};
    
    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.status) query.status = filters.status;
    if (filters.riskLevel) query.riskLevel = filters.riskLevel;
    if (filters.ipAddress) query.ipAddress = filters.ipAddress;
    
    const logs = await this.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return logs;
  } catch (error) {
    console.error('Error fetching access logs:', error);
    throw error;
  }
};

// Static method to get access statistics
accessLogSchema.statics.getAccessStats = async function(timeRange = '24h') {
  try {
    const now = new Date();
    let startTime;
    
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const stats = await this.aggregate([
      {
        $match: {
          createdAt: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: null,
          totalLogins: {
            $sum: { $cond: [{ $eq: ['$action', 'login'] }, 1, 0] }
          },
          failedAttempts: {
            $sum: { $cond: [{ $eq: ['$action', 'login_failed'] }, 1, 0] }
          },
          totalLogouts: {
            $sum: { $cond: [{ $eq: ['$action', 'logout'] }, 1, 0] }
          },
          uniqueUsers: {
            $addToSet: '$userId'
          },
          uniqueIPs: {
            $addToSet: '$ipAddress'
          },
          highRiskEvents: {
            $sum: { $cond: [{ $eq: ['$riskLevel', 'high'] }, 1, 0] }
          },
          criticalEvents: {
            $sum: { $cond: [{ $eq: ['$riskLevel', 'critical'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalLogins: 1,
          failedAttempts: 1,
          totalLogouts: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          uniqueIPs: { $size: '$uniqueIPs' },
          highRiskEvents: 1,
          criticalEvents: 1,
          securityScore: {
            $cond: [
              { $gt: ['$failedAttempts', 0] },
              {
                $subtract: [
                  100,
                  {
                    $multiply: [
                      { $divide: ['$failedAttempts', { $add: ['$totalLogins', '$failedAttempts'] }] },
                      50
                    ]
                  }
                ]
              },
              100
            ]
          }
        }
      }
    ]);

    return stats[0] || {
      totalLogins: 0,
      failedAttempts: 0,
      totalLogouts: 0,
      uniqueUsers: 0,
      uniqueIPs: 0,
      highRiskEvents: 0,
      criticalEvents: 0,
      securityScore: 100
    };
  } catch (error) {
    console.error('Error fetching access stats:', error);
    throw error;
  }
};

export default mongoose.model('AccessLog', accessLogSchema);
