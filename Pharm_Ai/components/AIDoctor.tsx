'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Mic, 
  Camera, 
  Send, 
  Settings, 
  Bell,
  LogOut,
  Volume2,
  Trash2
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: string
  isImage?: boolean
}

interface AIDoctorProps {
  onClose: () => void
  onLogout: () => void
}

const AIDoctor = ({ onClose, onLogout }: AIDoctorProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Doctor assistant. I can help you with medical questions, analyze prescription images, suggest medicine alternatives, and provide home remedies. How can I assist you today?',
      timestamp: '1:45:48 AM'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newMessage])
    const currentInput = inputValue
    setInputValue('')

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: 'Thinking...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages.slice(0, -1) // Exclude the loading message
        })
      })

      const data = await response.json()

      // Remove loading message and add AI response
      setMessages(prev => {
        const withoutLoading = prev.slice(0, -1)
        const aiResponse: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: data.response || 'I apologize, but I encountered an error processing your request.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        return [...withoutLoading, aiResponse]
      })

    } catch (error) {
      console.error('AI Chat Error:', error)
      
      // Remove loading message and add error response
      setMessages(prev => {
        const withoutLoading = prev.slice(0, -1)
        const errorResponse: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        return [...withoutLoading, errorResponse]
      })
    }
  }

  const handleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice input logic would go here
  }

  const handleImageUpload = () => {
    // Image upload logic would go here
    console.log('Image upload triggered')
  }

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Doctor assistant. I can help you with medical questions, analyze prescription images, suggest medicine alternatives, and provide home remedies. How can I assist you today?',
      timestamp: '1:45:48 AM'
    }])
  }

  const testSpeech = () => {
    // Speech synthesis logic would go here
    console.log('Testing speech synthesis')
  }

  // Helper function to format AI responses with proper styling
  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to HTML
    let formatted = content
      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert bullet points (• and -)
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Convert numbered lists
      .replace(/^(\d+)\. (.+)$/gm, '<li><strong>$1.</strong> $2</li>')
      // Convert section headers
      .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="font-bold text-gray-900 mt-4 mb-2">$1</h2>')
      // Convert line breaks
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br>')
    
    // Wrap in paragraph tags and add proper structure
    formatted = `<div class="prose prose-sm max-w-none"><p class="mb-2">${formatted}</p></div>`
    
    return formatted
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">AI Doctor</h2>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-white/20 rounded">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-white/20 rounded">
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <button 
            onClick={testSpeech}
            className="hover:underline flex items-center space-x-1"
          >
            <Volume2 className="w-3 h-3" />
            <span>Test Speech</span>
          </button>
          <button 
            onClick={clearChat}
            className="hover:underline flex items-center space-x-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`${message.type === 'user' ? 'max-w-xs chat-bubble-user' : 'max-w-4xl chat-bubble-ai-full'}`}>
                {message.type === 'ai' ? (
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your medical question here..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVoiceInput}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isListening 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Mic className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleImageUpload}
                className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            </div>
            
            <button 
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors duration-200"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIDoctor
