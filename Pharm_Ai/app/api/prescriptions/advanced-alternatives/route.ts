import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { medicines } from '@/lib/database'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrCd7CjUyz6-dZ-TM06KoS-AWS0LF0iws')

interface AdvancedAlternativesRequest {
  medicines: Array<{
    name: string
    category: string
    requestedQuantity: number
  }>
  patientInfo?: {
    age?: number
    allergies?: string[]
    medicalConditions?: string[]
  }
}

interface AdvancedAlternativesResponse {
  success: boolean
  data?: {
    alternatives: any[]
    totalAlternatives: number
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AdvancedAlternativesResponse>> {
  try {
    console.log('Advanced alternatives API called')
    const body: AdvancedAlternativesRequest = await request.json()
    const { medicines: prescriptionMedicines, patientInfo } = body

    console.log('Request medicines:', prescriptionMedicines)
    console.log('Patient info:', patientInfo)

    if (!prescriptionMedicines || prescriptionMedicines.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No medicines provided' 
      }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const allAlternatives = []
    
    for (const medicine of prescriptionMedicines) {
      try {
        console.log(`Finding AI-powered alternatives for ${medicine.name}...`)
        
        // Find the original medicine in database
        const originalMed = medicines.find(m => 
          m.name.toLowerCase().includes(medicine.name.toLowerCase()) ||
          medicine.name.toLowerCase().includes(m.name.toLowerCase())
        )
        
        // Create AI context for this specific medicine
        const aiContext = `You are a medical AI assistant. Find the TOP 5 alternative medicines for the requested medicine.

AVAILABLE MEDICINES IN DATABASE:
${medicines.filter(m => m.stock > 0).map(m => 
  `• ${m.name} (${m.genericName}) - Category: ${m.category} - Stock: ${m.stock} - Price: $${m.price}
  Side Effects: ${m.sideEffects?.join(', ') || 'None'}
  Contraindications: ${m.contraindications?.join(', ') || 'None'}`
).join('\n')}

REQUESTED MEDICINE: ${medicine.name}
CATEGORY: ${originalMed?.category || medicine.category}
QUANTITY NEEDED: ${medicine.requestedQuantity}

PATIENT INFO:
- Age: ${patientInfo?.age || 'Not specified'}
- Allergies: ${patientInfo?.allergies?.join(', ') || 'None'}
- Medical Conditions: ${patientInfo?.medicalConditions?.join(', ') || 'None'}

⚠️ CRITICAL: YOU MUST FOLLOW THIS EXACT FORMAT FOR EACH ALTERNATIVE:

**1. [Medicine Name from database]**
Similarity: [number]/10
Compatibility: [number]/10
Reasoning: [One sentence explanation]
Warnings: [Specific warnings for this patient, include side effects]

**2. [Medicine Name from database]**
Similarity: [number]/10
Compatibility: [number]/10
Reasoning: [One sentence explanation]
Warnings: [Specific warnings for this patient, include side effects]

EXAMPLE FORMAT:
**1. Ibuprofen 200mg**
Similarity: 8/10
Compatibility: 7/10
Reasoning: Provides effective pain relief similar to Paracetamol with anti-inflammatory benefits.
Warnings: May cause stomach upset, nausea. Diabetic patients should monitor blood sugar levels carefully.

**2. Naproxen 220mg**
Similarity: 7/10
Compatibility: 8/10
Reasoning: Long-acting NSAID providing sustained pain relief.
Warnings: Risk of GI bleeding, kidney issues. Not recommended for patients with heart disease.

IMPORTANT RULES:
1. Choose medicines from SAME or SIMILAR category
2. Check if medicine is IN STOCK (from list above)
3. If patient has allergy to Paracetamol/Dolo-650, EXCLUDE all Paracetamol medicines
4. Always provide ALL 4 fields (Similarity, Compatibility, Reasoning, Warnings) for EACH medicine
5. Include actual side effects from the database in warnings
6. Similarity = how close to original medicine (same effect)
7. Compatibility = how safe for THIS patient (considering age/allergies/conditions)

Suggest 5 alternatives now:`

        // Generate AI response
        const result = await model.generateContent(aiContext)
        const response = await result.response
        const aiAnalysis = response.text()
        
        console.log(`AI analysis for ${medicine.name}:`, aiAnalysis.substring(0, 200))
        
        // Process AI response to extract alternatives
        const processedAlternatives = processAIResponse(aiAnalysis, medicines, medicine, patientInfo)
        
        console.log(`Found ${processedAlternatives.length} alternatives for ${medicine.name}`)
        
        if (processedAlternatives.length > 0) {
          allAlternatives.push({
            originalMedicine: medicine.name,
            requestedQuantity: medicine.requestedQuantity,
            alternatives: processedAlternatives,
            aiAnalysis: aiAnalysis
          })
        } else {
          // Fallback: find alternatives by category if AI doesn't find any
          const fallbackAlternatives = medicines
            .filter(m => 
              m.stock >= medicine.requestedQuantity &&
              m.category === medicine.category &&
              !m.name.toLowerCase().includes(medicine.name.toLowerCase())
            )
            .slice(0, 5)
            .map(m => ({
              name: m.name,
              genericName: m.genericName,
              dosage: m.dosage,
              category: m.category,
              availableQuantity: m.stock,
              price: m.price,
              similarity: 0.7,
              reason: `Alternative ${m.category} medicine`,
              sideEffects: m.sideEffects || [],
              warnings: m.contraindications?.length > 0 ? `Contraindicated in: ${m.contraindications.join(', ')}` : undefined,
              aiReasoning: `Suggested alternative from same category`,
              compatibilityScore: 7
            }))
          
          if (fallbackAlternatives.length > 0) {
            allAlternatives.push({
              originalMedicine: medicine.name,
              requestedQuantity: medicine.requestedQuantity,
              alternatives: fallbackAlternatives,
              aiAnalysis: 'Fallback alternatives based on category match'
            })
          }
        }
      } catch (altError) {
        console.error(`Error finding alternatives for ${medicine.name}:`, altError)
      }
    }
    
    console.log(`Total alternatives found: ${allAlternatives.length}`)
    
    return NextResponse.json({
      success: true,
      data: {
        alternatives: allAlternatives,
        totalAlternatives: allAlternatives.length
      }
    })

  } catch (error) {
    console.error('Advanced alternatives error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to find advanced alternatives' 
    }, { status: 500 })
  }
}

// Helper function to process AI response and extract alternatives
function processAIResponse(aiResponse: string, medicines: any[], requestedMedicine: any, patientInfo?: any): any[] {
  const alternatives: any[] = []
  const addedMedicines = new Set<string>() // Track added medicines to avoid duplicates
  
  // Extract medicine names from AI response (they're in **bold**)
  // Look for patterns like "**1. Medicine Name**" or "**Medicine Name (Generic Name)**"
  const medicineMatches = aiResponse.match(/\*\*(?:\d+\.\s*)?([^*]+?)\s*(?:\([^)]*\))?\*\*/g)
  
  if (!medicineMatches) {
    console.log('No medicine matches found in AI response')
    return alternatives
  }
  
  console.log('Found medicine mentions:', medicineMatches)
  
  for (const match of medicineMatches) {
    // Remove ** and numbers like "1.", "2.", etc.
    let medicineName = match.replace(/\*\*/g, '').trim()
    medicineName = medicineName.replace(/^\d+\.\s*/, '').trim() // Remove leading numbers
    medicineName = medicineName.replace(/\s*\([^)]*\)\s*$/, '').trim() // Remove trailing (Generic Name)
    
    // Skip very short matches (likely not medicine names)
    if (medicineName.length < 3) {
      console.log(`Skipping short match: "${medicineName}"`)
      continue
    }
    
    // Skip common words that aren't medicines
    const skipWords = ['belladonna', 'aluminum', 'diabetes', 'patient', 'allergies', 'conditions', 'original', 'medicine', 'combination', 'product', 'aluminum hydroxide', 'similarity', 'compatibility', 'reasoning', 'warnings']
    if (skipWords.some(word => medicineName.toLowerCase() === word || medicineName.toLowerCase().endsWith(':'))) {
      console.log(`Skipping common word or label: "${medicineName}"`)
      continue
    }
    
    // Skip if it's the original medicine or any part of it
    const origNameParts = requestedMedicine.name.toLowerCase().split(/\s+and\s+|\s+/)
    const isOriginalMedicine = origNameParts.some((part: string) => 
      part.length > 3 && (
        medicineName.toLowerCase().includes(part) ||
        part.includes(medicineName.toLowerCase())
      )
    )
    
    if (isOriginalMedicine || 
        medicineName.toLowerCase().includes(requestedMedicine.name.toLowerCase()) ||
        requestedMedicine.name.toLowerCase().includes(medicineName.toLowerCase())) {
      console.log(`Skipping original medicine or its component: "${medicineName}"`)
      continue
    }
    
    // Find matching medicine in database - try multiple matching strategies
    let dbMedicine = medicines.find(m => 
      m.name.toLowerCase() === medicineName.toLowerCase() ||
      m.genericName.toLowerCase() === medicineName.toLowerCase()
    )
    
    // If not found with exact match, try partial match
    if (!dbMedicine) {
      dbMedicine = medicines.find(m => {
        const mNameLower = m.name.toLowerCase()
        const medNameLower = medicineName.toLowerCase()
        const mGenericLower = m.genericName.toLowerCase()
        
        return (
          (mNameLower.includes(medNameLower) || medNameLower.includes(mNameLower)) ||
          (mGenericLower.includes(medNameLower) || medNameLower.includes(mGenericLower))
        )
      })
    }
    
    // Check if already added to prevent duplicates
    if (dbMedicine && addedMedicines.has(dbMedicine.id)) {
      console.log(`⏭️ Skipping duplicate: "${medicineName}" (already added ${dbMedicine.name})`)
      continue
    }
    
    if (dbMedicine && dbMedicine.stock > 0) {
      console.log(`✅ Found match for "${medicineName}": ${dbMedicine.name} (ID: ${dbMedicine.id})`)
      
      // Extract scores from AI response for this medicine
      // Get the text AFTER this medicine name up to the next medicine or end
      const medicineSection = aiResponse.split(match)[1]?.substring(0, 1200) || ''
      
      // More flexible regex patterns - the score MUST be a digit, not just the word "Similarity:"
      const similarityMatch = medicineSection.match(/Similarity:\s*(\d+)\s*\/?\s*10/i) || 
                             medicineSection.match(/Similarity\s*:\s*(\d+)/i)
      
      const compatibilityMatch = medicineSection.match(/Compatibility:\s*(\d+)\s*\/?\s*10/i) || 
                                 medicineSection.match(/Compatibility\s*:\s*(\d+)/i)
      
      // Extract reasoning - MUST have text content, not just the word "Reasoning:"
      const reasoningMatch = medicineSection.match(/Reasoning:\s*([^\n]+)/i)
      
      // Extract warnings - MUST have text content, not just the word "Warnings:"
      const warningsMatch = medicineSection.match(/Warnings?:\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i)
      
      // VALIDATION: If we can't extract scores, skip this medicine (bad AI response)
      if (!similarityMatch || !compatibilityMatch) {
        console.log(`⚠️ Skipping ${dbMedicine.name} - incomplete data from AI (similarity: ${!!similarityMatch}, compatibility: ${!!compatibilityMatch})`)
        continue
      }
      
      const similarityScore = parseInt(similarityMatch[1]) / 10
      const compatibilityScore = parseInt(compatibilityMatch[1])
      const aiReasoning = reasoningMatch && reasoningMatch[1].trim().length > 5 ? 
                         reasoningMatch[1].trim().replace(/\*\*/g, '') : 
                         `Alternative in ${dbMedicine.category} category, suitable for patient profile`
      
      // DEBUG: Log what we extracted
      console.log(`📊 Extracted for ${dbMedicine.name}:`, {
        similarity: similarityScore,
        compatibility: compatibilityScore,
        reasoning: aiReasoning.substring(0, 100),
        hasWarnings: !!warningsMatch
      })
      
      // Enhanced warning extraction - ALWAYS have warnings (use DB side effects as minimum)
      let warnings = warningsMatch && warningsMatch[1].trim().length > 5 ? 
                     warningsMatch[1].trim().replace(/\*\*/g, '').replace(/[\[\]]/g, '') : 
                     ''
      
      // ALWAYS include database side effects as base warning
      if (dbMedicine.sideEffects && dbMedicine.sideEffects.length > 0) {
        const sideEffectsWarning = `Common side effects: ${dbMedicine.sideEffects.join(', ')}`
        warnings = warnings ? `${sideEffectsWarning}. ${warnings}` : sideEffectsWarning
      }
      
      // Check for allergy warnings
      if (patientInfo?.allergies && patientInfo.allergies.length > 0) {
        const medicineNameLower = dbMedicine.name.toLowerCase()
        const genericNameLower = dbMedicine.genericName.toLowerCase()
        const allergyMatch = patientInfo.allergies.some((allergy: string) => {
          const allergyLower = allergy.toLowerCase()
          return medicineNameLower.includes(allergyLower) ||
                 genericNameLower.includes(allergyLower) ||
                 allergyLower.includes(medicineNameLower.split(' ')[0]) ||
                 (allergyLower.includes('nsaid') && medicineSection.toLowerCase().includes('nsaid'))
        })
        if (allergyMatch) {
          const allergyWarning = `⚠️ ALLERGY WARNING: Patient is allergic to this medicine or its class. DO NOT DISPENSE.`
          warnings = warnings ? `${allergyWarning} ${warnings}` : allergyWarning
          console.log(`🚨 ALLERGY DETECTED for ${dbMedicine.name}`)
        }
      }
      
      // Check for medical condition contraindications
      if (patientInfo?.medicalConditions && patientInfo.medicalConditions.length > 0) {
        const conditionsLower = patientInfo.medicalConditions.map((c: string) => c.toLowerCase())
        const contraindicationsLower = (dbMedicine.contraindications || []).map((c: string) => c.toLowerCase())
        
        const contraMatch = conditionsLower.some((cond: string) => 
          contraindicationsLower.some((contra: string) => 
            contra.includes(cond) || cond.includes(contra.split(' ')[0])
          )
        )
        
        if (contraMatch) {
          const matchedConditions = patientInfo.medicalConditions.filter((cond: string) => 
            contraindicationsLower.some((contra: string) => 
              contra.toLowerCase().includes(cond.toLowerCase()) || 
              cond.toLowerCase().includes(contra.split(' ')[0].toLowerCase())
            )
          )
          const contraWarning = `🚨 CONTRAINDICATED: Not safe for patients with ${matchedConditions.join(', ')}.`
          warnings = warnings ? `${contraWarning} ${warnings}` : contraWarning
          console.log(`🚨 CONTRAINDICATION DETECTED for ${dbMedicine.name}: ${matchedConditions.join(', ')}`)
        }
      }
      
      // Look for HIGH RISK or CRITICAL warnings in AI text
      if (medicineSection.match(/HIGH RISK|CRITICAL|CONTRAINDICATED|AVOID|EXTREME CAUTION/i)) {
        const riskWarning = medicineSection.match(/(HIGH RISK[^.]*\.|CRITICAL[^.]*\.|CONTRAINDICATED[^.]*\.|AVOID[^.]*\.|EXTREME CAUTION[^.]*\.)/i)
        if (riskWarning && !warnings.includes(riskWarning[1])) {
          warnings = warnings ? `${warnings} | ${riskWarning[1]}` : riskWarning[1]
        }
      }
      
      // If still no warnings, use database contraindications
      if (!warnings && dbMedicine.contraindications && dbMedicine.contraindications.length > 0) {
        warnings = `Contraindicated in: ${dbMedicine.contraindications.join(', ')}`
      }
      
      const alternativeData = {
        name: dbMedicine.name,
        genericName: dbMedicine.genericName,
        dosage: dbMedicine.dosage,
        category: dbMedicine.category,
        availableQuantity: dbMedicine.stock,
        price: dbMedicine.price,
        similarity: similarityScore,
        reason: aiReasoning,
        sideEffects: dbMedicine.sideEffects || [],
        warnings,
        aiReasoning,
        compatibilityScore
      }
      
      alternatives.push(alternativeData)
      addedMedicines.add(dbMedicine.id)
      
      console.log(`✅ Added alternative: ${dbMedicine.name} | Similarity: ${similarityScore*100}% | Has warnings: ${!!warnings} | Side effects: ${(dbMedicine.sideEffects || []).length}`)
    } else if (!dbMedicine) {
      console.log(`❌ No database match for: "${medicineName}"`)
    } else if (dbMedicine.stock === 0) {
      console.log(`⚠️ Medicine out of stock: "${medicineName}" (${dbMedicine.name})`)
    }
  }
  
  console.log(`Final alternatives count: ${alternatives.length}`)
  
  // Sort by similarity score (highest first)
  return alternatives.sort((a, b) => b.similarity - a.similarity).slice(0, 5)
}