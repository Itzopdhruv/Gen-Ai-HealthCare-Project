'use client'

import React from 'react'
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Shield, 
  MessageCircle,
  FileText,
  Package,
  BarChart3,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

export default function AIFeaturesGuide() {
  const features = [
    {
      id: 'ai-dashboard',
      title: 'AI Analytics Dashboard',
      description: 'Complete AI insights and analytics',
      icon: BarChart3,
      url: '/ai-analytics',
      color: 'bg-blue-500',
      features: [
        'Predictive Analytics',
        'Health Monitoring',
        'Drug Interactions',
        'Business Insights'
      ]
    },
    {
      id: 'ai-doctor',
      title: 'AI Doctor Chatbot',
      description: 'Interactive medical assistant',
      icon: MessageCircle,
      url: '#chatbot',
      color: 'bg-green-500',
      features: [
        'Medical Questions',
        'Health Advice',
        'Medicine Information',
        'Prescription Analysis'
      ]
    },
    {
      id: 'prescription',
      title: 'Prescription Processing',
      description: 'OCR-powered prescription scanning',
      icon: FileText,
      url: '/prescriptions',
      color: 'bg-purple-500',
      features: [
        'Image Upload',
        'Text Extraction',
        'Medicine Identification',
        'Alternative Suggestions'
      ]
    },
    {
      id: 'inventory',
      title: 'Smart Inventory',
      description: 'AI-powered inventory management',
      icon: Package,
      url: '/inventory',
      color: 'bg-orange-500',
      features: [
        'Stock Tracking',
        'Demand Forecasting',
        'Low Stock Alerts',
        'Medicine Alternatives'
      ]
    }
  ]

  const aiApis = [
    {
      name: 'Predictive Analytics',
      endpoint: '/api/ai/predictive-analytics',
      description: 'Demand forecasting and business optimization',
      method: 'POST'
    },
    {
      name: 'Health Monitoring',
      endpoint: '/api/ai/health-monitoring',
      description: 'Real-time health assessment and monitoring',
      method: 'POST'
    },
    {
      name: 'Drug Interactions',
      endpoint: '/api/ai/drug-interactions',
      description: 'Advanced drug interaction analysis',
      method: 'POST'
    },
    {
      name: 'AI Chat',
      endpoint: '/api/ai/chat',
      description: 'Interactive medical assistant',
      method: 'POST'
    },
    {
      name: 'Medicine Alternatives',
      endpoint: '/api/medicines/alternatives',
      description: 'AI-powered alternative suggestions',
      method: 'POST'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI Features Access Guide
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Complete guide to accessing all AI-powered features
          </p>
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
            <p className="text-blue-800 font-semibold">
              🌐 Your website is running on: <span className="font-mono bg-blue-200 px-2 py-1 rounded">http://localhost:3003</span>
            </p>
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Main AI Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`${feature.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {feature.features.map((feat, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {feature.url === '#chatbot' ? 'Click chat button' : `Navigate to ${feature.url}`}
                    </div>
                    {feature.url !== '#chatbot' && (
                      <a
                        href={feature.url}
                        className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span>Access</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Access Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/ai-analytics"
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              <BarChart3 className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">AI Analytics</h3>
              <p className="text-sm opacity-90">Complete AI dashboard</p>
            </a>

            <a
              href="/prescriptions"
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <FileText className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">Prescriptions</h3>
              <p className="text-sm opacity-90">OCR processing</p>
            </a>

            <a
              href="/inventory"
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
            >
              <Package className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">Inventory</h3>
              <p className="text-sm opacity-90">Smart management</p>
            </a>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
              <MessageCircle className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">AI Doctor</h3>
              <p className="text-sm opacity-90">Click chat button</p>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 AI API Endpoints</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Available AI APIs</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {aiApis.map((api, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{api.name}</h4>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      {api.method}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {api.endpoint}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Demo Instructions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">1. AI Analytics Dashboard</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Go to <code className="bg-gray-200 px-1 rounded">/ai-analytics</code></li>
                <li>2. Click on different tabs (Predictive, Health, Interactions)</li>
                <li>3. View real-time AI analysis and insights</li>
                <li>4. See demand forecasting and risk assessments</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">2. AI Doctor Chatbot</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Look for chat button in bottom-right corner</li>
                <li>2. Ask medical questions like "What are side effects of Paracetamol?"</li>
                <li>3. Get AI-powered health advice and medicine information</li>
                <li>4. Try prescription analysis questions</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">3. Prescription Processing</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Navigate to Prescriptions section</li>
                <li>2. Upload a prescription image</li>
                <li>3. See OCR text extraction</li>
                <li>4. Get medicine alternatives and stock status</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">4. Medicine Alternatives</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Go to Inventory section</li>
                <li>2. Search for medicines like "Dolo-650"</li>
                <li>3. See AI-powered alternative suggestions</li>
                <li>4. Check stock availability and manager alerts</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">🏆 Ready for Hackathon Demo!</h3>
          <p className="text-gray-600">
            All AI features are now accessible and ready to impress the judges
          </p>
        </div>
      </div>
    </div>
  )
}
