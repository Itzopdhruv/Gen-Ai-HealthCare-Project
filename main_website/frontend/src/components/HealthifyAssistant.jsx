import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Progress,
  Tag,
  Space,
  Divider,
  Tabs,
  Input,
  Form,
  Modal,
  List,
  Statistic
} from 'antd';
import {
  RobotOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  AppleOutlined,
  FireOutlined,
  BulbOutlined,
  TrophyOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  AimOutlined
} from '@ant-design/icons';
import api from '../services/api';
import './HealthifyAssistant.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const HealthifyAssistant = ({ healthMetrics, user }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState({});
  const [activeTab, setActiveTab] = useState('recommendations');
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form] = Form.useForm();

  // Analyze health metrics and get recommendations
  const analyzeHealthMetrics = async () => {
    if (!healthMetrics || healthMetrics.length === 0) {
      message.warning('No health metrics available for analysis');
      return;
    }

    setLoading(true);
    try {
      // Prepare metrics data for analysis
      const metricsData = healthMetrics.map(metric => ({
        name: metric.name,
        value: metric.value,
        status: metric.status,
        color: metric.color
      }));

      // Create analysis prompt
      const analysisPrompt = `You are a medical AI assistant specializing in personalized health recommendations. Analyze these specific health metrics and provide detailed, actionable recommendations:

CURRENT HEALTH METRICS:
${metricsData.map(m => `${m.name}: ${m.value} (Status: ${m.status})`).join('\n')}

CRITICAL ANALYSIS REQUIREMENTS:
1. Identify ALL concerning metrics (High, Critical, Warning, Diabetic, Tachycardia status)
2. Provide SPECIFIC medical recommendations for each concerning metric
3. Include exact metric values in your recommendations
4. Address the most life-threatening issues first
5. Give actionable steps, not generic advice

SPECIFIC RECOMMENDATION REQUIREMENTS:

DIET: Provide specific dietary changes for each concerning metric:
- For HIGH BLOOD PRESSURE: Specific foods to avoid (sodium, processed foods) and include (potassium-rich foods)
- For DIABETIC BLOOD SUGAR: Specific carb management, glycemic index foods, meal timing
- For HEART CONDITIONS: Heart-healthy fats, anti-inflammatory foods
- Include specific serving sizes and meal examples

EXERCISE: Provide exercise recommendations considering current health status:
- For HIGH BLOOD PRESSURE: Specific low-impact exercises, intensity levels, duration
- For TACHYCARDIA: Heart rate monitoring, safe exercise zones, warning signs
- For DIABETIC CONDITIONS: Blood sugar management during exercise, timing
- Include specific exercise types, frequency, and progression

LIFESTYLE: Address specific health issues with actionable steps:
- For HIGH BLOOD PRESSURE: Stress management techniques, sleep optimization, medication timing
- For HEART CONDITIONS: Heart rate monitoring, warning signs to watch for
- For DIABETIC CONDITIONS: Blood sugar monitoring schedule, emergency protocols
- Include specific daily routines and lifestyle modifications

GOALS: Create specific, measurable goals based on actual metric values:
- Include target numbers (e.g., "Reduce blood pressure from 205/95 to 180/90")
- Set realistic timelines (e.g., "Lower blood sugar from 130 to 110 mg/dL in 2 months")
- Include monitoring methods and success criteria

Format your response as bullet points:
DIET: 
• [Specific dietary recommendation for each concerning metric]
• [Include exact foods, serving sizes, and frequencies]

EXERCISE: 
• [Specific exercise recommendation for each concerning metric]
• [Include intensity levels, duration, and safety considerations]

LIFESTYLE: 
• [Specific lifestyle modification for each concerning metric]
• [Include daily routines, monitoring schedules, and warning signs]

GOALS: 
• [Goal 1: specific, measurable with target numbers and timeline]
• [Goal 2: specific, measurable with target numbers and timeline]
• [Goal 3: specific, measurable with target numbers and timeline]`;

      const response = await api.get('/health/gemini-test', {
        params: { q: analysisPrompt }
      });

      if (response.data.success) {
        parseRecommendations(response.data.text);
        message.success('Health analysis completed!');
      } else {
        throw new Error('Failed to get AI analysis');
      }
    } catch (error) {
      console.error('Error analyzing health metrics:', error);
      message.error('Failed to analyze health metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Parse AI response into structured recommendations
  const parseRecommendations = (aiResponse) => {
    const lines = aiResponse.split('\n');
    const parsed = {
      diet: '',
      exercise: '',
      lifestyle: '',
      goals: []
    };

    lines.forEach(line => {
      if (line.startsWith('DIET:')) {
        parsed.diet = line.replace('DIET:', '').trim();
      } else if (line.startsWith('EXERCISE:')) {
        parsed.exercise = line.replace('EXERCISE:', '').trim();
      } else if (line.startsWith('LIFESTYLE:')) {
        parsed.lifestyle = line.replace('LIFESTYLE:', '').trim();
      } else if (line.startsWith('GOALS:')) {
        const goalsText = line.replace('GOALS:', '').trim();
        parsed.goals = goalsText.split(',').map(goal => goal.trim()).filter(goal => goal);
      }
    });

    // If AI response is too generic, provide specific recommendations based on metrics
    if (!parsed.diet || parsed.diet.length < 50) {
      parsed.diet = generateSpecificDietRecommendation(healthMetrics);
    }
    if (!parsed.exercise || parsed.exercise.length < 50) {
      parsed.exercise = generateSpecificExerciseRecommendation(healthMetrics);
    }
    if (!parsed.lifestyle || parsed.lifestyle.length < 50) {
      parsed.lifestyle = generateSpecificLifestyleRecommendation(healthMetrics);
    }
    if (!parsed.goals || parsed.goals.length === 0) {
      parsed.goals = generateSpecificGoals(healthMetrics);
    }

    setRecommendations(parsed);
    
    // Initialize progress for goals
    const initialProgress = {};
    parsed.goals.forEach((goal, index) => {
      initialProgress[index] = Math.floor(Math.random() * 40) + 20; // Random progress 20-60%
    });
    setProgress(initialProgress);
  };

  // Generate specific diet recommendations based on health metrics
  const generateSpecificDietRecommendation = (metrics) => {
    const recommendations = [];
    const concerns = [];

    metrics.forEach(metric => {
      if (metric.status.toLowerCase().includes('high') || metric.status.toLowerCase().includes('diabetic') || metric.status.toLowerCase().includes('critical') || metric.status.toLowerCase().includes('elevated') || metric.status.toLowerCase().includes('pre-high')) {
        concerns.push(metric);
      }
    });

    if (concerns.length > 0) {
      concerns.forEach(metric => {
        if (metric.name.toLowerCase().includes('blood pressure')) {
          if (metric.status.toLowerCase().includes('high')) {
            recommendations.push(`• Reduce sodium to under 1500mg daily for high blood pressure (${metric.value})`);
            recommendations.push(`• Increase potassium-rich foods: bananas (2-3 daily), spinach (1 cup), sweet potatoes`);
            recommendations.push(`• Limit processed foods and avoid added salt`);
          } else if (metric.status.toLowerCase().includes('elevated') || metric.status.toLowerCase().includes('pre-high')) {
            recommendations.push(`• Monitor sodium intake (under 2000mg daily) for elevated blood pressure (${metric.value})`);
            recommendations.push(`• Include potassium-rich foods: bananas, spinach, avocados`);
          }
        }
        if (metric.name.toLowerCase().includes('blood sugar')) {
          if (metric.status.toLowerCase().includes('diabetic')) {
            recommendations.push(`• Limit carbs to 45-60g per meal for diabetic blood sugar (${metric.value})`);
            recommendations.push(`• Choose low-glycemic foods: quinoa, berries, nuts, leafy greens`);
            recommendations.push(`• Eat smaller, frequent meals to stabilize blood sugar`);
          } else if (metric.status.toLowerCase().includes('pre-diabetic')) {
            recommendations.push(`• Limit refined carbs for pre-diabetic blood sugar (${metric.value})`);
            recommendations.push(`• Focus on whole grains, lean proteins, and vegetables`);
          }
        }
        if (metric.name.toLowerCase().includes('heart rate')) {
          recommendations.push(`• Include omega-3 rich foods: salmon (3x weekly), walnuts, flaxseeds for tachycardia (${metric.value})`);
          recommendations.push(`• Avoid caffeine, alcohol, and energy drinks`);
          recommendations.push(`• Eat magnesium-rich foods: dark leafy greens, nuts, seeds`);
        }
        if (metric.name.toLowerCase().includes('weight')) {
          if (metric.status.toLowerCase().includes('overweight') || metric.status.toLowerCase().includes('obese')) {
            recommendations.push(`• Create calorie deficit for weight management (current: ${metric.value}kg)`);
            recommendations.push(`• Focus on lean proteins: chicken breast, fish, legumes`);
            recommendations.push(`• Increase fiber intake: vegetables, fruits, whole grains`);
            recommendations.push(`• Control portion sizes and avoid late-night eating`);
          } else if (metric.status.toLowerCase().includes('underweight')) {
            recommendations.push(`• Increase calorie-dense foods for healthy weight gain (current: ${metric.value}kg)`);
            recommendations.push(`• Include healthy fats: nuts, avocados, olive oil`);
            recommendations.push(`• Eat frequent, nutrient-rich meals`);
          }
        }
      });
    } else {
      recommendations.push("• Maintain balanced diet with 5-7 servings of fruits/vegetables daily");
      recommendations.push("• Include lean proteins and whole grains");
      recommendations.push("• Stay hydrated with 8-10 glasses of water");
    }

    return recommendations.join('\n');
  };

  // Generate specific exercise recommendations based on health metrics
  const generateSpecificExerciseRecommendation = (metrics) => {
    const recommendations = [];
    const concerns = [];

    metrics.forEach(metric => {
      if (metric.status.toLowerCase().includes('high') || metric.status.toLowerCase().includes('diabetic') || metric.status.toLowerCase().includes('critical') || metric.status.toLowerCase().includes('tachycardia') || metric.status.toLowerCase().includes('elevated') || metric.status.toLowerCase().includes('pre-high')) {
        concerns.push(metric);
      }
    });

    if (concerns.length > 0) {
      concerns.forEach(metric => {
        if (metric.name.toLowerCase().includes('blood pressure')) {
          if (metric.status.toLowerCase().includes('high')) {
            recommendations.push(`• Start with 15-20 minutes of low-impact exercises for high blood pressure (${metric.value})`);
            recommendations.push(`• Focus on walking, swimming, cycling - gradually increase to 30 minutes daily`);
            recommendations.push(`• Avoid high-intensity exercises until blood pressure is controlled`);
          } else if (metric.status.toLowerCase().includes('elevated') || metric.status.toLowerCase().includes('pre-high')) {
            recommendations.push(`• Engage in moderate exercise for elevated blood pressure (${metric.value})`);
            recommendations.push(`• Include brisk walking, light jogging, or dancing for 30 minutes daily`);
          }
        }
        if (metric.name.toLowerCase().includes('heart rate')) {
          recommendations.push(`• Monitor heart rate during exercise for tachycardia (${metric.value})`);
          recommendations.push(`• Stay below 100 bpm - start with 10-minute sessions`);
          recommendations.push(`• Choose low-intensity activities: walking, yoga, gentle stretching`);
          recommendations.push(`• Gradually increase duration as heart rate improves`);
        }
        if (metric.name.toLowerCase().includes('blood sugar')) {
          if (metric.status.toLowerCase().includes('diabetic')) {
            recommendations.push(`• Exercise 30 minutes after meals for diabetic blood sugar (${metric.value})`);
            recommendations.push(`• Include both cardio and strength training`);
            recommendations.push(`• Monitor blood sugar before and after exercise`);
            recommendations.push(`• Carry glucose tablets during exercise`);
          } else if (metric.status.toLowerCase().includes('pre-diabetic')) {
            recommendations.push(`• Regular exercise helps prevent diabetes progression (${metric.value})`);
            recommendations.push(`• Aim for 150 minutes of moderate exercise weekly`);
          }
        }
        if (metric.name.toLowerCase().includes('weight')) {
          if (metric.status.toLowerCase().includes('overweight') || metric.status.toLowerCase().includes('obese')) {
            recommendations.push(`• Combine cardio and strength training for weight management (${metric.value}kg)`);
            recommendations.push(`• Start with 20-30 minutes daily, gradually increase`);
            recommendations.push(`• Include activities you enjoy: dancing, hiking, sports`);
            recommendations.push(`• Focus on consistency over intensity`);
          } else if (metric.status.toLowerCase().includes('underweight')) {
            recommendations.push(`• Include strength training for healthy weight gain (${metric.value}kg)`);
            recommendations.push(`• Focus on building muscle mass with resistance exercises`);
            recommendations.push(`• Combine with adequate nutrition and rest`);
          }
        }
      });
    } else {
      recommendations.push("• Engage in 30 minutes of moderate exercise daily");
      recommendations.push("• Include both cardio and strength training");
      recommendations.push("• Find activities you enjoy to maintain consistency");
    }

    return recommendations.join('\n');
  };

  // Generate specific lifestyle recommendations based on health metrics
  const generateSpecificLifestyleRecommendation = (metrics) => {
    const recommendations = [];
    const concerns = [];

    metrics.forEach(metric => {
      if (metric.status.toLowerCase().includes('high') || metric.status.toLowerCase().includes('diabetic') || metric.status.toLowerCase().includes('critical') || metric.status.toLowerCase().includes('tachycardia') || metric.status.toLowerCase().includes('elevated') || metric.status.toLowerCase().includes('pre-high')) {
        concerns.push(metric);
      }
    });

    if (concerns.length > 0) {
      concerns.forEach(metric => {
        if (metric.name.toLowerCase().includes('blood pressure')) {
          if (metric.status.toLowerCase().includes('high')) {
            recommendations.push(`• Practice daily meditation (10-15 minutes) for high blood pressure (${metric.value})`);
            recommendations.push(`• Ensure 7-8 hours of quality sleep nightly`);
            recommendations.push(`• Monitor blood pressure twice daily (morning and evening)`);
            recommendations.push(`• Manage stress through deep breathing and relaxation techniques`);
          } else if (metric.status.toLowerCase().includes('elevated') || metric.status.toLowerCase().includes('pre-high')) {
            recommendations.push(`• Monitor blood pressure weekly for elevated readings (${metric.value})`);
            recommendations.push(`• Practice stress management techniques`);
            recommendations.push(`• Maintain consistent sleep schedule`);
          }
        }
        if (metric.name.toLowerCase().includes('heart rate')) {
          recommendations.push(`• Avoid stress triggers and practice deep breathing for tachycardia (${metric.value})`);
          recommendations.push(`• Monitor heart rate regularly throughout the day`);
          recommendations.push(`• Limit caffeine and alcohol consumption`);
          recommendations.push(`• Practice relaxation techniques: meditation, yoga, or tai chi`);
        }
        if (metric.name.toLowerCase().includes('blood sugar')) {
          if (metric.status.toLowerCase().includes('diabetic')) {
            recommendations.push(`• Check blood sugar 4 times daily for diabetic management (${metric.value})`);
            recommendations.push(`• Maintain consistent meal times and portion control`);
            recommendations.push(`• Keep glucose tablets or snacks available`);
            recommendations.push(`• Regular medical check-ups and medication adherence`);
          } else if (metric.status.toLowerCase().includes('pre-diabetic')) {
            recommendations.push(`• Monitor blood sugar weekly for pre-diabetic status (${metric.value})`);
            recommendations.push(`• Maintain regular meal schedule`);
            recommendations.push(`• Focus on stress reduction and adequate sleep`);
          }
        }
        if (metric.name.toLowerCase().includes('weight')) {
          if (metric.status.toLowerCase().includes('overweight') || metric.status.toLowerCase().includes('obese')) {
            recommendations.push(`• Track food intake and weight weekly for management (${metric.value}kg)`);
            recommendations.push(`• Set realistic weight loss goals (1-2 lbs per week)`);
            recommendations.push(`• Maintain consistent sleep schedule (7-9 hours)`);
            recommendations.push(`• Stay hydrated with 8-10 glasses of water daily`);
          } else if (metric.status.toLowerCase().includes('underweight')) {
            recommendations.push(`• Monitor weight gain progress weekly (${metric.value}kg)`);
            recommendations.push(`• Ensure adequate rest and recovery time`);
            recommendations.push(`• Focus on nutrient-dense foods and regular meals`);
          }
        }
      });
    } else {
      recommendations.push("• Maintain regular sleep schedule (7-9 hours nightly)");
      recommendations.push("• Practice stress management through relaxation techniques");
      recommendations.push("• Stay hydrated with 8-10 glasses of water daily");
      recommendations.push("• Regular medical check-ups and health monitoring");
    }

    return recommendations.join('\n');
  };

  // Generate specific goals based on health metrics
  const generateSpecificGoals = (metrics) => {
    const goals = [];
    
    metrics.forEach(metric => {
      if (metric.status.toLowerCase().includes('high') || metric.status.toLowerCase().includes('diabetic') || metric.status.toLowerCase().includes('critical') || metric.status.toLowerCase().includes('elevated') || metric.status.toLowerCase().includes('pre-high') || metric.status.toLowerCase().includes('tachycardia') || metric.status.toLowerCase().includes('overweight') || metric.status.toLowerCase().includes('obese') || metric.status.toLowerCase().includes('underweight')) {
        if (metric.name.toLowerCase().includes('blood pressure')) {
          if (metric.status.toLowerCase().includes('high')) {
            goals.push(`Reduce blood pressure from ${metric.value} to under 140/90 in 3 months`);
          } else if (metric.status.toLowerCase().includes('elevated') || metric.status.toLowerCase().includes('pre-high')) {
            goals.push(`Lower blood pressure from ${metric.value} to under 120/80 in 2 months`);
          }
        }
        if (metric.name.toLowerCase().includes('blood sugar')) {
          if (metric.status.toLowerCase().includes('diabetic')) {
            goals.push(`Lower blood sugar from ${metric.value} to under 126 mg/dL in 3 months`);
          } else if (metric.status.toLowerCase().includes('pre-diabetic')) {
            goals.push(`Reduce blood sugar from ${metric.value} to under 100 mg/dL in 2 months`);
          }
        }
        if (metric.name.toLowerCase().includes('heart rate')) {
          goals.push(`Reduce resting heart rate from ${metric.value} to under 100 bpm in 2 months`);
        }
        if (metric.name.toLowerCase().includes('weight')) {
          if (metric.status.toLowerCase().includes('overweight') || metric.status.toLowerCase().includes('obese')) {
            goals.push(`Lose 5-10% of current weight (${metric.value}kg) in 3 months`);
          } else if (metric.status.toLowerCase().includes('underweight')) {
            goals.push(`Gain healthy weight to reach normal BMI range from ${metric.value}kg in 3 months`);
          }
        }
      }
    });

    if (goals.length === 0) {
      goals.push("Maintain current healthy metrics", "Exercise 30 minutes daily", "Eat 5 servings of fruits/vegetables daily");
    }

    return goals.slice(0, 3); // Return maximum 3 goals
  };

  // Add new goal
  const addGoal = (newGoal) => {
    if (newGoal.trim()) {
      const updatedGoals = [...goals, newGoal.trim()];
      setGoals(updatedGoals);
      
      // Initialize progress for new goal
      setProgress(prev => ({
        ...prev,
        [updatedGoals.length - 1]: 0
      }));
      
      message.success('Goal added successfully!');
    }
  };

  // Update goal progress
  const updateProgress = (goalIndex, newProgress) => {
    setProgress(prev => ({
      ...prev,
      [goalIndex]: Math.min(100, Math.max(0, newProgress))
    }));
  };

  // Goal management functions
  const handleAddGoal = () => {
    setEditingGoal(null);
    form.resetFields();
    setGoalModalVisible(true);
  };

  const handleEditGoal = (goal, index) => {
    setEditingGoal({ goal, index });
    form.setFieldsValue({ goal });
    setGoalModalVisible(true);
  };

  const handleDeleteGoal = (index) => {
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
    
    // Update progress object
    const newProgress = {};
    newGoals.forEach((_, i) => {
      if (i < index) {
        newProgress[i] = progress[i] || 0;
      } else {
        newProgress[i] = progress[i + 1] || 0;
      }
    });
    setProgress(newProgress);
    
    message.success('Goal deleted successfully!');
  };

  const handleGoalSubmit = () => {
    form.validateFields().then(values => {
      if (editingGoal) {
        // Edit existing goal
        const newGoals = [...goals];
        newGoals[editingGoal.index] = values.goal;
        setGoals(newGoals);
        message.success('Goal updated successfully!');
      } else {
        // Add new goal
        const newGoals = [...goals, values.goal];
        setGoals(newGoals);
        
        // Initialize progress for new goal
        setProgress(prev => ({
          ...prev,
          [newGoals.length - 1]: 0
        }));
        
        message.success('Goal added successfully!');
      }
      
      setGoalModalVisible(false);
      form.resetFields();
    });
  };

  const getGoalStatus = (progress) => {
    if (progress === 0) return { status: 'Not Started', color: 'default' };
    if (progress < 25) return { status: 'Getting Started', color: 'orange' };
    if (progress < 50) return { status: 'In Progress', color: 'blue' };
    if (progress < 75) return { status: 'Almost There', color: 'purple' };
    if (progress < 100) return { status: 'Near Complete', color: 'green' };
    return { status: 'Completed', color: 'success' };
  };

  return (
    <div className="healthify-assistant">
      {/* Header */}
      <div className="healthify-header">
        <div className="header-content">
          <div className="header-icon">
            <RobotOutlined />
          </div>
          <div className="header-text">
            <Title level={3} className="header-title">Healthify AI Assistant</Title>
            <Text className="header-subtitle">Your personal health coach</Text>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<RobotOutlined />}
          onClick={analyzeHealthMetrics}
          loading={loading}
          className="analyze-button"
          size="large"
        >
          Analyze My Health
        </Button>
      </div>

      {/* Analysis Results */}
      {loading && (
        <div className="analysis-loading">
          <Spin size="large" />
          <div className="loading-text">Analyzing your health metrics...</div>
        </div>
      )}

      {!loading && (
        <div className="healthify-content">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              <BulbOutlined />
              Recommendations
            </button>
            <button 
              className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveTab('goals')}
            >
              <TrophyOutlined />
              Goals & Tracking
            </button>
          </div>

          {activeTab === 'recommendations' && (
            <div className="recommendations-section">
              {recommendations ? (
                <>
                  <Title level={4} className="section-title">Your Personalized Recommendations</Title>
                  
                  {/* AI Analysis Summary */}
                  <div className="analysis-summary">
                    <Title level={5} className="analysis-title">
                      <RobotOutlined /> AI Analysis Summary
                    </Title>
                    <div className="analyzed-metrics">
                      {healthMetrics.map((metric, index) => (
                        <div key={index} className="metric-analysis">
                          <div className="metric-name">{metric.name}</div>
                          <div className="metric-value" style={{ color: metric.color }}>
                            {metric.value}
                          </div>
                          <Tag 
                            color={metric.color === '#52c41a' ? 'green' : metric.color === '#faad14' ? 'orange' : 'red'}
                            className="metric-status"
                          >
                            {metric.status}
                          </Tag>
                        </div>
                      ))}
                    </div>
                    <Text className="analysis-note">
                      AI has analyzed your specific health metrics and provided personalized recommendations below.
                    </Text>
                  </div>
                  
                  <Row gutter={[16, 16]}>
                    {/* Diet Recommendation */}
                    <Col xs={24} md={8}>
                      <Card className="recommendation-card diet-card">
                        <div className="card-icon">
                          <AppleOutlined />
                        </div>
                        <div className="card-content">
                          <Title level={5} className="card-title">Diet</Title>
                          <Paragraph className="card-text">
                            {recommendations.diet || 'Eat a balanced diet with plenty of fruits and vegetables.'}
                          </Paragraph>
                        </div>
                      </Card>
                    </Col>

                    {/* Exercise Recommendation */}
                    <Col xs={24} md={8}>
                      <Card className="recommendation-card exercise-card">
                        <div className="card-icon">
                          <FireOutlined />
                        </div>
                        <div className="card-content">
                          <Title level={5} className="card-title">Exercise</Title>
                          <Paragraph className="card-text">
                            {recommendations.exercise || 'Engage in regular physical activity for at least 30 minutes daily.'}
                          </Paragraph>
                        </div>
                      </Card>
                    </Col>

                    {/* Lifestyle Recommendation */}
                    <Col xs={24} md={8}>
                      <Card className="recommendation-card lifestyle-card">
                        <div className="card-icon">
                          <BulbOutlined />
                        </div>
                        <div className="card-content">
                          <Title level={5} className="card-title">Lifestyle</Title>
                          <Paragraph className="card-text">
                            {recommendations.lifestyle || 'Maintain a healthy lifestyle with adequate sleep and stress management.'}
                          </Paragraph>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </>
              ) : (
                <div className="no-recommendations">
                  <Title level={4} className="section-title">Get Personalized Recommendations</Title>
                  <Text className="no-data-text">
                    Click "Analyze My Health" to get AI-powered recommendations based on your health metrics.
                  </Text>
                </div>
              )}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="goals-section">
              <div className="goals-header">
                <Title level={4} className="section-title">
                  <TrophyOutlined /> Your Health Goals
                </Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddGoal}
                  className="add-goal-button"
                >
                  Add Goal
                </Button>
              </div>

              {goals.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {goals.map((goal, index) => {
                    const goalStatus = getGoalStatus(progress[index] || 0);
                    return (
                      <Col xs={24} md={12} key={index}>
                        <Card className="goal-card">
                          <div className="goal-content">
                            <div className="goal-header">
                              <AimOutlined className="goal-icon" />
                              <div className="goal-info">
                                <Text className="goal-text">{goal}</Text>
                                <Tag color={goalStatus.color} className="goal-status-tag">
                                  {goalStatus.status}
                                </Tag>
                              </div>
                              <div className="goal-actions">
                                <Space>
                                  <Button 
                                    size="small" 
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditGoal(goal, index)}
                                  />
                                  <Button 
                                    size="small" 
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteGoal(index)}
                                    danger
                                  />
                                </Space>
                              </div>
                            </div>
                            
                            <div className="goal-progress">
                              <Progress 
                                percent={progress[index] || 0} 
                                strokeColor="#52c41a"
                                showInfo={true}
                                format={percent => `${percent}%`}
                              />
                            </div>
                            
                            <div className="goal-controls">
                              <Space>
                                <Button 
                                  size="small" 
                                  onClick={() => updateProgress(index, (progress[index] || 0) + 10)}
                                >
                                  +10%
                                </Button>
                                <Button 
                                  size="small" 
                                  onClick={() => updateProgress(index, (progress[index] || 0) - 10)}
                                >
                                  -10%
                                </Button>
                                <Button 
                                  size="small" 
                                  onClick={() => updateProgress(index, 100)}
                                  icon={<CheckCircleOutlined />}
                                >
                                  Complete
                                </Button>
                              </Space>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <div className="no-goals">
                  <div className="no-goals-content">
                    <TrophyOutlined className="no-goals-icon" />
                    <Title level={4}>No Goals Set Yet</Title>
                    <Text className="no-goals-text">
                      Start your health journey by setting personalized goals. Click "Add Goal" to begin!
                    </Text>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={handleAddGoal}
                      size="large"
                    >
                      Add Your First Goal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Health Metrics Summary */}
      {healthMetrics && healthMetrics.length > 0 && (
        <div className="metrics-summary">
          <Divider />
          <Title level={4} className="section-title">Current Health Status</Title>
          <Row gutter={[8, 8]}>
            {healthMetrics.map((metric, index) => (
              <Col xs={12} sm={6} key={index}>
                <div className="metric-summary">
                  <div className="metric-icon-small">
                    {metric.name === 'Blood Pressure' && <HeartOutlined />}
                    {metric.name === 'Heart Rate' && <ThunderboltOutlined />}
                    {metric.name === 'Blood Sugar' && <AppleOutlined />}
                    {metric.name === 'Weight' && <UserOutlined />}
                  </div>
                  <div className="metric-info">
                    <Text className="metric-name">{metric.name}</Text>
                    <Text className="metric-value" style={{ color: metric.color }}>
                      {metric.value}
                    </Text>
                    <Tag color={metric.color === '#52c41a' ? 'green' : metric.color === '#faad14' ? 'orange' : 'red'}>
                      {metric.status}
                    </Tag>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        title={editingGoal ? "Edit Goal" : "Add New Goal"}
        open={goalModalVisible}
        onOk={handleGoalSubmit}
        onCancel={() => {
          setGoalModalVisible(false);
          form.resetFields();
        }}
        okText={editingGoal ? "Update Goal" : "Add Goal"}
        cancelText="Cancel"
        className="goal-modal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="goal"
            label="Goal Description"
            rules={[
              { required: true, message: 'Please enter a goal description' },
              { min: 10, message: 'Goal description must be at least 10 characters' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter your health goal (e.g., 'Walk 30 minutes daily', 'Reduce blood pressure by 10 points', 'Lose 5 kg in 3 months')"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthifyAssistant;
