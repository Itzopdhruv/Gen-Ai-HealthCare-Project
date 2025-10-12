import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrCd7CjUyz6-dZ-TM06KoS-AWS0LF0iws')

interface PrescriptionValidationRequest {
  medicines: Array<{
    name: string
    dosage: string
    frequency: string
    duration?: string
  }>
  patientInfo?: {
    age?: number
    gender?: string
    allergies?: string[]
    medicalConditions?: string[]
  }
}

interface PrescriptionValidationResponse {
  success: boolean
  data?: {
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
    aiAnalysis: string
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<PrescriptionValidationResponse>> {
  try {
    const body: PrescriptionValidationRequest = await request.json()
    const { medicines, patientInfo } = body

    if (!medicines || medicines.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Medicines list is required' 
      }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create AI context for prescription validation
    const aiContext = `You are an advanced AI prescription validation system for a pharmacy management platform. Your task is to analyze prescription combinations and provide critical warnings about drug interactions and side effects.

IMPORTANT RULES:
- Always provide **crisp, clear responses** without confusion
- Use **bullet points** for easy reading
- **Bold critical warnings** and dangerous interactions
- Provide **specific medical warnings** based on evidence
- Include **immediate action required** for critical cases
- Consider **patient-specific factors** like age, allergies, conditions
- Provide **one-line side effect warnings** for each medicine

Prescription Analysis:
- Medicines: ${medicines.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ')}
- Patient Age: ${patientInfo?.age || 'Not specified'}
- Patient Gender: ${patientInfo?.gender || 'Not specified'}
- Allergies: ${patientInfo?.allergies?.join(', ') || 'None'}
- Medical Conditions: ${patientInfo?.medicalConditions?.join(', ') || 'None'}

Please provide comprehensive prescription validation including:

## Critical Drug Interactions
- **Severe interactions** that can cause life-threatening conditions
- **Moderate interactions** that require monitoring
- **Minor interactions** with precautions needed
- **Specific warnings** for each interaction pair

## Side Effect Warnings
- **One-line warning** for each medicine
- **Most common side effects** to watch for
- **Severity levels** and when to seek help
- **Patient-specific warnings** based on age/conditions

## Risk Assessment
- **Overall prescription risk** (low/medium/high/critical)
- **Specific risk factors** identified
- **Monitoring requirements** if prescription is approved
- **Alternative recommendations** if needed

## Action Items
- **Immediate actions** required for critical cases
- **Monitoring requirements** for moderate cases
- **Patient counseling** points for pharmacist
- **Follow-up requirements** and timelines

Format your response as:
## Critical Warnings
[Any critical drug interactions or contraindications]

## Side Effect Warnings
[One-line warnings for each medicine]

## Risk Assessment
[Overall risk level and specific factors]

## Recommendations
[Action items and monitoring requirements]`

    // Generate AI response
    const result = await model.generateContent(aiContext)
    const response = await result.response
    const aiAnalysis = response.text()

    // Process AI response and generate structured warnings
    const processedData = processPrescriptionValidation(aiAnalysis, medicines, patientInfo)

    console.log('📊 Prescription validation complete:', {
      warnings: processedData.warnings.length,
      overallRisk: processedData.overallRisk,
      isValid: processedData.isValid
    })

    return NextResponse.json({
      success: true,
      data: processedData
    })

  } catch (error) {
    console.error('Prescription Validation Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to validate prescription' 
    }, { status: 500 })
  }
}

// Helper function to process prescription validation
function processPrescriptionValidation(
  aiResponse: string, 
  medicines: any[], 
  patientInfo: any
): any {
  // Check for critical drug interactions
  const warnings = checkCriticalInteractions(medicines)
  
  // Generate side effect warnings
  const sideEffects = generateSideEffectWarnings(medicines)
  
  // Assess overall risk
  const overallRisk = assessOverallRisk(warnings, sideEffects)
  
  // Generate recommendations
  const recommendations = generateRecommendations(warnings, sideEffects, patientInfo)
  
  return {
    isValid: warnings.filter(w => w.type === 'critical').length === 0,
    warnings,
    sideEffects,
    recommendations,
    overallRisk,
    aiAnalysis: aiResponse
  }
}

// Helper functions for drug interaction checking
function checkCriticalInteractions(medicines: any[]): Array<{
  type: 'critical' | 'warning' | 'caution'
  title: string
  message: string
  medicines: string[]
  severity: 'high' | 'medium' | 'low'
  action: string
}> {
  const warnings = []
  const medicineNames = medicines.map(m => m.name.toLowerCase())
  
  console.log('🔍 Checking drug interactions for medicines:', medicineNames)
  
  // Critical drug interactions database
  const criticalInteractions = [
    {
      medicines: ['warfarin', 'aspirin'],
      type: 'critical' as const,
      title: 'CRITICAL: Severe Bleeding Risk',
      message: 'Warfarin + Aspirin combination significantly increases bleeding risk and can cause life-threatening hemorrhage',
      severity: 'high' as const,
      action: 'DO NOT DISPENSE - Contact prescribing doctor immediately'
    },
    {
      medicines: ['warfarin', 'ibuprofen'],
      type: 'critical' as const,
      title: 'CRITICAL: Bleeding Risk',
      message: 'Warfarin + Ibuprofen increases bleeding risk and can cause severe gastrointestinal bleeding',
      severity: 'high' as const,
      action: 'DO NOT DISPENSE - Contact prescribing doctor immediately'
    },
    {
      medicines: ['metformin', 'contrast'],
      type: 'critical' as const,
      title: 'CRITICAL: Lactic Acidosis Risk',
      message: 'Metformin + Contrast agents can cause lactic acidosis and kidney failure',
      severity: 'high' as const,
      action: 'DO NOT DISPENSE - Contact prescribing doctor immediately'
    },
    {
      medicines: ['aspirin', 'ibuprofen'],
      type: 'warning' as const,
      title: 'WARNING: Reduced Cardioprotection',
      message: 'Ibuprofen reduces aspirin\'s cardioprotective effect and may increase heart attack risk',
      severity: 'medium' as const,
      action: 'Dispense with caution - Advise patient to take aspirin 2 hours before ibuprofen'
    },
    {
      medicines: ['paracetamol', 'warfarin'],
      type: 'warning' as const,
      title: 'WARNING: Increased Bleeding Risk',
      message: 'Paracetamol may enhance warfarin\'s anticoagulant effect and increase bleeding risk',
      severity: 'medium' as const,
      action: 'Monitor INR levels closely - Consider dose adjustment'
    },
    {
      medicines: ['digoxin', 'furosemide'],
      type: 'warning' as const,
      title: 'WARNING: Digoxin Toxicity Risk',
      message: 'Furosemide can increase digoxin levels and cause digoxin toxicity',
      severity: 'medium' as const,
      action: 'Monitor digoxin levels and symptoms of toxicity'
    },
    {
      medicines: ['phenytoin', 'warfarin'],
      type: 'caution' as const,
      title: 'CAUTION: Altered Anticoagulation',
      message: 'Phenytoin may decrease warfarin effectiveness and increase clotting risk',
      severity: 'low' as const,
      action: 'Monitor INR levels and adjust warfarin dose as needed'
    }
  ]
  
  // Check for interactions
  for (const interaction of criticalInteractions) {
    const hasInteraction = interaction.medicines.every(med => 
      medicineNames.some(name => name.includes(med) || med.includes(name))
    )
    
    console.log(`  Checking interaction: ${interaction.medicines.join(' + ')} - Found: ${hasInteraction}`)
    
    if (hasInteraction) {
      console.log(`  ✅ INTERACTION DETECTED: ${interaction.title}`)
      warnings.push({
        ...interaction,
        medicines: interaction.medicines
      })
    }
  }
  
  console.log(`🔍 Total warnings found: ${warnings.length}`)
  
  return warnings
}

function generateSideEffectWarnings(medicines: any[]): Array<{
  medicine: string
  sideEffects: string[]
  warning: string
}> {
  const sideEffectMap: { [key: string]: { sideEffects: string[], warning: string } } = {
    'warfarin': {
      sideEffects: ['Bleeding', 'Bruising', 'Nausea'],
      warning: '⚠️ WARFARIN: Monitor for bleeding, avoid alcohol, regular INR checks required'
    },
    'aspirin': {
      sideEffects: ['Stomach irritation', 'Bleeding risk', 'Nausea'],
      warning: '⚠️ ASPIRIN: Take with food, watch for bleeding, avoid with other NSAIDs'
    },
    'ibuprofen': {
      sideEffects: ['Stomach upset', 'Dizziness', 'Headache'],
      warning: '⚠️ IBUPROFEN: Take with food, avoid if stomach ulcers, may affect blood pressure'
    },
    'metformin': {
      sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
      warning: '⚠️ METFORMIN: Take with meals, monitor blood sugar, watch for lactic acidosis'
    },
    'paracetamol': {
      sideEffects: ['Nausea', 'Stomach upset'],
      warning: '⚠️ PARACETAMOL: Do not exceed 4000mg/day, avoid alcohol, liver monitoring if high doses'
    },
    'digoxin': {
      sideEffects: ['Nausea', 'Vomiting', 'Irregular heartbeat'],
      warning: '⚠️ DIGOXIN: Monitor heart rate, watch for toxicity signs, regular blood tests needed'
    },
    'furosemide': {
      sideEffects: ['Dehydration', 'Low potassium', 'Dizziness'],
      warning: '⚠️ FUROSEMIDE: Monitor electrolytes, stay hydrated, may cause low blood pressure'
    },
    'phenytoin': {
      sideEffects: ['Drowsiness', 'Dizziness', 'Gum swelling'],
      warning: '⚠️ PHENYTOIN: Regular blood tests required, avoid alcohol, may affect coordination'
    }
  }
  
  return medicines.map(medicine => {
    const medicineName = medicine.name.toLowerCase()
    const found = Object.keys(sideEffectMap).find(key => 
      medicineName.includes(key) || key.includes(medicineName)
    )
    
    if (found) {
      return {
        medicine: medicine.name,
        ...sideEffectMap[found]
      }
    }
    
    return {
      medicine: medicine.name,
      sideEffects: ['Monitor for any unusual symptoms'],
      warning: `⚠️ ${medicine.name.toUpperCase()}: Monitor for side effects, consult doctor if concerns`
    }
  })
}

function assessOverallRisk(warnings: any[], sideEffects: any[]): 'low' | 'medium' | 'high' | 'critical' {
  const criticalWarnings = warnings.filter(w => w.type === 'critical').length
  const warningCount = warnings.filter(w => w.type === 'warning').length
  
  if (criticalWarnings > 0) return 'critical'
  if (warningCount >= 2) return 'high'
  if (warningCount === 1) return 'medium'
  return 'low'
}

function generateRecommendations(warnings: any[], sideEffects: any[], patientInfo: any): string[] {
  const recommendations = []
  
  if (warnings.some(w => w.type === 'critical')) {
    recommendations.push('🚨 CRITICAL: Do not dispense this prescription - Contact prescribing doctor immediately')
  }
  
  if (warnings.some(w => w.type === 'warning')) {
    recommendations.push('⚠️ WARNING: Dispense with caution and provide detailed patient counseling')
  }
  
  recommendations.push('📋 Provide comprehensive patient counseling about side effects and interactions')
  recommendations.push('📞 Schedule follow-up monitoring as required')
  
  if (patientInfo?.age && patientInfo.age > 65) {
    recommendations.push('👴 Elderly patient - Monitor closely for side effects and drug interactions')
  }
  
  return recommendations
}
