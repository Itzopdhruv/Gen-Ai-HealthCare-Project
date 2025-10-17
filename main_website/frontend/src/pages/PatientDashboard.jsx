import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { patientAPI } from '../services/api';
import AIDoctorTab from '../components/AIDoctorTab';
import PatientAppointmentBooking from '../components/PatientAppointmentBooking';
import AITherapist from '../components/AITherapist';
import HealthifyAssistant from '../components/HealthifyAssistant';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Avatar,
  Progress,
  Timeline,
  Tabs,
  Upload,
  message,
  Spin,
  notification
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined,
  BellOutlined,
  SettingOutlined,
  RobotOutlined,
  CameraOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  DropboxOutlined
} from '@ant-design/icons';
import './PatientDashboard.css';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ records: 0, appts: 0, meds: 0, score: 0 });
  const [demographics, setDemographics] = useState({ age: 'N/A', gender: 'N/A', bloodType: 'N/A' });
  const [reloadTick, setReloadTick] = useState(0);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [loadingHealthMetrics, setLoadingHealthMetrics] = useState(false);
  const [healthMetricsUpdating, setHealthMetricsUpdating] = useState(false);
  const [showHealthify, setShowHealthify] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();


  // Mock data
  const recentRecords = [
    {
      key: '1',
      date: '2025-01-15',
      hospital: 'Apollo Hospitals',
      doctor: 'Dr. Rajesh Kumar',
      specialty: 'Cardiology',
      status: 'Completed',
      type: 'Consultation'
    },
    {
      key: '2',
      date: '2025-01-10',
      hospital: 'Max Healthcare',
      doctor: 'Dr. Priya Sharma',
      specialty: 'Dermatology',
      status: 'Pending',
      type: 'Follow-up'
    },
    {
      key: '3',
      date: '2025-01-05',
      hospital: 'Fortis Healthcare',
      doctor: 'Dr. Amit Singh',
      specialty: 'Orthopedics',
      status: 'Completed',
      type: 'Surgery'
    }
  ];

  // Pull medications dynamically from latest prescriptions when available (fallback to sample)
  const [medications, setMedications] = useState([
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', nextRefill: '2025-02-15' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', nextRefill: '2025-02-20' },
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', nextRefill: '2025-02-25' }
  ]);

  // Profile image state
  const [profileImage, setProfileImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [showAITherapist, setShowAITherapist] = useState(false);

  const upcomingAppointments = [
    { date: '2025-01-20', time: '10:00 AM', doctor: 'Dr. Rajesh Kumar', specialty: 'Cardiology' },
    { date: '2025-01-25', time: '2:30 PM', doctor: 'Dr. Priya Sharma', specialty: 'Dermatology' }
  ];

  // Default health metrics (fallback)
  const defaultHealthMetrics = [
    { name: 'Blood Pressure', value: '120/80', status: 'Normal', color: '#52c41a' },
    { name: 'Heart Rate', value: '72 bpm', status: 'Normal', color: '#52c41a' },
    { name: 'Blood Sugar', value: '95 mg/dL', status: 'Normal', color: '#52c41a' },
    { name: 'Weight', value: '70 kg', status: 'Stable', color: '#1890ff' }
  ];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Hospital',
      dataIndex: 'hospital',
      key: 'hospital',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor',
      key: 'doctor',
    },
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal':
      case 'Stable':
        return '#52c41a';
      case 'High':
      case 'Pre-High':
      case 'Tachycardia':
      case 'Pre-Diabetic':
      case 'Overweight':
        return '#faad14';
      case 'Low':
      case 'Bradycardia':
      case 'Underweight':
        return '#1890ff';
      case 'Diabetic':
      case 'Obese':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  // Load health metrics from API
  const loadHealthMetrics = async () => {
    if (!user?.abhaId) {
      console.log('❌ No ABHA ID found for user:', user);
      return;
    }
    
    console.log('🔄 Loading health metrics for ABHA ID:', user.abhaId);
    setLoadingHealthMetrics(true);
    try {
      // Add a small delay to prevent rate limiting during development
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await api.get(`/health-metrics/latest/${user.abhaId}`);
      console.log('📊 Health metrics API response:', response.data);
      if (response.data.success) {
        const metrics = response.data.data.healthMetrics;
        const formattedMetrics = [
          {
            name: 'Blood Pressure',
            value: `${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic}`,
            status: metrics.bloodPressure.status,
            color: getStatusColor(metrics.bloodPressure.status)
          },
          {
            name: 'Heart Rate',
            value: `${metrics.heartRate.bpm} bpm`,
            status: metrics.heartRate.status,
            color: getStatusColor(metrics.heartRate.status)
          },
          {
            name: 'Blood Sugar',
            value: `${metrics.bloodSugar.mgdL} mg/dL`,
            status: metrics.bloodSugar.status,
            color: getStatusColor(metrics.bloodSugar.status)
          },
          {
            name: 'Weight',
            value: `${metrics.weight.kg} kg`,
            status: metrics.weight.status,
            color: getStatusColor(metrics.weight.status)
          }
        ];
        setHealthMetrics(formattedMetrics);
      } else {
        console.log('❌ No health metrics found, using defaults');
        // Use default metrics if no data found
        setHealthMetrics(defaultHealthMetrics);
      }
    } catch (error) {
      console.error('❌ Error loading health metrics:', error);
      console.error('❌ Error details:', error.response?.data);
      // Use default metrics on error
      setHealthMetrics(defaultHealthMetrics);
    } finally {
      setLoadingHealthMetrics(false);
    }
  };

  // Profile image upload handler
  const handleImageUpload = async (file) => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      formData.append('abhaId', user?.abhaId);
      
      const response = await fetch('/api/patient/upload-profile-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setProfileImage(result.data.imageUrl);
        message.success('Profile image updated successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully!');
    navigate('/login');
  };

  // Animate stats counters on mount
  useEffect(() => {
    const target = { records: 12, appts: 2, meds: 3, score: 85 };
    const duration = 800;
    const startTime = performance.now();
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setStats({
        records: Math.floor(ease * target.records),
        appts: Math.floor(ease * target.appts),
        meds: Math.floor(ease * target.meds),
        score: Math.floor(ease * target.score)
      });
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Helper function to format nextRefill date
  const formatNextRefill = (nextRefill) => {
    if (!nextRefill) return '—';
    try {
      const date = new Date(nextRefill);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return '—';
    }
  };

  // Fetch medications from patient.currentMedications and recent prescriptions
  useEffect(() => {
    const loadMeds = async () => {
      try {
        if (!user?.abhaId) return;
        console.log('🔄 Loading medications for ABHA ID:', user.abhaId);
        const combined = [];
        const seen = new Set();

        // Patient current medications
        const pRes = await patientAPI.lookupPatient(user.abhaId);
        const cm = pRes?.data?.patient?.currentMedications || [];
        console.log('📋 Current medications from patient:', cm);
        cm.forEach(m => {
          const key = `${m.name}|${m.dosage}|${m.frequency}`;
          if (m.name && !seen.has(key)) {
            seen.add(key);
            combined.push({ name: m.name, dosage: m.dosage, frequency: m.frequency, nextRefill: formatNextRefill(m.nextRefill) });
          }
        });

        // Recent prescriptions (last 5)
        const res = await patientAPI.getPrescriptions(user.abhaId, { page: 1, limit: 5 });
        const rx = res?.data?.prescriptions || [];
        console.log('📋 Recent prescriptions:', rx);
        rx.forEach(pr => {
          (pr.medications || []).forEach(m => {
            const key = `${m.name}|${m.dosage}|${m.frequency}`;
            if (m.name && !seen.has(key)) {
              seen.add(key);
              combined.push({ name: m.name, dosage: m.dosage, frequency: m.frequency, nextRefill: '—' });
            }
          });
        });

        console.log('💊 Combined medications:', combined);
        setMedications(combined); // Always update, even if empty
      } catch (e) {
        console.error('❌ Error loading medications:', e);
        // keep fallback meds on error
      }
    };
    loadMeds();
  }, [user?.abhaId, reloadTick]);

  // Listen for cross-page updates (e.g., when a new prescription is created elsewhere)
  useEffect(() => {
    const onPrescriptionCreated = async (e) => {
      console.log('📋 Prescription created event received:', e?.detail);
      console.log('👤 Current user ABHA ID:', user?.abhaId);
      if (e?.detail?.abhaId && e.detail.abhaId === user?.abhaId) {
        console.log('✅ ABHA IDs match, reloading medications...');
        // Add a small delay to ensure backend has processed the prescription
        setTimeout(async () => {
          try {
            // Force immediate refresh by calling the API directly
            const pRes = await patientAPI.lookupPatient(user.abhaId);
            const cm = pRes?.data?.patient?.currentMedications || [];
            console.log('🔄 Direct API call - Current medications:', cm);
            
            const res = await patientAPI.getPrescriptions(user.abhaId, { page: 1, limit: 5 });
            const rx = res?.data?.prescriptions || [];
            console.log('🔄 Direct API call - Recent prescriptions:', rx);
            
            // Update medications immediately
            const combined = [];
            const seen = new Set();
            
            cm.forEach(m => {
              const key = `${m.name}|${m.dosage}|${m.frequency}`;
              if (m.name && !seen.has(key)) {
                seen.add(key);
                combined.push({ name: m.name, dosage: m.dosage, frequency: m.frequency, nextRefill: formatNextRefill(m.nextRefill) });
              }
            });
            
        rx.forEach(pr => {
          (pr.medications || []).forEach(m => {
            const key = `${m.name}|${m.dosage}|${m.frequency}`;
            if (m.name && !seen.has(key)) {
              seen.add(key);
              combined.push({ name: m.name, dosage: m.dosage, frequency: m.frequency, nextRefill: formatNextRefill(m.nextRefill) });
            }
          });
        });
            
            console.log('💊 Direct update - Combined medications:', combined);
            setMedications(combined);
          } catch (error) {
            console.error('❌ Error in direct medication refresh:', error);
            // Fallback to normal reload
            setReloadTick((x) => x + 1);
          }
        }, 1000); // Increased delay to 1 second
      } else {
        console.log('❌ ABHA IDs do not match, ignoring event');
      }
    };
    const onReportUploaded = (e) => {
      console.log('📄 Report uploaded event received:', e?.detail);
      if (e?.detail?.abhaId && e.detail.abhaId === user?.abhaId) {
        console.log('✅ ABHA IDs match, reloading data...');
        setTimeout(() => {
          setReloadTick((x) => x + 1);
        }, 500);
      }
    };
    
    const onHealthMetricsUpdated = async (e) => {
      console.log('📊 Health metrics updated event received');
      if (e?.detail?.abhaId && e.detail.abhaId === user?.abhaId) {
        console.log('✅ Reloading health metrics...');
        setHealthMetricsUpdating(true);
        // Add a small delay to ensure backend has processed the update
        setTimeout(async () => {
          try {
            await loadHealthMetrics();
            console.log('✅ Health metrics reloaded successfully');
            
            // Show notification
            notification.success({
              message: 'Health Metrics Updated',
              description: 'Your health metrics have been updated by your healthcare provider.',
              placement: 'topRight',
              duration: 4.5,
            });
          } catch (error) {
            console.error('❌ Error reloading health metrics:', error);
            // Fallback to normal reload
            setReloadTick((x) => x + 1);
          } finally {
            setHealthMetricsUpdating(false);
          }
        }, 2000); // Increased delay to 2 seconds to prevent rate limiting
      }
    };
    
    window.addEventListener('prescriptionCreated', onPrescriptionCreated);
    window.addEventListener('reportUploaded', onReportUploaded);
    window.addEventListener('healthMetricsUpdated', onHealthMetricsUpdated);
    return () => {
      window.removeEventListener('prescriptionCreated', onPrescriptionCreated);
      window.removeEventListener('reportUploaded', onReportUploaded);
      window.removeEventListener('healthMetricsUpdated', onHealthMetricsUpdated);
    };
  }, [user?.abhaId]);

  // Fetch demographics for header cards
  useEffect(() => {
    const loadDemo = async () => {
      try {
        if (!user?.abhaId) return;
        const res = await patientAPI.lookupPatient(user.abhaId);
        const p = res?.data?.patient;
        if (p) {
          setDemographics({
            age: p.age ?? 'N/A',
            gender: p.gender ?? 'N/A',
            bloodType: p.bloodType ?? 'N/A'
          });
        }
      } catch {}
    };
    loadDemo();
  }, [user?.abhaId]);

  // Load health metrics
  useEffect(() => {
    loadHealthMetrics();
  }, [user?.abhaId, reloadTick]);

  // Check AI Doctor service availability
  useEffect(() => {
    const checkAIDoctor = async () => {
      try {
        const response = await fetch('/api/ai-doctor/health');
        if (response.ok) {
          setAiDoctorReady(true);
        }
      } catch (error) {
        console.log('AI Doctor service not available');
      }
    };
    checkAIDoctor();
  }, []);

  // Render AI Doctor in full screen mode
  if (activeTab === 'ai-doctor') {
    return <AIDoctorTab onClose={() => setActiveTab('overview')} />;
  }

  return (
    <Layout className="patient-dashboard">
      <Header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <span className="logo-medicare">Medi</span>
              <span className="logo-care">Care</span>
              <span className="logo-heart">❤️</span>
            </div>
            <Title level={4} className="welcome-text">
              Welcome back, {user?.name || 'Patient'}
            </Title>
          </div>
          <div className="header-right">
            <Space>
              <Button icon={<BellOutlined />} shape="circle" />
              <Button icon={<SettingOutlined />} shape="circle" />
              <Button 
                type="primary" 
                danger 
                onClick={handleLogout}
                icon={<UserOutlined />}
              >
                Logout
              </Button>
            </Space>
          </div>
        </div>
      </Header>

      <Layout>
        <Sider width={280} className="dashboard-sider">
          <div className="sider-content">
            {/* Enhanced User Profile Section */}
            <div className="user-profile">
              <div className="profile-image-container">
                <Upload
                  name="profileImage"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      message.error('You can only upload image files!');
                      return false;
                    }
                    const isLt2M = file.size / 1024 / 1024 < 2;
                    if (!isLt2M) {
                      message.error('Image must be smaller than 2MB!');
                      return false;
                    }
                    handleImageUpload(file);
                    return false;
                  }}
                  accept="image/*"
                >
                  <div className="profile-image-wrapper">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="profile-image"
                      />
                    ) : (
                      <Avatar size={100} icon={<UserOutlined />} className="profile-avatar" />
                    )}
                    <div className="image-overlay">
                      <CameraOutlined className="camera-icon" />
                    </div>
                    {imageUploading && (
                      <div className="upload-spinner">
                        <Spin size="small" />
                      </div>
                    )}
                  </div>
                </Upload>
              </div>
              
              <div className="profile-info">
                <Title level={4} className="profile-name">
                  {user?.name || 'Patient'}
                </Title>
                <div className="abha-badge">
                  <Text className="abha-text">ABHA ID: {user?.abhaId || 'N/A'}</Text>
                </div>
              </div>
            </div>
            
            {/* Enhanced Navigation Menu */}
            <div className="sider-menu">
              <div 
                className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <div className="menu-icon">
                  <FileTextOutlined />
                </div>
                <span className="menu-text">Overview</span>
                <div className="menu-indicator"></div>
              </div>
              
              <div 
                className={`menu-item ${activeTab === 'records' ? 'active' : ''}`}
                onClick={() => setActiveTab('records')}
              >
                <div className="menu-icon">
                  <FileTextOutlined />
                </div>
                <span className="menu-text">Health Records</span>
                <div className="menu-indicator"></div>
              </div>
              
              <div 
                className={`menu-item ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                <div className="menu-icon">
                  <CalendarOutlined />
                </div>
                <span className="menu-text">Appointments</span>
                <div className="menu-indicator"></div>
              </div>
              
              <div 
                className={`menu-item ${activeTab === 'medications' ? 'active' : ''}`}
                onClick={() => setActiveTab('medications')}
              >
                <div className="menu-icon">
                  <MedicineBoxOutlined />
                </div>
                <span className="menu-text">Medications</span>
                <div className="menu-indicator"></div>
              </div>
              
              <div 
                className={`menu-item ${activeTab === 'ai-doctor' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-doctor')}
              >
                <div className="menu-icon">
                  <RobotOutlined />
                </div>
                <span className="menu-text">AI Doctor</span>
                <div className="menu-indicator"></div>
              </div>
              
              <div 
                className="menu-item ai-therapist-item"
                onClick={() => setShowAITherapist(true)}
              >
                <div className="menu-icon">
                  <BulbOutlined />
                </div>
                <span className="menu-text">AI Therapist</span>
                <div className="menu-indicator"></div>
              </div>
            </div>
          </div>
        </Sider>

        <Content className="dashboard-content">
          <div className="content-wrapper">
            {activeTab === 'overview' && (
              <>
                {/* Demographics header cards - colorful */}
                <Row gutter={[24, 24]} className="stats-row fade-in" style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card style={{
                      borderRadius: 20,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f6ffed 100%)',
                      border: '1px solid #d9f7be',
                      boxShadow: '0 10px 30px rgba(82,196,26,0.12)'
                    }}>
                      <Typography.Text style={{ color: '#389e0d' }}>AGE</Typography.Text>
                      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, color: '#52c41a' }}>{demographics?.age || 'N/A'}</div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card style={{
                      borderRadius: 20,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f6ffed 100%)',
                      border: '1px solid #d9f7be',
                      boxShadow: '0 10px 30px rgba(82,196,26,0.12)'
                    }}>
                      <Typography.Text style={{ color: '#389e0d' }}>GENDER</Typography.Text>
                      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, color: '#52c41a' }}>{(demographics?.gender || 'N/A').toUpperCase()}</div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card style={{
                      borderRadius: 20,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f6ffed 100%)',
                      border: '1px solid #d9f7be',
                      boxShadow: '0 10px 30px rgba(82,196,26,0.12)'
                    }}>
                      <Typography.Text style={{ color: '#389e0d' }}>BLOOD TYPE</Typography.Text>
                      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, color: '#52c41a' }}>{String(demographics.bloodType || 'N/A').toUpperCase()}</div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card style={{
                      borderRadius: 20,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f6ffed 100%)',
                      border: '1px solid #d9f7be',
                      boxShadow: '0 10px 30px rgba(82,196,26,0.12)'
                    }}>
                      <Typography.Text style={{ color: '#389e0d' }}>ABHA ID</Typography.Text>
                      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, color: '#52c41a' }}>{user?.abhaId || 'N/A'}</div>
                    </Card>
                  </Col>
                </Row>
                <Row gutter={[24, 24]} className="stats-row fade-in">
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card glow">
                      <Statistic
                        title="Total Records"
                        value={stats.records}
                        prefix={<FileTextOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card glow delay-1">
                      <Statistic
                        title="Upcoming Appointments"
                        value={stats.appts}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card glow delay-2">
                      <Statistic
                        title="Active Medications"
                        value={stats.meds}
                        prefix={<MedicineBoxOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card glow delay-3">
                      <Statistic
                        title="Health Score"
                        value={stats.score}
                        suffix="%"
                        prefix={<HeartOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                </Row>


                <Row gutter={[24, 24]} className="slide-up">
        <Col xs={24}>
          <div className="health-metrics-container">
                      {/* Header Section */}
                      <div className="health-metrics-header">
                        <div className="header-content">
                          <div className="header-icon">
                            <HeartOutlined />
                          </div>
                          <div className="header-text">
                            <Title level={3} className="header-title">Health Metrics</Title>
                            <Text className="header-subtitle">Real-time vital signs monitoring</Text>
                          </div>
                        </div>
                        <Space>
                          <Button 
                            type="primary" 
                            icon={<EyeOutlined />}
                            onClick={loadHealthMetrics}
                            loading={loadingHealthMetrics || healthMetricsUpdating}
                            className="refresh-button"
                            ghost
                          >
                            Refresh
                          </Button>
                          <Button 
                            type="primary" 
                            icon={<RobotOutlined />}
                            onClick={() => setShowHealthify(!showHealthify)}
                            className="healthify-button"
                            ghost
                          >
                            {showHealthify ? 'Hide Healthify' : 'Healthify AI'}
                          </Button>
                        </Space>
                      </div>

                      {/* Metrics Grid */}
                      {loadingHealthMetrics ? (
                        <div className="metrics-loading">
                          <Spin size="large" />
                          <div className="loading-text">Loading health metrics...</div>
                        </div>
                      ) : (
                        <div className="metrics-grid">
                          {healthMetrics.map((metric, index) => (
                            <div 
                              key={index} 
                              className="metric-card"
                              style={{ 
                                animationDelay: `${index * 0.1}s`,
                                '--metric-color': metric.color 
                              }}
                            >
                              <div className="metric-card-inner">
                                <div className={`metric-icon ${metric.name.toLowerCase().replace(' ', '-')}-icon`}>
                                  {metric.name === 'Blood Pressure' && <HeartOutlined />}
                                  {metric.name === 'Heart Rate' && <ThunderboltOutlined />}
                                  {metric.name === 'Blood Sugar' && <DropboxOutlined />}
                                  {metric.name === 'Weight' && <UserOutlined />}
                                </div>
                                <div className="metric-content">
                                  <div className="metric-label">{metric.name}</div>
                                  <div className="metric-value" style={{ color: metric.color }}>
                                    {metric.value}
                                  </div>
                                  <div className="metric-status">
                                    <Tag 
                                      color={getStatusColor(metric.status)}
                                      className="status-tag"
                                    >
                                      {metric.status}
                                    </Tag>
                                  </div>
                                </div>
                                <div className="metric-progress">
                                  <Progress 
                                    percent={85} 
                                    showInfo={false} 
                                    strokeColor={metric.color}
                                    trailColor="rgba(255,255,255,0.2)"
                                    strokeWidth={6}
                                    className="progress-bar"
                                  />
                                </div>
                                <div className="metric-glow"></div>
                              </div>
                            </div>
                          ))}
                          
                          {healthMetricsUpdating && (
                            <div className="updating-overlay">
                              <Spin size="large" />
                              <div className="updating-text">Updating health metrics...</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Healthify AI Assistant */}
                  {showHealthify && (
                    <Col xs={24}>
                      <HealthifyAssistant 
                        healthMetrics={healthMetrics}
                        user={user}
                      />
                    </Col>
                  )}

                </Row>
              </>
            )}

            {activeTab === 'records' && (
              <Card title="Health Records" className="records-card">
                <div className="card-actions">
                  <Space>
                    <Button type="primary" icon={<PlusOutlined />}>
                      Add Record
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                      Export Records
                    </Button>
                    <Upload>
                      <Button icon={<EyeOutlined />}>
                        Upload Document
                      </Button>
                    </Upload>
                  </Space>
                </div>
                <Table 
                  columns={columns} 
                  dataSource={recentRecords}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )}

            {activeTab === 'appointments' && (
              <PatientAppointmentBooking />
            )}

            {activeTab === 'medications' && (
              <Card 
                title="Current Medications" 
                className="medications-card"
                extra={
                  <Button 
                    type="text" 
                    icon={<MedicineBoxOutlined />}
                    onClick={() => {
                      console.log('🔄 Manual medication refresh triggered');
                      setReloadTick((x) => x + 1);
                    }}
                    style={{ color: '#667eea' }}
                  >
                    Refresh
                  </Button>
                }
              >
                <div className="medications-header">
                  <div className="header-main-text">
                    <Text className="main-description">
                      <span className="description-word">Manage</span>
                      <span className="description-word">your</span>
                      <span className="description-word">medications</span>
                      <span className="description-word">and</span>
                      <span className="description-word">get</span>
                      <span className="description-word">AI-powered</span>
                      <span className="description-word">pharmacy</span>
                      <span className="description-word">assistance</span>
                    </Text>
                  </div>
                  <div className="pharm-ai-section">
                    <div className="live-indicator">
                      <div className="live-dot"></div>
                      <span className="live-text">LIVE</span>
                    </div>
                    <div className="pharm-ai-tagline">
                      <span className="pharm-ai-text">PHARM AI</span>
                      <div className="animated-tagline">
                        <span className="word-animation">OUR</span>
                        <span className="word-animation">ULTIMATE</span>
                        <span className="word-animation">PHARMACY</span>
                        <span className="word-animation">SOLUTION</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {medications.map((med, index) => (
                    <div key={index} className="medication-card" data-index={index}>
                      <div className="medication-card-content">
                        <div className="medication-info">
                          <div className="medication-name">
                            <MedicineBoxOutlined className="medication-icon" />
                            <Text strong style={{ 
                              fontSize: '20px', 
                              color: '#667eea',
                              fontWeight: '700',
                              letterSpacing: '0.5px',
                              textShadow: '0 2px 4px rgba(102, 126, 234, 0.1)'
                            }}>
                              {med.name}
                            </Text>
                          </div>
                          <div className="medication-details">
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                              {med.dosage} - {med.frequency}
                            </Text>
                          </div>
                          <div className="medication-status">
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              Next refill: {med.nextRefill}
                            </Text>
                          </div>
                        </div>
                        <div className="medication-actions">
                          <div className="medicine-finished-text">
                            <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                              Medicine finished? Use Pharm AI
                            </Text>
                          </div>
                          <Button 
                            type="primary" 
                            className="pharm-ai-medication-btn"
                            onClick={() => {
                              // Open deployed Pharm AI
                              const PHARM_AI_URL = import.meta.env.VITE_PHARM_AI_URL || 'https://pharmacy-ai-rho.vercel.app';
                              const newWindow = window.open(`${PHARM_AI_URL}/`, '_blank');
                              if (newWindow) {
                                console.log('Opening deployed Pharm AI');
                              } else {
                                alert('Unable to open Pharm AI. Please check your popup blocker settings.');
                              }
                            }}
                          >
                            🏥 Pharm AI
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </Space>
              </Card>
            )}

            {activeTab === 'emergency' && (
              <Card title="Emergency Services" className="emergency-card">
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={12}>
                    <Card className="emergency-option" type="inner">
                      <div className="emergency-content">
                        <HeartOutlined className="emergency-icon" />
                        <Title level={4}>Emergency Contact</Title>
                        <Paragraph>Contact nearest emergency services</Paragraph>
                        <Button type="primary" danger size="large" block>
                          Call Emergency (108)
                        </Button>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card className="emergency-option" type="inner">
                      <div className="emergency-content">
                        <FileTextOutlined className="emergency-icon" />
                        <Title level={4}>Share Health Records</Title>
                        <Paragraph>Share your health records with emergency responders</Paragraph>
                        <Button type="primary" size="large" block>
                          Share Records
                        </Button>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>
            )}

          </div>
        </Content>
      </Layout>
      
      {/* AI Therapist Modal */}
      <AITherapist 
        isVisible={showAITherapist}
        onClose={() => setShowAITherapist(false)}
        patientData={user}
      />
    </Layout>
  );
};

export default PatientDashboard;
