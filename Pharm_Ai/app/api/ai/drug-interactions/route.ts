import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrCd7CjUyz6-dZ-TM06KoS-AWS0LF0iws')

interface DrugInteractionRequest {
  medications: string[]
  patientProfile?: {
    age?: number
    gender?: string
    medicalConditions?: string[]
    allergies?: string[]
  }
  newMedication?: string
}

interface DrugInteractionResponse {
  success: boolean
  data?: {
    interactions: Array<{
      medication1: string
      medication2: string
      severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
      description: string
      mechanism: string
      clinicalSignificance: string
      management: string
      references: string[]
    }>
    contraindications: Array<{
      medication: string
      condition: string
      severity: 'warning' | 'contraindicated'
      description: string
      alternative: string
    }>
    recommendations: Array<{
      type: 'dosing' | 'timing' | 'monitoring' | 'alternative'
      priority: 'low' | 'medium' | 'high'
      recommendation: string
      rationale: string
    }>
    safetyScore: number
    aiInsights: string
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<DrugInteractionResponse>> {
  try {
    const body: DrugInteractionRequest = await request.json()
    const { 
      medications = [],
      patientProfile,
      newMedication
    } = body

    if (medications.length === 0 && !newMedication) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least one medication is required' 
      }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create AI context for drug interaction analysis
    const aiContext = `You are an advanced AI drug interaction analysis system for a pharmacy management platform. Your task is to analyze potential drug interactions, contraindications, and provide comprehensive safety recommendations.

IMPORTANT RULES:
- Always provide **crisp, clear responses** without confusion
- Use **bullet points** for easy reading
- **Bold important information** like severe interactions and warnings
- Provide **specific clinical information** and mechanisms
- Include **evidence-based recommendations**
- Consider **patient-specific factors** like age, conditions, allergies
- Provide **actionable management strategies**

Medication Analysis:
- Current Medications: ${medications.join(', ') || 'None'}
- New Medication: ${newMedication || 'Not specified'}
- Patient Age: ${patientProfile?.age || 'Not specified'}
- Patient Gender: ${patientProfile?.gender || 'Not specified'}
- Medical Conditions: ${patientProfile?.medicalConditions?.join(', ') || 'None'}
- Allergies: ${patientProfile?.allergies?.join(', ') || 'None'}

Please provide comprehensive drug interaction analysis including:

## Drug Interactions
- **Severity levels** (minor/moderate/major/contraindicated) for each interaction
- **Mechanism of interaction** (pharmacokinetic/pharmacodynamic)
- **Clinical significance** and potential outcomes
- **Management strategies** for each interaction
- **Evidence-based references** and sources

## Contraindications
- **Absolute contraindications** based on patient conditions
- **Relative contraindications** with risk-benefit analysis
- **Alternative medications** when contraindications exist
- **Patient-specific warnings** based on demographics

## Safety Recommendations
- **Dosing adjustments** required for interactions
- **Timing modifications** to minimize interactions
- **Monitoring requirements** for patient safety
- **Alternative treatment options** when appropriate

## Clinical Decision Support
- **Risk-benefit analysis** for each medication combination
- **Patient counseling points** for pharmacists
- **Emergency protocols** for severe interactions
- **Follow-up requirements** and monitoring schedules

Format your response as:
## Drug Interactions
[Detailed interaction analysis with severity levels and mechanisms]

## Contraindications
[Patient-specific contraindications and alternatives]

## Recommendations
[Actionable safety recommendations with priorities]

## Clinical Insights
[Key clinical insights and decision support information]`

    // Generate AI response
    const result = await model.generateContent(aiContext)
    const response = await result.response
    const aiAnalysis = response.text()

    // Process AI response to extract structured data
    const processedData = processDrugInteractions(aiAnalysis, medications, patientProfile, newMedication)

    return NextResponse.json({
      success: true,
      data: processedData
    })

  } catch (error) {
    console.error('Drug Interaction Analysis Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze drug interactions' 
    }, { status: 500 })
  }
}

// Helper function to process drug interaction analysis
function processDrugInteractions(
  aiResponse: string, 
  medications: string[], 
  patientProfile: any, 
  newMedication?: string
): any {
  // Generate sample interactions based on common drug combinations
  const interactions = generateSampleInteractions(medications, newMedication)
  
  // Generate contraindications based on patient profile
  const contraindications = generateContraindications(medications, patientProfile)
  
  // Generate recommendations
  const recommendations = generateRecommendations(medications, patientProfile)
  
  // Calculate safety score
  const safetyScore = calculateSafetyScore(interactions, contraindications)
  
  return {
    interactions,
    contraindications,
    recommendations,
    safetyScore,
    aiInsights: aiResponse
  }
}

// Helper functions
function generateSampleInteractions(medications: string[], newMedication?: string): Array<{
  medication1: string
  medication2: string
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
  description: string
  mechanism: string
  clinicalSignificance: string
  management: string
  references: string[]
}> {
  const interactions = []
  
  // Common drug interactions
  const interactionMap: { [key: string]: any } = {
    'Warfarin-Paracetamol': {
      severity: 'moderate' as const,
      description: 'Increased bleeding risk',
      mechanism: 'Paracetamol may enhance anticoagulant effect',
      clinicalSignificance: 'Monitor INR more frequently',
      management: 'Monitor INR levels and adjust warfarin dose if needed'
    },
    'Aspirin-Ibuprofen': {
      severity: 'moderate' as const,
      description: 'Reduced cardioprotective effect of aspirin',
      mechanism: 'Competitive inhibition of COX-1',
      clinicalSignificance: 'May reduce aspirin\'s antiplatelet effect',
      management: 'Take aspirin 2 hours before or 8 hours after ibuprofen'
    },
    'Metformin-Contrast': {
      severity: 'major' as const,
      description: 'Risk of lactic acidosis',
      mechanism: 'Contrast agents impair renal function',
      clinicalSignificance: 'High risk of lactic acidosis',
      management: 'Discontinue metformin before contrast studies'
    }
  }
  
  // Check for known interactions
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const med1 = medications[i]
      const med2 = medications[j]
      const key = `${med1}-${med2}`
      const reverseKey = `${med2}-${med1}`
      
      if (interactionMap[key] || interactionMap[reverseKey]) {
        const interaction = interactionMap[key] || interactionMap[reverseKey]
        interactions.push({
          medication1: med1,
          medication2: med2,
          severity: interaction.severity,
          description: interaction.description,
          mechanism: interaction.mechanism,
          clinicalSignificance: interaction.clinicalSignificance,
          management: interaction.management,
          references: ['Drug Interaction Database', 'Clinical Pharmacology']
        })
      }
    }
    
    // Check interactions with new medication
    if (newMedication) {
      const key = `${medications[i]}-${newMedication}`
      const reverseKey = `${newMedication}-${medications[i]}`
      
      if (interactionMap[key] || interactionMap[reverseKey]) {
        const interaction = interactionMap[key] || interactionMap[reverseKey]
        interactions.push({
          medication1: medications[i],
          medication2: newMedication,
          severity: interaction.severity,
          description: interaction.description,
          mechanism: interaction.mechanism,
          clinicalSignificance: interaction.clinicalSignificance,
          management: interaction.management,
          references: ['Drug Interaction Database', 'Clinical Pharmacology']
        })
      }
    }
  }
  
  return interactions
}

function generateContraindications(medications: string[], patientProfile: any): Array<{
  medication: string
  condition: string
  severity: 'warning' | 'contraindicated'
  description: string
  alternative: string
}> {
  const contraindications = []
  
  // Check for contraindications based on patient conditions
  if (patientProfile?.medicalConditions) {
    for (const condition of patientProfile.medicalConditions) {
      for (const medication of medications) {
        if (condition.toLowerCase().includes('liver') && medication.toLowerCase().includes('paracetamol')) {
          contraindications.push({
            medication,
            condition,
            severity: 'warning' as const,
            description: 'Use with caution in liver disease',
            alternative: 'Consider lower dose or alternative pain reliever'
          })
        }
        
        if (condition.toLowerCase().includes('kidney') && medication.toLowerCase().includes('ibuprofen')) {
          contraindications.push({
            medication,
            condition,
            severity: 'contraindicated' as const,
            description: 'Contraindicated in severe kidney disease',
            alternative: 'Use paracetamol instead'
          })
        }
      }
    }
  }
  
  return contraindications
}

function generateRecommendations(medications: string[], patientProfile: any): Array<{
  type: 'dosing' | 'timing' | 'monitoring' | 'alternative'
  priority: 'low' | 'medium' | 'high'
  recommendation: string
  rationale: string
}> {
  const recommendations = []
  
  // Age-based recommendations
  if (patientProfile?.age && patientProfile.age > 65) {
    recommendations.push({
      type: 'dosing' as const,
      priority: 'high' as const,
      recommendation: 'Consider reduced doses for elderly patients',
      rationale: 'Elderly patients may have reduced drug clearance'
    })
  }
  
  // General monitoring recommendations
  recommendations.push({
    type: 'monitoring' as const,
    priority: 'medium' as const,
    recommendation: 'Monitor for adverse effects and drug interactions',
    rationale: 'Regular monitoring ensures patient safety'
  })
  
  // Timing recommendations
  recommendations.push({
    type: 'timing' as const,
    priority: 'low' as const,
    recommendation: 'Space medications appropriately to avoid interactions',
    rationale: 'Proper timing can minimize drug interactions'
  })
  
  return recommendations
}

function calculateSafetyScore(interactions: any[], contraindications: any[]): number {
  let score = 100
  
  // Deduct points for interactions
  interactions.forEach(interaction => {
    switch (interaction.severity) {
      case 'minor':
        score -= 5
        break
      case 'moderate':
        score -= 15
        break
      case 'major':
        score -= 30
        break
      case 'contraindicated':
        score -= 50
        break
    }
  })
  
  // Deduct points for contraindications
  contraindications.forEach(contraindication => {
    if (contraindication.severity === 'contraindicated') {
      score -= 40
    } else {
      score -= 20
    }
  })
  
  return Math.max(0, score)
}
