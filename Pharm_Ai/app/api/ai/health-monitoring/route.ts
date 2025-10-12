import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrCd7CjUyz6-dZ-TM06KoS-AWS0LF0iws')

interface HealthMonitoringRequest {
  patientId?: string
  vitalSigns?: {
    bloodPressure?: { systolic: number; diastolic: number }
    heartRate?: number
    temperature?: number
    bloodSugar?: number
    weight?: number
    height?: number
  }
  symptoms?: string[]
  medications?: string[]
  medicalHistory?: string[]
  age?: number
  gender?: string
}

interface HealthMonitoringResponse {
  success: boolean
  data?: {
    healthScore: number
    riskAssessment: {
      level: 'low' | 'medium' | 'high' | 'critical'
      factors: Array<{
        factor: string
        severity: 'low' | 'medium' | 'high'
        description: string
        recommendation: string
      }>
    }
    medicationAdherence: {
      score: number
      missedDoses: number
      recommendations: string[]
    }
    sideEffectMonitoring: Array<{
      medication: string
      potentialSideEffects: string[]
      severity: 'mild' | 'moderate' | 'severe'
      actionRequired: boolean
    }>
    healthRecommendations: Array<{
      category: 'lifestyle' | 'medication' | 'monitoring' | 'emergency'
      priority: 'low' | 'medium' | 'high'
      recommendation: string
      timeframe: string
    }>
    emergencyAlerts: Array<{
      type: 'immediate' | 'urgent' | 'warning'
      message: string
      action: string
    }>
    aiInsights: string
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<HealthMonitoringResponse>> {
  try {
    const body: HealthMonitoringRequest = await request.json()
    const { 
      patientId,
      vitalSigns,
      symptoms = [],
      medications = [],
      medicalHistory = [],
      age,
      gender
    } = body

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create AI context for health monitoring
    const aiContext = `You are an advanced AI health monitoring system for a pharmacy management platform. Your task is to analyze patient health data and provide comprehensive health insights, risk assessments, and recommendations.

IMPORTANT RULES:
- Always provide **crisp, clear responses** without confusion
- Use **bullet points** for easy reading
- **Bold important information** like critical alerts and recommendations
- Provide **specific health insights** based on data
- Include **confidence levels** for assessments
- Consider **medication interactions** and **side effects**
- Provide **actionable health recommendations**

Patient Data:
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}
- Vital Signs: ${vitalSigns ? JSON.stringify(vitalSigns) : 'Not provided'}
- Symptoms: ${symptoms.join(', ') || 'None reported'}
- Current Medications: ${medications.join(', ') || 'None'}
- Medical History: ${medicalHistory.join(', ') || 'None'}

Please provide comprehensive health monitoring analysis including:

## Health Score Assessment
- **Overall health score** (0-100) based on vital signs and symptoms
- **Risk level** (low/medium/high/critical) with specific factors
- **Health trend analysis** compared to previous readings

## Risk Factor Analysis
- **Cardiovascular risks** based on blood pressure and heart rate
- **Metabolic risks** based on blood sugar and weight
- **Medication-related risks** and interactions
- **Lifestyle risk factors** and recommendations

## Medication Management
- **Adherence score** and missed dose analysis
- **Side effect monitoring** for current medications
- **Drug interaction warnings** and recommendations
- **Dosage optimization** suggestions

## Health Recommendations
- **Immediate actions** required (if any)
- **Lifestyle modifications** for better health
- **Monitoring frequency** recommendations
- **Emergency protocols** and when to seek help

## AI Insights
- **Pattern recognition** in health data
- **Predictive health trends** and early warning signs
- **Personalized recommendations** based on patient profile
- **Health optimization** strategies

Format your response as:
## Health Assessment
[Overall health score and risk level with detailed analysis]

## Risk Factors
[Specific risk factors with severity levels and recommendations]

## Medication Management
[Adherence analysis and side effect monitoring]

## Recommendations
[Actionable health recommendations with priorities]

## Emergency Alerts
[Any immediate concerns requiring attention]

## AI Insights
[Key insights and strategic health recommendations]`

    // Generate AI response
    const result = await model.generateContent(aiContext)
    const response = await result.response
    const aiAnalysis = response.text()

    // Process AI response to extract structured data
    const processedData = processHealthMonitoring(aiAnalysis, vitalSigns, symptoms, medications, age)

    return NextResponse.json({
      success: true,
      data: processedData
    })

  } catch (error) {
    console.error('Health Monitoring Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze health data' 
    }, { status: 500 })
  }
}

// Helper function to process health monitoring data
function processHealthMonitoring(
  aiResponse: string, 
  vitalSigns: any, 
  symptoms: string[], 
  medications: string[], 
  age?: number
): any {
  // Calculate health score based on vital signs
  const healthScore = calculateHealthScore(vitalSigns, symptoms, age)
  
  // Assess risk level
  const riskLevel = assessRiskLevel(vitalSigns, symptoms, age)
  
  // Generate risk factors
  const riskFactors = generateRiskFactors(vitalSigns, symptoms, age)
  
  // Medication adherence simulation
  const medicationAdherence = {
    score: 85 + Math.random() * 10,
    missedDoses: Math.floor(Math.random() * 3),
    recommendations: [
      'Take medications at the same time daily',
      'Set reminders for medication times',
      'Use pill organizers for better adherence'
    ]
  }
  
  // Side effect monitoring
  const sideEffectMonitoring = medications.map(med => ({
    medication: med,
    potentialSideEffects: getSideEffects(med),
    severity: 'mild' as const,
    actionRequired: false
  }))
  
  // Health recommendations
  const healthRecommendations = generateHealthRecommendations(vitalSigns, symptoms, age)
  
  // Emergency alerts
  const emergencyAlerts = generateEmergencyAlerts(vitalSigns, symptoms)
  
  return {
    healthScore,
    riskAssessment: {
      level: riskLevel,
      factors: riskFactors
    },
    medicationAdherence,
    sideEffectMonitoring,
    healthRecommendations,
    emergencyAlerts,
    aiInsights: aiResponse
  }
}

// Helper functions
function calculateHealthScore(vitalSigns: any, symptoms: string[], age?: number): number {
  let score = 100
  
  // Deduct points for abnormal vital signs
  if (vitalSigns?.bloodPressure) {
    const { systolic, diastolic } = vitalSigns.bloodPressure
    if (systolic > 140 || diastolic > 90) score -= 20
    else if (systolic > 120 || diastolic > 80) score -= 10
  }
  
  if (vitalSigns?.heartRate) {
    const hr = vitalSigns.heartRate
    if (hr > 100 || hr < 60) score -= 15
  }
  
  if (vitalSigns?.temperature) {
    const temp = vitalSigns.temperature
    if (temp > 37.5 || temp < 36) score -= 10
  }
  
  if (vitalSigns?.bloodSugar) {
    const bs = vitalSigns.bloodSugar
    if (bs > 140 || bs < 70) score -= 15
  }
  
  // Deduct points for symptoms
  score -= symptoms.length * 5
  
  // Age factor
  if (age && age > 65) score -= 5
  
  return Math.max(0, Math.min(100, score))
}

function assessRiskLevel(vitalSigns: any, symptoms: string[], age?: number): 'low' | 'medium' | 'high' | 'critical' {
  const healthScore = calculateHealthScore(vitalSigns, symptoms, age)
  
  if (healthScore >= 90) return 'low'
  if (healthScore >= 75) return 'medium'
  if (healthScore >= 50) return 'high'
  return 'critical'
}

function generateRiskFactors(vitalSigns: any, symptoms: string[], age?: number): Array<{
  factor: string
  severity: 'low' | 'medium' | 'high'
  description: string
  recommendation: string
}> {
  const factors = []
  
  if (vitalSigns?.bloodPressure) {
    const { systolic, diastolic } = vitalSigns.bloodPressure
    if (systolic > 140 || diastolic > 90) {
      factors.push({
        factor: 'Hypertension',
        severity: 'high' as const,
        description: 'Blood pressure is above normal range',
        recommendation: 'Consult doctor immediately and monitor blood pressure daily'
      })
    }
  }
  
  if (vitalSigns?.bloodSugar && vitalSigns.bloodSugar > 140) {
    factors.push({
      factor: 'High Blood Sugar',
      severity: 'high' as const,
      description: 'Blood sugar levels are elevated',
      recommendation: 'Monitor blood sugar regularly and follow diabetic diet'
    })
  }
  
  if (symptoms.length > 3) {
    factors.push({
      factor: 'Multiple Symptoms',
      severity: 'medium' as const,
      description: 'Multiple symptoms reported',
      recommendation: 'Schedule comprehensive health checkup'
    })
  }
  
  return factors
}

function getSideEffects(medication: string): string[] {
  const sideEffectsMap: { [key: string]: string[] } = {
    'Paracetamol': ['Nausea', 'Stomach upset'],
    'Ibuprofen': ['Stomach irritation', 'Dizziness'],
    'Metformin': ['Nausea', 'Diarrhea', 'Metallic taste'],
    'Aspirin': ['Stomach irritation', 'Bleeding risk']
  }
  
  return sideEffectsMap[medication] || ['Monitor for any unusual symptoms']
}

function generateHealthRecommendations(vitalSigns: any, symptoms: string[], age?: number): Array<{
  category: 'lifestyle' | 'medication' | 'monitoring' | 'emergency'
  priority: 'low' | 'medium' | 'high'
  recommendation: string
  timeframe: string
}> {
  const recommendations = []
  
  if (vitalSigns?.bloodPressure && vitalSigns.bloodPressure.systolic > 120) {
    recommendations.push({
      category: 'lifestyle' as const,
      priority: 'high' as const,
      recommendation: 'Reduce sodium intake and increase physical activity',
      timeframe: 'Immediate'
    })
  }
  
  if (symptoms.length > 0) {
    recommendations.push({
      category: 'monitoring' as const,
      priority: 'medium' as const,
      recommendation: 'Track symptoms daily and note any changes',
      timeframe: 'Ongoing'
    })
  }
  
  recommendations.push({
    category: 'lifestyle' as const,
    priority: 'medium' as const,
    recommendation: 'Maintain regular sleep schedule and stress management',
    timeframe: 'Daily'
  })
  
  return recommendations
}

function generateEmergencyAlerts(vitalSigns: any, symptoms: string[]): Array<{
  type: 'immediate' | 'urgent' | 'warning'
  message: string
  action: string
}> {
  const alerts = []
  
  if (vitalSigns?.bloodPressure && vitalSigns.bloodPressure.systolic > 180) {
    alerts.push({
      type: 'immediate' as const,
      message: 'Severe hypertension detected',
      action: 'Seek emergency medical attention immediately'
    })
  }
  
  if (vitalSigns?.temperature && vitalSigns.temperature > 39) {
    alerts.push({
      type: 'urgent' as const,
      message: 'High fever detected',
      action: 'Contact healthcare provider and monitor temperature'
    })
  }
  
  return alerts
}
