'use client'

import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Shield, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Zap,
  Target
} from 'lucide-react'

interface PredictiveAnalytics {
  demandForecast: Array<{
    date: string
    predictedDemand: number
    confidence: number
    factors: string[]
  }>
  riskFactors: Array<{
    factor: string
    impact: 'low' | 'medium' | 'high'
    description: string
    mitigation: string
  }>
  recommendations: Array<{
    type: 'stock' | 'pricing' | 'marketing' | 'safety'
    priority: 'low' | 'medium' | 'high'
    action: string
    expectedImpact: string
  }>
  seasonalTrends: Array<{
    season: string
    expectedDemand: number
    commonConditions: string[]
    recommendedStock: number
  }>
}

interface HealthMonitoring {
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
  emergencyAlerts: Array<{
    type: 'immediate' | 'urgent' | 'warning'
    message: string
    action: string
  }>
}

interface DrugInteractions {
  interactions: Array<{
    medication1: string
    medication2: string
    severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
    description: string
    management: string
  }>
  safetyScore: number
  recommendations: Array<{
    type: 'dosing' | 'timing' | 'monitoring' | 'alternative'
    priority: 'low' | 'medium' | 'high'
    recommendation: string
  }>
}

export default function AIAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'predictive' | 'health' | 'interactions' | 'overview'>('overview')
  const [predictiveData, setPredictiveData] = useState<PredictiveAnalytics | null>(null)
  const [healthData, setHealthData] = useState<HealthMonitoring | null>(null)
  const [interactionData, setInteractionData] = useState<DrugInteractions | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPredictiveAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/predictive-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeRange: '30d',
          category: 'all',
          patientDemographics: {
            ageGroup: 'adult',
            gender: 'all',
            region: 'urban'
          }
        })
      })
      const data = await response.json()
      if (data.success) {
        setPredictiveData(data.data)
      }
    } catch (error) {
      console.error('Error fetching predictive analytics:', error)
    }
    setLoading(false)
  }

  const fetchHealthMonitoring = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/health-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vitalSigns: {
            bloodPressure: { systolic: 130, diastolic: 85 },
            heartRate: 75,
            temperature: 36.5,
            bloodSugar: 95
          },
          symptoms: ['fatigue', 'headache'],
          medications: ['Paracetamol', 'Metformin'],
          age: 45,
          gender: 'male'
        })
      })
      const data = await response.json()
      if (data.success) {
        setHealthData(data.data)
      }
    } catch (error) {
      console.error('Error fetching health monitoring:', error)
    }
    setLoading(false)
  }

  const fetchDrugInteractions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/drug-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications: ['Paracetamol', 'Ibuprofen', 'Metformin'],
          patientProfile: {
            age: 45,
            gender: 'male',
            medicalConditions: ['diabetes', 'hypertension'],
            allergies: ['penicillin']
          }
        })
      })
      const data = await response.json()
      if (data.success) {
        setInteractionData(data.data)
      }
    } catch (error) {
      console.error('Error fetching drug interactions:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'predictive') fetchPredictiveAnalytics()
    if (activeTab === 'health') fetchHealthMonitoring()
    if (activeTab === 'interactions') fetchDrugInteractions()
  }, [activeTab])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'text-blue-600 bg-blue-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'major': return 'text-orange-600 bg-orange-100'
      case 'contraindicated': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 AI-Powered Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Advanced AI analytics for pharmacy management and patient care
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'predictive', label: 'Predictive Analytics', icon: TrendingUp },
                { id: 'health', label: 'Health Monitoring', icon: Heart },
                { id: 'interactions', label: 'Drug Interactions', icon: Shield }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading AI analysis...</span>
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎯 AI Features Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Predictive Analytics Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">Predictive Analytics</h3>
                  </div>
                  <p className="text-blue-700 mb-4">
                    AI-powered demand forecasting, seasonal trend analysis, and business optimization recommendations.
                  </p>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Medicine demand prediction</li>
                    <li>• Seasonal illness forecasting</li>
                    <li>• Inventory optimization</li>
                    <li>• Risk factor analysis</li>
                  </ul>
                  <button
                    onClick={() => setActiveTab('predictive')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Analytics
                  </button>
                </div>

                {/* Health Monitoring Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Health Monitoring</h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    Real-time health assessment, medication adherence tracking, and personalized health recommendations.
                  </p>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Vital signs analysis</li>
                    <li>• Medication adherence</li>
                    <li>• Side effect monitoring</li>
                    <li>• Emergency alerts</li>
                  </ul>
                  <button
                    onClick={() => setActiveTab('health')}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Monitoring
                  </button>
                </div>

                {/* Drug Interactions Card */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">Drug Interactions</h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    Advanced drug interaction analysis, contraindication checking, and safety recommendations.
                  </p>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li>• Interaction severity analysis</li>
                    <li>• Contraindication checking</li>
                    <li>• Safety scoring</li>
                    <li>• Management strategies</li>
                  </ul>
                  <button
                    onClick={() => setActiveTab('interactions')}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View Interactions
                  </button>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🚀 Key Benefits for Hackathon Success
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">For Patients:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Personalized medicine recommendations</li>
                      <li>• Real-time health monitoring</li>
                      <li>• Drug interaction warnings</li>
                      <li>• Medication adherence tracking</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">For Pharmacists:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• AI-powered inventory management</li>
                      <li>• Predictive demand forecasting</li>
                      <li>• Automated safety checks</li>
                      <li>• Clinical decision support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'predictive' && predictiveData && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📈 Predictive Analytics Dashboard
              </h2>
              
              {/* Demand Forecast */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Demand Forecast (Next 7 Days)</h3>
                <div className="grid grid-cols-7 gap-4">
                  {predictiveData.demandForecast.slice(0, 7).map((forecast, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600">{forecast.date}</div>
                        <div className="text-lg font-bold text-blue-600">{forecast.predictedDemand}</div>
                        <div className="text-xs text-gray-500">{forecast.confidence}% confidence</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Risk Factors</h3>
                <div className="space-y-3">
                  {predictiveData.riskFactors.map((risk, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{risk.factor}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.impact)}`}>
                          {risk.impact} impact
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{risk.description}</p>
                      <p className="text-sm text-blue-600"><strong>Mitigation:</strong> {risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4">AI Recommendations</h3>
                <div className="space-y-3">
                  {predictiveData.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{rec.action}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.priority)}`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-600">{rec.expectedImpact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'health' && healthData && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ❤️ Health Monitoring Dashboard
              </h2>
              
              {/* Health Score */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Overall Health Score</h3>
                  <div className="text-3xl font-bold text-green-600">{healthData.healthScore}/100</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${healthData.healthScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Risk Assessment</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(healthData.riskAssessment.level)}`}>
                    {healthData.riskAssessment.level} risk
                  </span>
                </div>
                <div className="space-y-3">
                  {healthData.riskAssessment.factors.map((factor, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{factor.factor}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(factor.severity)}`}>
                          {factor.severity} severity
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{factor.description}</p>
                      <p className="text-sm text-blue-600"><strong>Recommendation:</strong> {factor.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medication Adherence */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Medication Adherence</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-blue-600">{healthData.medicationAdherence.score}%</div>
                    <div className="text-sm text-gray-600">Adherence Score</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-orange-600">{healthData.medicationAdherence.missedDoses}</div>
                    <div className="text-sm text-gray-600">Missed Doses</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {healthData.medicationAdherence.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-600">• {rec}</div>
                  ))}
                </div>
              </div>

              {/* Emergency Alerts */}
              {healthData.emergencyAlerts.length > 0 && (
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Emergency Alerts</h3>
                  <div className="space-y-3">
                    {healthData.emergencyAlerts.map((alert, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(alert.type)}`}>
                            {alert.type}
                          </span>
                        </div>
                        <p className="text-gray-800 mb-2">{alert.message}</p>
                        <p className="text-sm text-red-600"><strong>Action:</strong> {alert.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'interactions' && interactionData && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🛡️ Drug Interaction Analysis
              </h2>
              
              {/* Safety Score */}
              <div className="bg-gradient-to-r from-green-50 to-red-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Safety Score</h3>
                  <div className="text-3xl font-bold text-green-600">{interactionData.safetyScore}/100</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${interactionData.safetyScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Drug Interactions */}
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Drug Interactions</h3>
                <div className="space-y-3">
                  {interactionData.interactions.map((interaction, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {interaction.medication1} + {interaction.medication2}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(interaction.severity)}`}>
                          {interaction.severity}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{interaction.description}</p>
                      <p className="text-sm text-blue-600"><strong>Management:</strong> {interaction.management}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Safety Recommendations</h3>
                <div className="space-y-3">
                  {interactionData.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{rec.recommendation}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.priority)}`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Type: {rec.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
