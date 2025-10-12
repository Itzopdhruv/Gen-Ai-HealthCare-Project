import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { medicines } from '@/lib/database'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrCd7CjUyz6-dZ-TM06KoS-AWS0LF0iws')

interface ManagerNotificationRequest {
  medicineName: string
  requestedQuantity: number
  alternatives: any[]
  stockStatus: 'available' | 'partial' | 'unavailable'
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

interface ManagerNotificationResponse {
  success: boolean
  data?: {
    notification: {
      title: string
      message: string
      urgency: string
      actionRequired: string[]
      estimatedImpact: string
      recommendations: string[]
    }
    orderRequest?: {
      medicines: Array<{
        name: string
        genericName: string
        currentStock: number
        requiredQuantity: number
        priority: string
        supplier: string
        estimatedCost: number
      }>
      totalEstimatedCost: number
      deliveryTime: string
    }
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<ManagerNotificationResponse>> {
  try {
    const body: ManagerNotificationRequest = await request.json()
    const { 
      medicineName,
      requestedQuantity,
      alternatives,
      stockStatus,
      urgency
    } = body

    if (!medicineName || !requestedQuantity) {
      return NextResponse.json({ 
        success: false, 
        error: 'Medicine name and quantity are required' 
      }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create AI context for manager notification
    const aiContext = `You are a pharmacy management AI assistant. Your task is to create professional manager notifications for medicine stock issues and ordering requirements.

IMPORTANT RULES:
- Always provide **crisp, clear responses** without confusion
- Use **bullet points** for easy reading
- **Bold important information** like medicine names and urgent actions
- Provide **specific actionable recommendations**
- Include **cost estimates** and **delivery timelines**
- Consider **business impact** and **customer satisfaction**

Situation Analysis:
- **Requested Medicine**: ${medicineName}
- **Requested Quantity**: ${requestedQuantity} units
- **Stock Status**: ${stockStatus}
- **Urgency Level**: ${urgency}
- **Available Alternatives**: ${alternatives.length} found

Available Alternatives:
${alternatives.map(alt => `• ${alt.name} (${alt.genericName}) - Stock: ${alt.stock} - Price: $${alt.price}`).join('\n')}

Please create a comprehensive manager notification that includes:
1. **Clear Title** - Brief summary of the issue
2. **Detailed Message** - Explanation of the situation
3. **Urgency Assessment** - Why this needs attention
4. **Action Required** - Specific steps the manager should take
5. **Business Impact** - How this affects operations
6. **Recommendations** - Strategic suggestions for prevention
7. **Order Request** - If medicines need to be ordered, provide detailed ordering information

Format your response as:
## Manager Notification

### Title
[Clear, concise title]

### Message
[Detailed explanation of the situation]

### Urgency Assessment
[Why this needs immediate attention]

### Action Required
• [Specific action 1]
• [Specific action 2]
• [Specific action 3]

### Business Impact
[How this affects pharmacy operations and customer satisfaction]

### Recommendations
• [Strategic recommendation 1]
• [Strategic recommendation 2]
• [Strategic recommendation 3]

### Order Request (if applicable)
**Medicines to Order:**
• [Medicine 1] - Quantity: [X] - Priority: [High/Medium/Low] - Supplier: [Name] - Est. Cost: $[X]
• [Medicine 2] - Quantity: [X] - Priority: [High/Medium/Low] - Supplier: [Name] - Est. Cost: $[X]

**Total Estimated Cost**: $[X]
**Estimated Delivery Time**: [X days]
**Recommended Supplier**: [Name]`

    // Generate AI response
    const result = await model.generateContent(aiContext)
    const response = await result.response
    const aiNotification = response.text()

    // Process AI response to extract structured information
    const processedNotification = processAINotification(aiNotification, alternatives, medicineName, requestedQuantity)

    return NextResponse.json({
      success: true,
      data: processedNotification
    })

  } catch (error) {
    console.error('Manager Notification Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate manager notification' 
    }, { status: 500 })
  }
}

// Helper function to process AI notification response
function processAINotification(aiResponse: string, alternatives: any[], medicineName: string, requestedQuantity: number): any {
  // Extract title
  const titleMatch = aiResponse.match(/Title\s*\n([^\n]+)/i)
  const title = titleMatch ? titleMatch[1].trim() : `Stock Alert: ${medicineName} Unavailable`

  // Extract message
  const messageMatch = aiResponse.match(/Message\s*\n([\s\S]*?)(?=\n###|\n##|$)/i)
  const message = messageMatch ? messageMatch[1].trim() : `The requested medicine ${medicineName} (${requestedQuantity} units) is currently unavailable.`

  // Extract urgency
  const urgencyMatch = aiResponse.match(/Urgency Assessment\s*\n([\s\S]*?)(?=\n###|\n##|$)/i)
  const urgency = urgencyMatch ? urgencyMatch[1].trim() : 'High - Customer prescription cannot be fulfilled'

  // Extract action required
  const actionMatch = aiResponse.match(/Action Required\s*\n([\s\S]*?)(?=\n###|\n##|$)/i)
  const actionRequired = actionMatch ? 
    actionMatch[1].split('\n').map(line => line.replace(/^[•\-\*]\s*/, '').trim()).filter(line => line.length > 0) :
    ['Order required medicines immediately', 'Notify customer about delay', 'Update stock levels']

  // Extract business impact
  const impactMatch = aiResponse.match(/Business Impact\s*\n([\s\S]*?)(?=\n###|\n##|$)/i)
  const estimatedImpact = impactMatch ? impactMatch[1].trim() : 'Customer satisfaction may be affected due to prescription delays'

  // Extract recommendations
  const recommendationsMatch = aiResponse.match(/Recommendations\s*\n([\s\S]*?)(?=\n###|\n##|$)/i)
  const recommendations = recommendationsMatch ? 
    recommendationsMatch[1].split('\n').map(line => line.replace(/^[•\-\*]\s*/, '').trim()).filter(line => line.length > 0) :
    ['Implement automated stock alerts', 'Increase minimum stock levels', 'Establish backup suppliers']

  // Extract order request if present
  const orderRequestMatch = aiResponse.match(/Order Request[\s\S]*?Medicines to Order:([\s\S]*?)(?=\n###|\n##|$)/i)
  let orderRequest = null

  if (orderRequestMatch) {
    const medicinesToOrder = alternatives.filter(alt => alt.stock < requestedQuantity)
    const totalCost = medicinesToOrder.reduce((sum, med) => sum + (med.price * requestedQuantity), 0)

    orderRequest = {
      medicines: medicinesToOrder.map(med => ({
        name: med.name,
        genericName: med.genericName,
        currentStock: med.stock,
        requiredQuantity: requestedQuantity,
        priority: med.stock === 0 ? 'High' : 'Medium',
        supplier: med.supplier || 'Primary Supplier',
        estimatedCost: med.price * requestedQuantity
      })),
      totalEstimatedCost: totalCost,
      deliveryTime: '3-5 business days'
    }
  }

  return {
    notification: {
      title,
      message,
      urgency,
      actionRequired,
      estimatedImpact,
      recommendations
    },
    orderRequest
  }
}
