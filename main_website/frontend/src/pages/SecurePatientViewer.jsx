import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Card, 
  Button, 
  message, 
  Spin, 
  Typography, 
  Space, 
  Divider,
  Tag,
  Descriptions,
  Alert,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  CalendarOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import api from '../services/api';
import './SecurePatientViewer.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const SecurePatientViewer = () => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [error, setError] = useState(null);

  const lookupPatientByABHA = async () => {
    try {
      console.log('Looking up patient with ABHA ID:', patientId);
      setLoading(true);
      setError(null);
      
      // Use the patient lookup API to get patient details by ABHA ID
      const response = await api.get(`/patient/lookup/${patientId}`);
      
      console.log('Patient lookup response:', response.data);
      
      if (response.data.success) {
        const patientData = response.data.data.patient;
        setPatient(patientData);
        setHealthRecords(response.data.data.healthRecords || []);
        setLoading(false);
        console.log('✅ Patient data loaded successfully:', patientData);
      } else {
        setError('Patient not found with this ABHA ID: ' + patientId);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error looking up patient:', error);
      console.log('Error response:', error.response);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      
      if (error.response?.status === 404) {
        setError('Patient not found with this ABHA ID: ' + patientId);
      } else if (error.response?.status === 401) {
        setError('Authentication required. Please log in to access patient records.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to view this patient\'s records.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to lookup patient: ' + (error.response?.data?.message || error.message));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('SecurePatientViewer mounted with patientId:', patientId);
    if (patientId) {
      lookupPatientByABHA();
    }
  }, [patientId]);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px' }}>
            <Text>Loading patient data for ABHA ID: {patientId}</Text>
            <br />
            <Text type="secondary">Please wait...</Text>
          </div>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          <Button type="primary" onClick={() => navigate('/')}>
            <ArrowLeftOutlined /> Go Back
          </Button>
        </Content>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Text>No patient data available</Text>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={3} style={{ margin: 0 }}>
            Patient Records - {patient.name}
          </Title>
          <Button type="primary" onClick={() => navigate('/')}>
            <ArrowLeftOutlined /> Go Back
          </Button>
        </div>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title="Patient Information" style={{ marginBottom: '24px' }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Name" icon={<UserOutlined />}>
                  {patient.name}
                </Descriptions.Item>
                <Descriptions.Item label="ABHA ID" icon={<UserOutlined />}>
                  <Tag color="blue">{patient.abhaId}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Phone" icon={<PhoneOutlined />}>
                  {patient.phone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Email" icon={<MailOutlined />}>
                  {patient.email || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Age" icon={<CalendarOutlined />}>
                  {patient.age || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Gender" icon={<UserOutlined />}>
                  {patient.gender || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Blood Type" icon={<HeartOutlined />}>
                  {patient.bloodType || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated" icon={<CalendarOutlined />}>
                  {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          
          {healthRecords && healthRecords.length > 0 && (
            <Col span={24}>
              <Card title="Health Records" icon={<MedicineBoxOutlined />}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {healthRecords.map((record, index) => (
                    <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                      <Text strong>{record.type || 'Health Record'}</Text>
                      <br />
                      <Text type="secondary">
                        {record.description || 'No description available'}
                      </Text>
                      {record.date && (
                        <div style={{ marginTop: '8px' }}>
                          <Tag color="green">
                            {new Date(record.date).toLocaleDateString()}
                          </Tag>
                        </div>
                      )}
                    </Card>
                  ))}
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      </Content>
    </Layout>
  );
};

export default SecurePatientViewer;