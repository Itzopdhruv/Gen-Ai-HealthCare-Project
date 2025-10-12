import express from 'express';
import AccessLog from '../models/AccessLog.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/security/logs
// @desc    Get real access logs
// @access  Public (temporarily for testing)
router.get('/logs', async (req, res) => {
  try {
    const { 
      limit = 50, 
      page = 1, 
      action, 
      status, 
      riskLevel, 
      ipAddress,
      userId 
    } = req.query;

    const filters = {};
    if (action) filters.action = action;
    if (status) filters.status = status;
    if (riskLevel) filters.riskLevel = riskLevel;
    if (ipAddress) filters.ipAddress = ipAddress;
    if (userId) filters.userId = userId;

    const logs = await AccessLog.getRecentLogs(
      parseInt(limit), 
      filters
    );

    // Format logs for frontend
    const formattedLogs = logs.map(log => ({
      id: log._id,
      type: log.action,
      user: log.email,
      ip: log.ipAddress,
      status: log.status,
      location: log.location?.city && log.location?.country 
        ? `${log.location.city}, ${log.location.country}` 
        : 'Unknown',
      timestamp: log.createdAt.toISOString(),
      details: log.details,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      riskLevel: log.riskLevel,
      metadata: log.metadata
    }));

    res.json({
      success: true,
      logs: formattedLogs,
      total: formattedLogs.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access logs',
      error: error.message
    });
  }
});

// @route   GET /api/admin/security/logs/stats
// @desc    Get access log statistics
// @access  Public (temporarily for testing)
router.get('/logs/stats', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const stats = await AccessLog.getAccessStats(timeRange);
    
    res.json({
      success: true,
      stats: {
        totalLogins: stats.totalLogins,
        failedAttempts: stats.failedAttempts,
        activeSessions: stats.uniqueUsers, // Approximate active sessions
        threatLevel: stats.criticalEvents > 0 ? 'high' : 
                    stats.highRiskEvents > 5 ? 'medium' : 'low',
        blockedIPs: stats.uniqueIPs, // This would need separate tracking
        securityScore: Math.round(stats.securityScore)
      },
      timeRange,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching access stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access stats',
      error: error.message
    });
  }
});

// @route   GET /api/admin/security/logs/export
// @desc    Export access logs
// @access  Public (temporarily for testing)
router.get('/logs/export', async (req, res) => {
  try {
    const { format = 'json', limit = 1000 } = req.query;
    
    const logs = await AccessLog.getRecentLogs(parseInt(limit));
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'ID,Email,Action,IP Address,Status,Location,Timestamp,Details,Risk Level\n';
      const csvData = logs.map(log => 
        `${log._id},${log.email},${log.action},${log.ipAddress},${log.status},"${log.location?.city || 'Unknown'}, ${log.location?.country || 'Unknown'}",${log.createdAt.toISOString()},${log.details},${log.riskLevel}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=access_logs.csv');
      res.send(csvHeaders + csvData);
    } else {
      // Return JSON
      res.json({
        success: true,
        logs: logs,
        exportedAt: new Date().toISOString(),
        total: logs.length
      });
    }
  } catch (error) {
    console.error('Error exporting access logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export access logs',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/security/logs/cleanup
// @desc    Clean up old access logs
// @access  Public (temporarily for testing)
router.delete('/logs/cleanup', async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await AccessLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old access logs`,
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate.toISOString()
    });
  } catch (error) {
    console.error('Error cleaning up access logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean up access logs',
      error: error.message
    });
  }
});

export default router;
