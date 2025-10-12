import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Switch,
  Button,
  Space,
  Timeline,
  Statistic,
  Progress,
  Alert,
  Badge,
  Tooltip,
  Modal,
  Form,
  Select,
  Input,
  notification,
  Spin
} from 'antd';
import {
  SecurityScanOutlined,
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  SettingOutlined,
  EyeOutlined,
  ReloadOutlined,
  BellOutlined,
  WarningOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import api from '../services/api';
import TwoFactorAuthSetup from './TwoFactorAuthSetup';
import './SecurityDashboard.css';

const { Title, Text } = Typography;
const { Option } = Select;

const SecurityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [accessLogs, setAccessLogs] = useState([]);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    apiSecurity: 'enabled',
    autoBlock: true,
    rateLimit: 100
  });
  const [securityMetrics, setSecurityMetrics] = useState({
    totalLogins: 0,
    failedAttempts: 0,
    activeSessions: 0,
    threatLevel: 'low',
    blockedIPs: 0,
    securityScore: 85
  });
  const [threatAlerts, setThreatAlerts] = useState([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
  const [twoFactorStatusModalVisible, setTwoFactorStatusModalVisible] = useState(false);
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [form] = Form.useForm();

  // Fetch security data
  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch real access logs and stats
      const [logsResponse, statsResponse, settingsResponse] = await Promise.all([
        api.get('/admin/security/logs'),
        api.get('/admin/security/logs/stats'),
        api.get('/admin/security/settings')
      ]);

      // Use real data from API
      const logs = logsResponse.data.logs || [];
      setAccessLogs(logs);
      setSecurityMetrics(statsResponse.data.stats || {
        totalLogins: 0,
        failedAttempts: 0,
        activeSessions: 0,
        threatLevel: 'low',
        blockedIPs: 0,
        securityScore: 100
      });
      setSecuritySettings(settingsResponse.data.settings || securitySettings);
      
      // Generate threat alerts based on real data
      generateThreatAlertsFromRealData(statsResponse.data.stats);
      
      // Check 2FA status
      const status = await check2FAStatus();
      console.log('2FA Status from API:', status);
      console.log('Current security settings before update:', securitySettings);
      setSecuritySettings(prev => {
        const updated = { ...prev, twoFactorAuth: status.enabled };
        console.log('Updated security settings:', updated);
        return updated;
      });
      
    } catch (error) {
      console.error('Error fetching security data:', error);
      // No fallback to mock data - show empty state instead
      setAccessLogs([]);
      setSecurityMetrics({
        totalLogins: 0,
        failedAttempts: 0,
        activeSessions: 0,
        threatLevel: 'low',
        blockedIPs: 0,
        securityScore: 100
      });
      setThreatAlerts([]);
    } finally {
      setLoading(false);
    }
  };


  // Generate threat alerts from real data
  const generateThreatAlertsFromRealData = (realStats) => {
    const alerts = [];
    
    if (realStats.failedAttempts > 10) {
      alerts.push({
        id: 1,
        type: 'warning',
        message: `${realStats.failedAttempts} failed login attempts detected in the last 24 hours`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (realStats.threatLevel === 'high') {
      alerts.push({
        id: 2,
        type: 'error',
        message: 'High threat level detected - consider enabling additional security measures',
        timestamp: new Date().toISOString()
      });
    }
    
    if (realStats.securityScore < 80) {
      alerts.push({
        id: 3,
        type: 'warning',
        message: `Security score is ${realStats.securityScore}% - review failed login attempts`,
        timestamp: new Date().toISOString()
      });
    }
    
    setThreatAlerts(alerts);
  };

  // Check 2FA status
  const check2FAStatus = async () => {
    try {
      const response = await api.get('/auth/2fa/status');
      console.log('2FA Status Response:', response.data);
      setTwoFactorStatus(response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return { enabled: false };
    }
  };

  // Update security setting
  const updateSecuritySetting = async (key, value) => {
    try {
      console.log('Updating security setting:', key, 'to:', value);
      
      if (key === 'twoFactorAuth' && value === true) {
        // Check current 2FA status first
        const status = await check2FAStatus();
        
        if (status.enabled) {
          // 2FA is already enabled, show status modal
          setTwoFactorStatusModalVisible(true);
        } else {
          // 2FA is not enabled, show setup modal
          setTwoFactorModalVisible(true);
        }
        return;
      }
      
      if (key === 'twoFactorAuth' && value === false) {
        // Disable 2FA
        await api.post('/auth/2fa/disable');
        setSecuritySettings(prev => ({ ...prev, [key]: value }));
        notification.success({
          message: '2FA Disabled',
          description: 'Two-Factor Authentication has been disabled'
        });
        return;
      }
      
      console.log('Making API call to update setting:', { setting: key, value: value });
      const response = await api.put('/admin/security/settings', { setting: key, value: value });
      console.log('API response:', response.data);
      
      setSecuritySettings(prev => ({ ...prev, [key]: value }));
      
      // Special notification for rate limit
      if (key === 'rateLimit') {
        notification.success({
          message: 'Rate Limit Updated',
          description: `Rate limit has been updated to ${value} requests per 15 minutes`
        });
      } else {
        notification.success({
          message: 'Security Setting Updated',
          description: `${key} has been updated successfully`
        });
      }
    } catch (error) {
      console.error('Error updating security setting:', error);
      console.error('Error details:', error.response?.data || error.message);
      notification.error({
        message: 'Update Failed',
        description: `Failed to update ${key}: ${error.response?.data?.message || error.message}`
      });
    }
  };

  // Handle setting edit
  const handleEditSetting = (setting) => {
    setEditingSetting(setting);
    setSettingsModalVisible(true);
    form.setFieldsValue({ [setting]: securitySettings[setting] });
  };

  // Handle setting save
  const handleSaveSetting = async () => {
    try {
      const values = await form.validateFields();
      console.log('Saving setting:', editingSetting, 'with value:', values[editingSetting]);
      await updateSecuritySetting(editingSetting, values[editingSetting]);
      setSettingsModalVisible(false);
      setEditingSetting(null);
      form.resetFields();
    } catch (error) {
      console.error('Error saving setting:', error);
      notification.error({
        message: 'Save Failed',
        description: 'Failed to save setting. Please try again.'
      });
    }
  };

  // Handle 2FA disable
  const handle2FADisable = async () => {
    try {
      await api.post('/auth/2fa/disable');
      setTwoFactorStatusModalVisible(false);
      setSecuritySettings(prev => ({ ...prev, twoFactorAuth: false }));
      notification.success({
        message: '2FA Disabled',
        description: 'Two-Factor Authentication has been disabled'
      });
      fetchSecurityData(); // Refresh data
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      notification.error({
        message: 'Disable Failed',
        description: 'Failed to disable 2FA'
      });
    }
  };

  // Handle 2FA setup success
  const handle2FASuccess = () => {
    console.log('2FA Setup Success - Updating toggle state');
    setTwoFactorModalVisible(false);
    setSecuritySettings(prev => {
      console.log('Previous settings:', prev);
      const newSettings = { ...prev, twoFactorAuth: true };
      console.log('New settings:', newSettings);
      return newSettings;
    });
    notification.success({
      message: '2FA Enabled Successfully',
      description: 'Two-Factor Authentication has been enabled for your account'
    });
    fetchSecurityData(); // Refresh data to get updated 2FA status
  };

  // Get status color for access logs
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'blocked': return 'orange';
      default: return 'blue';
    }
  };

  // Get status icon for access logs
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined />;
      case 'failed': return <ExclamationCircleOutlined />;
      case 'blocked': return <LockOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  // Get threat level color
  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'blue';
    }
  };

  // Format location object to string
  const formatLocation = (location) => {
    if (!location) return 'Unknown';
    
    if (typeof location === 'string') {
      return location.trim() || 'Unknown';
    }
    
    if (typeof location === 'object' && location !== null) {
      const parts = [];
      
      // Add city if available and not empty
      if (location.city && location.city.trim() && location.city !== 'Unknown' && location.city !== 'Local') {
        parts.push(location.city.trim());
      }
      
      // Add region if available and not empty
      if (location.region && location.region.trim() && location.region !== 'Unknown' && location.region !== 'Local') {
        parts.push(location.region.trim());
      }
      
      // Add country if available and not empty
      if (location.country && location.country.trim() && location.country !== 'Unknown') {
        parts.push(location.country.trim());
      }
      
      const result = parts.join(', ');
      return result || 'Unknown';
    }
    
    return 'Unknown';
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'Unknown time';
      
      // Handle different timestamp formats
      let date;
      if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return 'Unknown time';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown time';
      }
      
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Unknown time';
    }
  };

  // Load data once on component mount (no auto-refresh)
  useEffect(() => {
    fetchSecurityData();
  }, []);

  if (loading) {
    return (
      <div className="security-dashboard-loading">
        <Spin size="large" />
        <div className="loading-text">Loading Security Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="security-dashboard">
      {/* Header */}
      <div className="security-header">
        <div className="header-content">
          <div className="header-icon">
            <SecurityScanOutlined />
          </div>
          <div className="header-text">
            <Title level={2} className="header-title">Security Dashboard</Title>
            <Text className="header-subtitle">Real-time security monitoring and management</Text>
          </div>
        </div>
        <div className="header-actions">
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchSecurityData}
              loading={loading}
            >
              Refresh
            </Button>
            <Badge count={threatAlerts.length} size="small">
              <Button icon={<BellOutlined />}>
                Alerts
              </Button>
            </Badge>
          </Space>
        </div>
      </div>

      {/* Threat Alerts */}
      {threatAlerts.length > 0 && (
        <div className="threat-alerts">
          {threatAlerts.map(alert => (
            <Alert
              key={alert.id}
              type={alert.type}
              message={alert.message}
              showIcon
              closable
              className="alert-item"
            />
          ))}
        </div>
      )}

      {/* Security Metrics */}
      <Row gutter={[24, 24]} className="metrics-section">
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card">
            <Statistic
              title="Total Logins"
              value={securityMetrics.totalLogins}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card">
            <Statistic
              title="Failed Attempts"
              value={securityMetrics.failedAttempts}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card">
            <Statistic
              title="Active Sessions"
              value={securityMetrics.activeSessions}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card">
            <Statistic
              title="Security Score"
              value={securityMetrics.securityScore}
              suffix="%"
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={securityMetrics.securityScore} 
              showInfo={false} 
              strokeColor="#52c41a"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]} className="main-content">
        {/* Access Logs */}
        <Col xs={24} lg={12}>
          <div className="access-logs-section">
            <div className="section-header">
              <div className="section-title">
                <EyeOutlined />
                <span>Access Logs</span>
                <Badge count={accessLogs.length} size="small" />
              </div>
              <Button size="small" icon={<ReloadOutlined />} onClick={fetchSecurityData} className="refresh-btn">
                Refresh
              </Button>
            </div>
            <div className="access-logs">
              <Timeline
                items={accessLogs.slice(0, 10).map((log, index) => ({
                  key: log.id,
                  dot: getStatusIcon(log.status),
                  color: getStatusColor(log.status),
                  children: (
                    <div className={`log-entry ${index === 0 ? 'new-entry' : ''}`}>
                      <div className="log-header">
                        <Text strong>{log.details}</Text>
                        <Tag color={getStatusColor(log.status)} size="small">
                          {log.status.toUpperCase()}
                        </Tag>
                      </div>
                      <div className="log-details">
                        <Text strong style={{ color: 'white' }}>
                          {formatTimestamp(log.timestamp || log.createdAt)} • {log.ipAddress || log.ip || 'Unknown IP'}
                        </Text>
                        {log.location && (
                          <Text strong style={{ color: 'white' }}> • {formatLocation(log.location)}</Text>
                        )}
                      </div>
                    </div>
                  )
                }))}
              />
            </div>
          </div>
        </Col>

        {/* Security Settings */}
        <Col xs={24} lg={12}>
          <div className="security-settings-section">
            <div className="section-header">
              <div className="section-title">
                <SettingOutlined />
                <span>Security Settings</span>
              </div>
            </div>
            <div className="security-settings">
              <div className="setting-item">
                <div className="setting-info">
                  <Text strong>Two-Factor Authentication</Text>
                  <Text type="secondary">Require 2FA for all users</Text>
                </div>
                <div className="setting-controls">
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Text strong>Session Timeout</Text>
                  <Text type="secondary">Auto-logout after inactivity</Text>
                </div>
                <div className="setting-controls">
                  <Button 
                    size="small"
                    onClick={() => handleEditSetting('sessionTimeout')}
                  >
                    {securitySettings.sessionTimeout} min
                  </Button>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Text strong>Password Policy</Text>
                  <Text type="secondary">Enforce strong passwords</Text>
                </div>
                <div className="setting-controls">
                  <Button 
                    size="small"
                    onClick={() => handleEditSetting('passwordPolicy')}
                  >
                    {securitySettings.passwordPolicy}
                  </Button>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Text strong>API Security</Text>
                  <Text type="secondary">Rate limiting and validation</Text>
                </div>
                <div className="setting-controls">
                  <Button 
                    size="small"
                    onClick={() => handleEditSetting('apiSecurity')}
                  >
                    {securitySettings.apiSecurity}
                  </Button>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Text strong>Auto-Block</Text>
                  <Text type="secondary">Block IPs after failed attempts</Text>
                </div>
                <div className="setting-controls">
                  <Switch
                    checked={securitySettings.autoBlock}
                    onChange={(checked) => updateSecuritySetting('autoBlock', checked)}
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Text strong>Rate Limiting</Text>
                  <Text type="secondary">Requests per minute limit</Text>
                </div>
                <div className="setting-controls">
                  <Button 
                    size="small"
                    onClick={() => handleEditSetting('rateLimit')}
                  >
                    {securitySettings.rateLimit}/min
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Threat Level Indicator */}
      <Row gutter={[24, 24]} className="threat-section">
        <Col xs={24}>
          <Card className="threat-level-card">
            <div className="threat-level-content">
              <div className="threat-info">
                <Title level={4}>
                  <WarningOutlined /> Current Threat Level
                </Title>
                <Text type="secondary">
                  System security status based on recent activity
                </Text>
              </div>
              <div className="threat-indicator">
                <Tag 
                  color={getThreatLevelColor(securityMetrics.threatLevel)}
                  className="threat-tag"
                >
                  {securityMetrics.threatLevel.toUpperCase()}
                </Tag>
                <Progress 
                  percent={
                    securityMetrics.threatLevel === 'low' ? 25 : 
                    securityMetrics.threatLevel === 'medium' ? 60 : 90
                  }
                  strokeColor={getThreatLevelColor(securityMetrics.threatLevel)}
                  showInfo={false}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Settings Modal */}
      <Modal
        title={`Edit ${editingSetting}`}
        open={settingsModalVisible}
        onOk={handleSaveSetting}
        onCancel={() => {
          setSettingsModalVisible(false);
          setEditingSetting(null);
          form.resetFields();
        }}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name={editingSetting}
            label={`${editingSetting} Value`}
            rules={[{ required: true, message: 'Please enter a value' }]}
          >
            {editingSetting === 'sessionTimeout' ? (
              <Select placeholder="Select timeout duration">
                <Option value={15}>15 minutes</Option>
                <Option value={30}>30 minutes</Option>
                <Option value={60}>1 hour</Option>
                <Option value={120}>2 hours</Option>
              </Select>
            ) : editingSetting === 'passwordPolicy' ? (
              <Select placeholder="Select password policy">
                <Option value="basic">Basic</Option>
                <Option value="strong">Strong</Option>
                <Option value="very-strong">Very Strong</Option>
              </Select>
            ) : editingSetting === 'apiSecurity' ? (
              <Select placeholder="Select API security level">
                <Option value="disabled">Disabled</Option>
                <Option value="enabled">Enabled</Option>
                <Option value="strict">Strict</Option>
              </Select>
            ) : editingSetting === 'rateLimit' ? (
              <Input 
                type="number" 
                placeholder="Enter rate limit"
                addonAfter="requests/min"
              />
            ) : (
              <Input placeholder="Enter value" />
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* 2FA Setup Modal */}
      <TwoFactorAuthSetup
        visible={twoFactorModalVisible}
        onClose={() => setTwoFactorModalVisible(false)}
        onSuccess={handle2FASuccess}
      />

      {/* 2FA Status Modal */}
      <Modal
        title={
          <Space>
            <SafetyOutlined style={{ color: '#52c41a' }} />
            <span>Two-Factor Authentication Status</span>
          </Space>
        }
        open={twoFactorStatusModalVisible}
        onCancel={() => setTwoFactorStatusModalVisible(false)}
        footer={null}
        width={500}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Alert
            message="2FA is Already Enabled"
            description="Two-Factor Authentication is currently active for your account."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />

          {twoFactorStatus && (
            <div style={{ marginBottom: 24 }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong>Enabled At:</Text>
                  <br />
                  <Text type="secondary">
                    {twoFactorStatus.enabledAt ? 
                      new Date(twoFactorStatus.enabledAt).toLocaleString() : 
                      'Unknown'
                    }
                  </Text>
                </div>
                
                <div>
                  <Text strong>Last Used:</Text>
                  <br />
                  <Text type="secondary">
                    {twoFactorStatus.lastUsed ? 
                      new Date(twoFactorStatus.lastUsed).toLocaleString() : 
                      'Never'
                    }
                  </Text>
                </div>
                
                <div>
                  <Text strong>Backup Codes Remaining:</Text>
                  <br />
                  <Text type="secondary">
                    {twoFactorStatus.backupCodesRemaining || 0} codes
                  </Text>
                </div>
              </Space>
            </div>
          )}

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              danger
              size="large"
              onClick={handle2FADisable}
              icon={<SafetyOutlined />}
              block
            >
              Disable Two-Factor Authentication
            </Button>
            
            <Button
              type="default"
              size="large"
              onClick={() => setTwoFactorStatusModalVisible(false)}
              block
            >
              Close
            </Button>
          </Space>

          <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <strong>Security Note:</strong><br />
              • 2FA provides an extra layer of security<br />
              • Keep your authenticator app secure<br />
              • Save backup codes in a safe place<br />
              • Disabling 2FA reduces account security
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SecurityDashboard;
