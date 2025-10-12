import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrCd7CjUyz6-dZ-TM06KoS-AWS0LF0iws')

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create context for medical/pharmacy assistant
    const medicalContext = `You are an AI Doctor assistant for a pharmacy management system. You help customers with:
- Medical questions and health advice
- Medicine information and alternatives
- Prescription analysis
- Home remedies and general health tips
- Drug interactions and side effects

IMPORTANT FORMATTING RULES:
- Always format your responses with clear bullet points using • symbols
- Use numbered lists (1., 2., 3.) for step-by-step instructions
- Use **bold text** for important information like medicine names, dosages, warnings
- Use *italic text* for emphasis
- Use ## for main section headers and ### for sub-sections
- Break down complex information into easy-to-read sections
- Always include a "When to Consult a Doctor" section for medical advice
- Keep responses concise but comprehensive
- Use proper line breaks and spacing for readability
- You have to give very crisp response for without confusion.
Always provide helpful, accurate medical information while reminding users to consult healthcare professionals for serious medical concerns. Be friendly, professional, and informative.`

    // Build conversation history
    let conversationHistory = medicalContext + '\n\n'
    
    if (history.length > 0) {
      conversationHistory += 'Previous conversation:\n'
      history.forEach((msg: any) => {
        conversationHistory += `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content}\n`
      })
      conversationHistory += '\n'
    }

    conversationHistory += `Current user question: ${message}`

    // Generate response
    const result = await model.generateContent(conversationHistory)
    const response = await result.response
    const aiResponse = response.text()

    return NextResponse.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Chat Error:', error)
    
    // Fallback response if AI fails
    const fallbackResponses = [
      "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      "I'm having trouble processing your request right now. Could you please rephrase your question?",
      "There seems to be a temporary issue with my AI system. Please try again shortly.",
      "I'm currently unable to process your request. Please consult with a healthcare professional for immediate medical concerns."
    ]
    
    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    
    return NextResponse.json({
      success: false,
      response: randomFallback,
      timestamp: new Date().toISOString(),
      error: 'AI service temporarily unavailable'
    })
  }
}
