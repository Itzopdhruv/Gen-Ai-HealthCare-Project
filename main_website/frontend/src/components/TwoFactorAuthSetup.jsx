import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Steps,
  QRCode,
  Alert,
  Space,
  Typography,
  Divider,
  message
} from 'antd';
import {
  QrcodeOutlined,
  MobileOutlined,
  SafetyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const TwoFactorAuthSetup = ({ visible, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [qrCodeData, setQrCodeData] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Step 1: Generate QR Code and Secret
  const generateQRCode = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/2fa/generate');
      
      setQrCodeData(response.data.qrCodeData);
      setSecretKey(response.data.secretKey);
      setCurrentStep(1);
    } catch (error) {
      console.error('2FA Generate Error:', error);
      message.error('Failed to generate 2FA setup. Please make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the code
  const verifyCode = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/2fa/verify', {
        secretKey: secretKey,
        verificationCode: verificationCode
      });
      
      if (response.data.success) {
        setCurrentStep(2);
        message.success('Verification successful! Proceed to complete setup.');
      } else {
        message.error('Invalid verification code');
      }
    } catch (error) {
      console.error('2FA Verify Error:', error);
      message.error('Failed to verify code. Please check your authenticator app.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete setup
  const completeSetup = async () => {
    // Prevent multiple rapid calls
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/2fa/enable', {
        secretKey: secretKey
      });
      
      if (response.data.success) {
        message.success('Two-Factor Authentication enabled successfully!');
        onSuccess(); // Call onSuccess here, not onClose
        onClose();
      } else {
        message.error(response.data.message || 'Failed to enable 2FA');
      }
    } catch (error) {
      console.error('2FA Enable Error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        message.error('Too many attempts. Please wait a few minutes before trying again.');
      } else if (error.response?.status === 400) {
        message.error(error.response.data.message || 'Invalid request. Please try again.');
      } else {
        message.error('Failed to enable 2FA. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Generate QR Code',
      description: 'Create your unique 2FA secret',
      icon: <QrcodeOutlined />
    },
    {
      title: 'Scan & Verify',
      description: 'Scan QR code and enter verification code',
      icon: <MobileOutlined />
    },
    {
      title: 'Complete Setup',
      description: 'Enable 2FA for your account',
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          <span>Setup Two-Factor Authentication</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="2fa-setup-modal"
    >
      <div className="2fa-setup-content">
        <Steps current={currentStep} items={steps} />
        
        <Divider />
        
        {currentStep === 0 && (
          <div className="step-content">
            <Title level={4}>Step 1: Generate Your 2FA Secret</Title>
            <Paragraph>
              We'll generate a unique secret key and QR code for your account. 
              This will be used to create time-based verification codes.
            </Paragraph>
            
            <Alert
              message="What is 2FA?"
              description="Two-Factor Authentication adds an extra layer of security by requiring both your password and a code from your phone."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Button 
              type="primary" 
              size="large"
              onClick={generateQRCode}
              loading={loading}
              icon={<QrcodeOutlined />}
            >
              Generate QR Code
            </Button>
          </div>
        )}
        
        {currentStep === 1 && (
          <div className="step-content">
            <Title level={4}>Step 2: Scan QR Code</Title>
            <Paragraph>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </Paragraph>
            
            <div className="qr-code-container">
              <QRCode 
                value={qrCodeData}
                size={200}
                errorLevel="M"
                style={{ margin: '0 auto', display: 'block' }}
              />
            </div>
            
            <Alert
              message="Manual Entry"
              description={`If you can't scan the QR code, manually enter this secret key: ${secretKey}`}
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Form form={form} onFinish={verifyCode}>
              <Form.Item
                name="verificationCode"
                label="Enter 6-digit verification code"
                rules={[
                  { required: true, message: 'Please enter verification code' },
                  { len: 6, message: 'Code must be 6 digits' }
                ]}
              >
                <Input
                  placeholder="123456"
                  maxLength={6}
                  style={{ fontSize: 24, textAlign: 'center', letterSpacing: 8 }}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </Form.Item>
              
              <Button 
                type="primary" 
                size="large"
                htmlType="submit"
                loading={loading}
                block
              >
                Verify Code
              </Button>
            </Form>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="step-content">
            <Title level={4}>Step 3: Complete Setup</Title>
            <Paragraph>
              Great! Your verification code was correct. Now let's enable 2FA for your account.
            </Paragraph>
            
            <Alert
              message="Backup Codes"
              description="Make sure to save your backup codes in a safe place. You'll need them if you lose your phone."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Button 
              type="primary" 
              size="large"
              onClick={completeSetup}
              loading={loading}
              disabled={loading}
              icon={<CheckCircleOutlined />}
              block
            >
              {loading ? 'Enabling 2FA...' : 'Enable Two-Factor Authentication'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TwoFactorAuthSetup;
