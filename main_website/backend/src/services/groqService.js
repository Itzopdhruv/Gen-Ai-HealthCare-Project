import dotenv from 'dotenv';
import Groq from 'groq-sdk';

// Load environment variables
dotenv.config();

// Initialize Groq client - moved inside function to ensure env vars are loaded
let groq = null;

// Get Groq model (using Llama 3.1 70B for best performance)
export const getGroqModel = () => {
  try {
    console.log('🔧 getGroqModel called');
    console.log('🔧 GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
    console.log('🔧 GROQ_API_KEY length:', process.env.GROQ_API_KEY?.length);
    
    if (!process.env.GROQ_API_KEY) {
      console.warn('❌ GROQ_API_KEY not found in environment variables');
      return null;
    }
    
    // Initialize Groq client here to ensure env vars are loaded
    if (!groq) {
      groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
        dangerouslyAllowBrowser: false
      });
      console.log('🔧 Groq client created with API key');
    }
    
    console.log('✅ Groq client initialized successfully');
    return groq;
  } catch (error) {
    console.error('❌ Error initializing Groq client:', error);
    return null;
  }
};

// Chat with Groq AI Assistant
export const chatWithGroq = async (messages, options = {}) => {
  try {
    const groqClient = getGroqModel();
    if (!groqClient) {
      throw new Error('Groq client not available');
    }

    const response = await groqClient.chat.completions.create({
      messages: messages,
      model: options.model || 'llama-3.1-8b-instant',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
      top_p: options.top_p || 1,
      stream: false
    });

    return response.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};

// Summarize medical report with Groq
export const summarizeReportWithGroq = async (reportContent, reportType = 'medical report') => {
  try {
    const groqClient = getGroqModel();
    if (!groqClient) {
      throw new Error('Groq client not available');
    }

    const messages = [
      {
        role: 'system',
        content: `You are a specialized medical AI assistant. Analyze the provided ${reportType} and provide a clear, concise summary focusing on:

1. Key medical findings and observations
2. Important values, measurements, or test results
3. Any concerning or abnormal findings
4. Recommendations or next steps if mentioned
5. Overall health status assessment

Format your response as bullet points for easy reading. Be professional and accurate.`
      },
      {
        role: 'user',
        content: `Please analyze this ${reportType}:\n\n${reportContent}`
      }
    ];

    const response = await groqClient.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.3, // Lower temperature for more consistent medical analysis
      max_tokens: 1500
    });

    return response.choices[0]?.message?.content || 'Unable to analyze the report';
  } catch (error) {
    console.error('Error summarizing report with Groq:', error);
    throw error;
  }
};

// Generate AI response for medical chat
export const generateMedicalResponse = async (userMessage, patientContext, chatHistory = []) => {
  try {
    console.log('🔧 generateMedicalResponse called with:', { userMessage, patientContext: !!patientContext, chatHistoryLength: chatHistory?.length });
    
    const groqClient = getGroqModel();
    console.log('🔧 Groq client status:', !!groqClient);
    
    if (!groqClient) {
      console.error('❌ Groq client not available');
      throw new Error('Groq client not available');
    }

    // Build context from patient data
    let patientSummary = '';
    if (patientContext.patientData) {
      patientSummary = `Patient: ${patientContext.patientData.name || 'Unknown'}
ABHA ID: ${patientContext.patientId}
Age: ${patientContext.patientData.age || 'N/A'}
Gender: ${patientContext.patientData.gender || 'N/A'}
Blood Type: ${patientContext.patientData.bloodType || 'N/A'}`;
    }

    // Build medical history context
    let medicalHistoryContext = '';
    if (patientContext.medicalHistory && patientContext.medicalHistory.length > 0) {
      medicalHistoryContext = `\nMedical History (${patientContext.medicalHistory.length} entries):\n`;
      patientContext.medicalHistory.slice(0, 5).forEach((entry, index) => {
        medicalHistoryContext += `${index + 1}. ${entry.entryType} - ${entry.summary} (${new Date(entry.date).toLocaleDateString()})\n`;
      });
    }

    // Build prescriptions context
    let prescriptionsContext = '';
    if (patientContext.prescriptions && patientContext.prescriptions.length > 0) {
      prescriptionsContext = `\nCurrent Prescriptions (${patientContext.prescriptions.length}):\n`;
      patientContext.prescriptions.slice(0, 5).forEach((prescription, index) => {
        prescriptionsContext += `${index + 1}. ${prescription.medications?.map(m => m.name).join(', ') || 'No medications listed'} (${new Date(prescription.issuedDate).toLocaleDateString()})\n`;
      });
    }

    // Build reports context
    let reportsContext = '';
    if (patientContext.reports && patientContext.reports.length > 0) {
      reportsContext = `\nMedical Reports (${patientContext.reports.length}):\n`;
      patientContext.reports.slice(0, 5).forEach((report, index) => {
        reportsContext += `${index + 1}. ${report.title} (${report.documentType}) - ${new Date(report.uploadedAt || report.uploadDate).toLocaleDateString()}\n`;
      });
    }

    // Build chat history context
    let chatHistoryContext = '';
    if (chatHistory && chatHistory.length > 0) {
      chatHistoryContext = '\nPrevious conversation:\n';
      chatHistory.slice(-5).forEach(msg => {
        chatHistoryContext += `${msg.type === 'user' ? 'Doctor' : 'AI'}: ${msg.content}\n`;
      });
    }

    const messages = [
      {
        role: 'system',
        content: `You are an AI medical assistant helping a doctor with patient information analysis. 

PATIENT INFORMATION:
${patientSummary}
${medicalHistoryContext}
${prescriptionsContext}
${reportsContext}

IMPORTANT INSTRUCTIONS:
- You can ONLY answer questions related to health, medical reports, and medical conditions
- If asked about non-medical topics, politely redirect to health topics
- Be helpful but always recommend consulting a healthcare professional for serious concerns
- Use the provided patient data to give relevant insights
- Keep responses concise and professional
- Format your response as exactly 5-7 crisp, readable bullet points with a line break after each point
- Each point should be clear, concise (1-2 sentences max), and focused on one key finding or recommendation

Structure your response like this with line breaks:
• Point 1: Key finding or observation

• Point 2: Critical concern or issue

• Point 3: Specific recommendation

• Point 4: Data gap or limitation

• Point 5: Next steps or follow-up needed

• Point 6: Additional context (if needed)

• Point 7: Urgent action required (if applicable)

Add a blank line after each bullet point for better readability.`
      },
      {
        role: 'user',
        content: `${chatHistoryContext}\n\nDoctor's Question: ${userMessage}`
      }
    ];

    const response = await groqClient.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0]?.message?.content || 'I apologize, but I couldn\'t process your request at the moment.';
  } catch (error) {
    console.error('Error generating medical response with Groq:', error);
    throw error;
  }
};

export default {
  getGroqModel,
  chatWithGroq,
  summarizeReportWithGroq,
  generateMedicalResponse
};
