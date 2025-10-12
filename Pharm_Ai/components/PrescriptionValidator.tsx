'use client'

import React, { useState } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Pill, 
  Plus, 
  Trash2,
  Shield,
  Heart,
  Zap
} from 'lucide-react'

interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration?: string
}

interface ValidationResult {
  isValid: boolean
  warnings: Array<{
    type: 'critical' | 'warning' | 'caution'
    title: string
    message: string
    medicines: string[]
    severity: 'high' | 'medium' | 'low'
    action: string
  }>
  sideEffects: Array<{
    medicine: string
    sideEffects: string[]
    warning: string
  }>
  recommendations: string[]
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
}

export default function PrescriptionValidator() {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ])
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    allergies: '',
    medicalConditions: ''
  })
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = medicines.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    )
    setMedicines(updated)
  }

  const validatePrescription = async () => {
    const validMedicines = medicines.filter(med => med.name.trim())
    if (validMedicines.length === 0) {
      alert('Please add at least one medicine')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/prescription/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicines: validMedicines,
          patientInfo: {
            age: patientInfo.age ? parseInt(patientInfo.age) : undefined,
            gender: patientInfo.gender || undefined,
            allergies: patientInfo.allergies ? patientInfo.allergies.split(',').map(a => a.trim()) : [],
            medicalConditions: patientInfo.medicalConditions ? patientInfo.medicalConditions.split(',').map(c => c.trim()) : []
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        setValidationResult(data.data)
      } else {
        alert('Validation failed: ' + data.error)
      }
    } catch (error) {
      console.error('Validation error:', error)
      alert('Failed to validate prescription')
    }
    setLoading(false)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getWarningIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'caution': return <Shield className="w-5 h-5 text-yellow-600" />
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚨 AI Prescription Validator
          </h1>
          <p className="text-gray-600">
            Advanced AI-powered drug interaction and side effect analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prescription Input */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Prescription Details</h2>
            
            {/* Patient Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientInfo.age}
                    onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={patientInfo.gender}
                    onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <input
                    type="text"
                    value={patientInfo.allergies}
                    onChange={(e) => setPatientInfo({...patientInfo, allergies: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Penicillin, Aspirin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                  <input
                    type="text"
                    value={patientInfo.medicalConditions}
                    onChange={(e) => setPatientInfo({...patientInfo, medicalConditions: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Diabetes, Hypertension"
                  />
                </div>
              </div>
            </div>

            {/* Medicines */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Medicines</h3>
                <button
                  onClick={addMedicine}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-4">
                {medicines.map((medicine, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">Medicine {index + 1}</h4>
                      {medicines.length > 1 && (
                        <button
                          onClick={() => removeMedicine(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                        <input
                          type="text"
                          value={medicine.name}
                          onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Warfarin, Aspirin"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                        <input
                          type="text"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 5mg, 100mg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <input
                          type="text"
                          value={medicine.frequency}
                          onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Once daily, Twice daily"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input
                          type="text"
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 7 days, 30 days"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validate Button */}
            <button
              onClick={validatePrescription}
              disabled={loading}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Validate Prescription</span>
                </>
              )}
            </button>
          </div>

          {/* Validation Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Validation Results</h2>
            
            {!validationResult ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Enter prescription details and click validate to see AI analysis</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Risk */}
                <div className={`p-4 rounded-lg border-l-4 ${
                  validationResult.overallRisk === 'critical' ? 'bg-red-50 border-red-500' :
                  validationResult.overallRisk === 'high' ? 'bg-orange-50 border-orange-500' :
                  validationResult.overallRisk === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-green-50 border-green-500'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    {validationResult.overallRisk === 'critical' ? <XCircle className="w-6 h-6 text-red-600" /> :
                     validationResult.overallRisk === 'high' ? <AlertTriangle className="w-6 h-6 text-orange-600" /> :
                     validationResult.overallRisk === 'medium' ? <AlertTriangle className="w-6 h-6 text-yellow-600" /> :
                     <CheckCircle className="w-6 h-6 text-green-600" />}
                    <h3 className="text-lg font-semibold text-gray-900">
                      Overall Risk: {validationResult.overallRisk.toUpperCase()}
                    </h3>
                  </div>
                  <p className="text-gray-700">
                    {validationResult.isValid ? 
                      '✅ Prescription is safe to dispense' : 
                      '🚨 Prescription has critical issues - DO NOT DISPENSE'
                    }
                  </p>
                </div>

                {/* Critical Warnings */}
                {validationResult.warnings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Drug Interaction Warnings</h3>
                    <div className="space-y-3">
                      {validationResult.warnings.map((warning, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          warning.type === 'critical' ? 'bg-red-50 border-red-200' :
                          warning.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                          'bg-yellow-50 border-yellow-200'
                        }`}>
                          <div className="flex items-start space-x-3">
                            {getWarningIcon(warning.type)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{warning.title}</h4>
                              <p className="text-gray-700 mb-2">{warning.message}</p>
                              <div className="flex items-center space-x-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(warning.severity)}`}>
                                  {warning.severity} severity
                                </span>
                                <span className="text-sm text-gray-600">
                                  Medicines: {warning.medicines.join(', ')}
                                </span>
                              </div>
                              <div className="mt-2 p-2 bg-white rounded border-l-2 border-blue-500">
                                <p className="text-sm font-medium text-blue-800">Action Required:</p>
                                <p className="text-sm text-blue-700">{warning.action}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side Effect Warnings */}
                {validationResult.sideEffects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Side Effect Warnings</h3>
                    <div className="space-y-3">
                      {validationResult.sideEffects.map((sideEffect, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <Pill className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{sideEffect.medicine}</h4>
                              <p className="text-sm text-blue-800 mb-2">{sideEffect.warning}</p>
                              <div className="text-sm text-gray-600">
                                <p className="font-medium mb-1">Common side effects:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {sideEffect.sideEffects.map((effect, i) => (
                                    <li key={i}>{effect}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {validationResult.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-2">
                      {validationResult.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Test Examples */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🧪 Test Examples for Drug Interactions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-red-600 mb-2">Critical Interaction Test:</h4>
              <p className="text-sm text-gray-700 mb-2">Try these combinations to see critical warnings:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Warfarin + Aspirin</strong> - Severe bleeding risk</li>
                <li>• <strong>Warfarin + Ibuprofen</strong> - Bleeding risk</li>
                <li>• <strong>Metformin + Contrast Agent</strong> - Lactic acidosis</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-orange-600 mb-2">Warning Interaction Test:</h4>
              <p className="text-sm text-gray-700 mb-2">Try these for warning alerts:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Aspirin + Ibuprofen</strong> - Reduced cardioprotection</li>
                <li>• <strong>Paracetamol + Warfarin</strong> - Increased bleeding risk</li>
                <li>• <strong>Digoxin + Furosemide</strong> - Digoxin toxicity risk</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
