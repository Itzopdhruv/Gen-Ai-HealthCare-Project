import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { medicines } from '@/lib/database'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrCd7CjUyz6-dZ-TM06KoS-AWS0LF0iws')

interface AIAlternativesRequest {
  medicineName: string
  requestedQuantity?: number
  category?: string
  patientAge?: number
  allergies?: string[]
  medicalConditions?: string[]
}

interface MedicineAlternative {
  id: string
  name: string
  genericName: string
  category: string
  manufacturer: string
  stock: number
  price: number
  dosage: string
  unit: string
  prescriptionRequired: boolean
  similarityScore: number
  aiReasoning: string
  compatibilityScore: number
  sideEffects: string[]
  contraindications: string[]
}

interface AIAlternativesResponse {
  success: boolean
  data?: {
    originalMedicine: string
    requestedQuantity: number
    alternatives: MedicineAlternative[]
    totalAlternatives: number
    aiAnalysis: string
    stockStatus: 'available' | 'partial' | 'unavailable'
    managerNotification?: string
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AIAlternativesResponse>> {
  try {
    const body: AIAlternativesRequest = await request.json()
    const { 
      medicineName, 
      requestedQuantity = 1,
      category = 'General',
      patientAge,
      allergies = [],
      medicalConditions = []
    } = body

    if (!medicineName || medicineName.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Medicine name is required' 
      }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create AI context for medicine alternatives
    const aiContext = `You are a medical AI assistant specializing in medicine alternatives and drug interactions. Your task is to analyze medicine requests and suggest appropriate alternatives based on:

1. **Therapeutic Equivalence**: Medicines with similar active ingredients or mechanisms of action
2. **Drug Interactions**: Consider patient allergies and medical conditions
3. **Dosage Equivalence**: Ensure similar therapeutic effects
4. **Safety Profile**: Consider age, allergies, and medical conditions
5. **Availability**: Prioritize medicines that are in stock

IMPORTANT RULES:
- Always provide **crisp, clear responses** without confusion
- Use **bullet points** for easy reading
- **Bold important information** like medicine names and warnings
- Consider **drug interactions** and **contraindications**
- Provide **specific reasoning** for each alternative
- Include **compatibility scores** (1-10) for each alternative
- Always mention **when to consult a doctor**

Available medicines in database: ${medicines.map(m => `${m.name} (${m.genericName}) - Stock: ${m.stock} - Category: ${m.category}`).join(', ')}

Patient Information:
- Age: ${patientAge || 'Not specified'}
- Allergies: ${allergies.length > 0 ? allergies.join(', ') : 'None specified'}
- Medical Conditions: ${medicalConditions.length > 0 ? medicalConditions.join(', ') : 'None specified'}`

    // Build the prompt
    const prompt = `${aiContext}

Requested Medicine: **${medicineName}**
Requested Quantity: ${requestedQuantity}
Category: ${category}

Please analyze this request and suggest appropriate alternatives from the available medicines. For each alternative, provide:
1. **Medicine Name** and **Generic Name**
2. **Similarity Score** (1-10) - how similar it is to the requested medicine
3. **Compatibility Score** (1-10) - how safe it is for this patient
4. **AI Reasoning** - why this is a good alternative
5. **Stock Status** - whether it's available
6. **Important Warnings** - any contraindications or side effects

Format your response as:
## Analysis
[Your analysis of the request]

## Suggested Alternatives
• **Medicine Name** (Generic Name)
  - Similarity: X/10
  - Compatibility: X/10
  - Stock: Available/Out of Stock
  - Reasoning: [Why this is a good alternative]
  - Warnings: [Any important warnings]

## Stock Status Summary
[Overall stock availability]

## Manager Notification
[If any medicines need to be ordered, provide a clear notification for the manager]`

    // Generate AI response
    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiAnalysis = response.text()

    // Process the AI response and match with database medicines
    const alternatives = await processAIResponse(aiAnalysis, medicines, requestedQuantity)

    // Determine overall stock status
    const stockStatus = determineStockStatus(alternatives, requestedQuantity)

    // Generate manager notification if needed
    const managerNotification = generateManagerNotification(alternatives, medicineName, requestedQuantity)

    return NextResponse.json({
      success: true,
      data: {
        originalMedicine: medicineName,
        requestedQuantity,
        alternatives,
        totalAlternatives: alternatives.length,
        aiAnalysis,
        stockStatus,
        managerNotification: managerNotification || undefined
      }
    })

  } catch (error) {
    console.error('AI Medicine Alternatives Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to find AI-powered alternatives' 
    }, { status: 500 })
  }
}

// Helper function to process AI response and match with database
async function processAIResponse(aiResponse: string, medicines: any[], requestedQuantity: number): Promise<MedicineAlternative[]> {
  const alternatives: MedicineAlternative[] = []
  
  // Extract medicine names from AI response
  const medicineMatches = aiResponse.match(/\*\*([^*]+)\*\*/g)
  
  if (medicineMatches) {
    for (const match of medicineMatches) {
      const medicineName = match.replace(/\*\*/g, '').trim()
      
      // Find matching medicine in database
      const dbMedicine = medicines.find(m => 
        m.name.toLowerCase().includes(medicineName.toLowerCase()) ||
        m.genericName.toLowerCase().includes(medicineName.toLowerCase()) ||
        medicineName.toLowerCase().includes(m.name.toLowerCase()) ||
        medicineName.toLowerCase().includes(m.genericName.toLowerCase())
      )
      
      if (dbMedicine) {
        // Extract scores from AI response
        const similarityMatch = aiResponse.match(new RegExp(`${medicineName}[\\s\\S]*?Similarity:\\s*(\\d+)`, 'i'))
        const compatibilityMatch = aiResponse.match(new RegExp(`${medicineName}[\\s\\S]*?Compatibility:\\s*(\\d+)`, 'i'))
        
        const similarityScore = similarityMatch ? parseInt(similarityMatch[1]) : 7
        const compatibilityScore = compatibilityMatch ? parseInt(compatibilityMatch[1]) : 8
        
        alternatives.push({
          id: dbMedicine.id,
          name: dbMedicine.name,
          genericName: dbMedicine.genericName,
          category: dbMedicine.category,
          manufacturer: dbMedicine.manufacturer,
          stock: dbMedicine.stock,
          price: dbMedicine.price,
          dosage: dbMedicine.dosage,
          unit: dbMedicine.unit,
          prescriptionRequired: dbMedicine.prescriptionRequired,
          similarityScore,
          aiReasoning: `AI-suggested alternative based on therapeutic equivalence and safety profile`,
          compatibilityScore,
          sideEffects: dbMedicine.sideEffects,
          contraindications: dbMedicine.contraindications
        })
      }
    }
  }
  
  // Sort by compatibility score and similarity score
  return alternatives.sort((a, b) => {
    const scoreA = (a.compatibilityScore + a.similarityScore) / 2
    const scoreB = (b.compatibilityScore + b.similarityScore) / 2
    return scoreB - scoreA
  })
}

// Helper function to determine stock status
function determineStockStatus(alternatives: MedicineAlternative[], requestedQuantity: number): 'available' | 'partial' | 'unavailable' {
  const availableAlternatives = alternatives.filter(alt => alt.stock >= requestedQuantity)
  
  if (availableAlternatives.length === alternatives.length) {
    return 'available'
  } else if (availableAlternatives.length > 0) {
    return 'partial'
  } else {
    return 'unavailable'
  }
}

// Helper function to generate manager notification
function generateManagerNotification(alternatives: MedicineAlternative[], originalMedicine: string, requestedQuantity: number): string | null {
  const outOfStockAlternatives = alternatives.filter(alt => alt.stock < requestedQuantity)
  
  if (outOfStockAlternatives.length > 0) {
    const medicinesToOrder = outOfStockAlternatives.map(alt => `${alt.name} (${alt.genericName}) - Current Stock: ${alt.stock}, Required: ${requestedQuantity}`).join('\n')
    
    return `URGENT: Medicine Stock Alert

Original Request: ${originalMedicine} (${requestedQuantity} units)

The following alternative medicines are out of stock or have insufficient stock:
${medicinesToOrder}

Action Required:
• Order the above medicines immediately
• Consider increasing minimum stock levels
• Notify customer about potential delays

Priority: HIGH - Customer prescription cannot be fulfilled`
  }
  
  return null
}
