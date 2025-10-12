import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Alert,
  message
} from 'antd';
import {
  SafetyOutlined,
  MobileOutlined,
  KeyOutlined
} from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const TwoFactorLoginVerification = ({ 
  visible, 
  onClose, 
  onSuccess, 
  userId, 
  userEmail 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [form] = Form.useForm();
  const { setToken, setUser } = useAuth();

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      
      // Step 1: Verify 2FA code
      console.log('🔐 Verifying 2FA code:', verificationCode);
      const verifyResponse = await api.post('/auth/2fa/verify-login', {
        userId: userId,
        verificationCode: verificationCode,
        backupCode: useBackupCode ? backupCode : null
      });
      
      if (!verifyResponse.data.success) {
        message.error(verifyResponse.data.message || 'Invalid verification code');
        return;
      }
      
      console.log('✅ 2FA verification successful');
      
      // Step 2: Complete login with temp token
      const tempToken = localStorage.getItem('tempToken');
      console.log('🔐 Using temp token:', tempToken ? 'EXISTS' : 'MISSING');
      console.log('🔐 Temp token length:', tempToken ? tempToken.length : 'N/A');
      console.log('🔐 Temp token first 50 chars:', tempToken ? tempToken.substring(0, 50) : 'N/A');
      
      if (!tempToken) {
        message.error('Session expired. Please login again.');
        onClose();
        return;
      }
      
      console.log('🔐 Sending login-complete request with userId:', userId);
      const completeResponse = await api.post('/auth/login-complete', {
        userId: userId,
        tempToken: tempToken
      });
      
      if (!completeResponse.data.success) {
        message.error('Login completion failed');
        return;
      }
      
      console.log('✅ Login completed successfully');
      
      // Step 3: Store final token and user data
      const { token: finalToken, user: userData } = completeResponse.data;
      
      localStorage.setItem('token', finalToken);
      localStorage.setItem('authType', 'user');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('tempToken'); // Clean up
      
      // Update AuthContext state
      setToken(finalToken);
      setUser(userData);
      
      console.log('✅ AuthContext state updated');
      
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        message.success('Login successful!');
        onSuccess();
      }, 100);
      
    } catch (error) {
      console.error('❌ 2FA verification error:', error);
      message.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setVerificationCode('');
    setBackupCode('');
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <span>Two-Factor Authentication Required</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      maskClosable={false}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Alert
          message="Security Verification Required"
          description={`Please enter your 2FA code to complete login for ${userEmail}`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleVerifyCode}
        >
          {!useBackupCode ? (
            <Form.Item
              label="Authenticator Code"
              rules={[{ required: true, message: 'Please enter your 6-digit code' }]}
            >
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                prefix={<MobileOutlined />}
                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="Backup Code"
              rules={[{ required: true, message: 'Please enter your backup code' }]}
            >
              <Input
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder="Enter 8-character backup code"
                maxLength={8}
                prefix={<KeyOutlined />}
                style={{ textAlign: 'center', fontSize: '16px', letterSpacing: '1px' }}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={<SafetyOutlined />}
            >
              Verify & Continue Login
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="link"
              onClick={handleBackupCode}
              style={{ padding: 0 }}
            >
              {useBackupCode ? 'Use Authenticator Code Instead' : 'Use Backup Code Instead'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24, textAlign: 'left' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>Need help?</strong>
          </Text>
          <ul style={{ fontSize: '12px', marginTop: 8, paddingLeft: 16 }}>
            <li>Make sure your device time is synchronized</li>
            <li>Check your authenticator app (Google Authenticator, Authy)</li>
            <li>Use a backup code if you can't access your authenticator</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default TwoFactorLoginVerification;