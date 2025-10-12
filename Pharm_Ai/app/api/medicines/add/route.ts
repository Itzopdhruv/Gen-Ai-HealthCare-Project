import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { medicines, Medicine } from '@/lib/database'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrCd7CjUyz6-dZ-TM06KoS-AWS0LF0iws')

interface AddMedicineRequest {
  name: string
  genericName?: string
  category?: string
  manufacturer?: string
  dosage?: string
  unit?: string
  price?: number
  costPrice?: number
  stock?: number
  minStock?: number
  maxStock?: number
  description?: string
  sideEffects?: string[]
  contraindications?: string[]
  prescriptionRequired?: boolean
  supplier?: string
  barcode?: string
  imageUrl?: string
}

interface AddMedicineResponse {
  success: boolean
  data?: {
    medicine: Medicine
    aiSuggestions: {
      category: string
      dosage: string
      sideEffects: string[]
      contraindications: string[]
      warnings: string[]
    }
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AddMedicineResponse>> {
  try {
    const body: AddMedicineRequest = await request.json()
    const { 
      name,
      genericName,
      category,
      manufacturer,
      dosage,
      unit,
      price,
      costPrice,
      stock = 0,
      minStock = 10,
      maxStock = 1000,
      description,
      sideEffects = [],
      contraindications = [],
      prescriptionRequired = false,
      supplier,
      barcode,
      imageUrl
    } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Medicine name is required' 
      }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create AI context for medicine analysis
    const aiContext = `You are a medical AI assistant specializing in medicine analysis and categorization. Your task is to analyze a new medicine and provide detailed information about it.

IMPORTANT RULES:
- Always provide **crisp, clear responses** without confusion
- Use **bullet points** for easy reading
- **Bold important information** like medicine names and warnings
- Provide **specific medical information** based on your knowledge
- Include **safety warnings** and **contraindications**
- Suggest appropriate **dosage** and **category**

Medicine to analyze: **${name}**
Generic Name: ${genericName || 'Not specified'}
Manufacturer: ${manufacturer || 'Not specified'}
Current Category: ${category || 'Not specified'}

Please provide:
1. **Suggested Category** (e.g., Antibiotic, Pain Relief, Cardiovascular, etc.)
2. **Recommended Dosage** (e.g., "500mg", "10ml", "2 tablets")
3. **Common Side Effects** (list the most important ones)
4. **Contraindications** (who should not take this medicine)
5. **Important Warnings** (any critical safety information)

Format your response as:
## Medicine Analysis
[Your analysis of the medicine]

## Suggested Information
• **Category**: [Suggested category]
• **Dosage**: [Recommended dosage]
• **Side Effects**: [List of common side effects]
• **Contraindications**: [List of contraindications]
• **Warnings**: [Important safety warnings]

## Additional Notes
[Any additional important information]`

    // Generate AI response
    const result = await model.generateContent(aiContext)
    const response = await result.response
    const aiAnalysis = response.text()

    // Process AI response to extract suggestions
    const aiSuggestions = processAIMedicineAnalysis(aiAnalysis)

    // Generate unique ID
    const id = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create new medicine object
    const newMedicine: Medicine = {
      id,
      name: name.trim(),
      genericName: genericName?.trim() || aiSuggestions.genericName || name.trim(),
      category: category || aiSuggestions.category || 'General',
      manufacturer: manufacturer?.trim() || 'Unknown',
      batchNumber: `BATCH_${Date.now()}`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      stock,
      minStock,
      maxStock,
      price: price || 0,
      costPrice: costPrice || price || 0,
      description: description || `Medicine: ${name}`,
      sideEffects: sideEffects.length > 0 ? sideEffects : aiSuggestions.sideEffects,
      contraindications: contraindications.length > 0 ? contraindications : aiSuggestions.contraindications,
      dosage: dosage || aiSuggestions.dosage || 'As directed by physician',
      unit: unit || 'units',
      prescriptionRequired,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRestocked: new Date().toISOString(),
      supplier: supplier || 'Unknown',
      barcode,
      imageUrl
    }

    // Add to medicines array
    medicines.push(newMedicine)

    return NextResponse.json({
      success: true,
      data: {
        medicine: newMedicine,
        aiSuggestions: {
          category: aiSuggestions.category,
          dosage: aiSuggestions.dosage,
          sideEffects: aiSuggestions.sideEffects,
          contraindications: aiSuggestions.contraindications,
          warnings: aiSuggestions.warnings
        }
      }
    })

  } catch (error) {
    console.error('Add Medicine Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add medicine' 
    }, { status: 500 })
  }
}

// Helper function to process AI medicine analysis
function processAIMedicineAnalysis(aiResponse: string): {
  category: string
  genericName: string
  dosage: string
  sideEffects: string[]
  contraindications: string[]
  warnings: string[]
} {
  // Extract category
  const categoryMatch = aiResponse.match(/Category[:\s]*\*\*([^*]+)\*\*/i)
  const category = categoryMatch ? categoryMatch[1].trim() : 'General'

  // Extract dosage
  const dosageMatch = aiResponse.match(/Dosage[:\s]*\*\*([^*]+)\*\*/i)
  const dosage = dosageMatch ? dosageMatch[1].trim() : 'As directed by physician'

  // Extract side effects
  const sideEffectsMatch = aiResponse.match(/Side Effects[:\s]*\*\*([^*]+)\*\*/i)
  const sideEffects = sideEffectsMatch ? 
    sideEffectsMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0) : 
    ['Nausea', 'Dizziness']

  // Extract contraindications
  const contraindicationsMatch = aiResponse.match(/Contraindications[:\s]*\*\*([^*]+)\*\*/i)
  const contraindications = contraindicationsMatch ? 
    contraindicationsMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0) : 
    ['Pregnancy', 'Breastfeeding']

  // Extract warnings
  const warningsMatch = aiResponse.match(/Warnings[:\s]*\*\*([^*]+)\*\*/i)
  const warnings = warningsMatch ? 
    warningsMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0) : 
    ['Consult physician before use']

  return {
    category,
    genericName: '',
    dosage,
    sideEffects,
    contraindications,
    warnings
  }
}
