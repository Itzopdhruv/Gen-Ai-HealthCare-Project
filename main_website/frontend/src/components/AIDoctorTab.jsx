import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Upload, 
  message, 
  Spin, 
  Typography, 
  Space,
  Tooltip,
  Modal,
  Dropdown,
  Menu,
  Empty
} from 'antd';
import { 
  SendOutlined, 
  AudioOutlined,
  CameraOutlined, 
  RobotOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  CloseOutlined,
  UserOutlined,
  HistoryOutlined,
  SoundOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { aiDoctorAPI } from '../services/api';
import api from '../services/api';
import './AIDoctorTab.css';

const { TextArea } = Input;
const { Text } = Typography;

const AIDoctorTab = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [loadingAudioId, setLoadingAudioId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState({});
  
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesRef = useRef(messages);
  const preventClear = useRef(false);
  const audioRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  
  // Wrapper for setMessages with logging
  const updateMessages = (newMessages) => {
    console.log('🔄 updateMessages called with:', newMessages);
    console.trace('Called from:');
    
    // Prevent clearing if protection is enabled
    if (preventClear.current && Array.isArray(newMessages) && newMessages.length === 0) {
      console.error('🚫 BLOCKED attempt to clear messages!');
      return;
    }
    
    // Additional safety: if we have messages in ref and trying to set fewer, keep the ref
    if (preventClear.current && messagesRef.current.length > 0 && 
        (!newMessages || newMessages.length < messagesRef.current.length)) {
      console.warn('⚠️ Trying to reduce messages from', messagesRef.current.length, 'to', newMessages?.length || 0);
      console.warn('⚠️ Keeping existing messages instead');
      return;
    }
    
    setMessages(newMessages);
  };
  
  // Keep messages ref in sync
  useEffect(() => {
    const previousLength = messagesRef.current.length;
    messagesRef.current = messages;
    console.log(`✅ Messages: ${previousLength} → ${messages.length}`, messages);
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        message.info('🎤 Listening...');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTextInput(transcript);
        setIsListening(false);
        message.success('✅ Voice captured');
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        message.error('❌ Voice recognition failed');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognition);
    }
  }, []);

  // Load chat history from localStorage and backend on mount
  useEffect(() => {
    // Load from localStorage first (instant)
    const savedChats = localStorage.getItem('aiDoctorChats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        setChatHistory(parsedChats);
        console.log('📂 Loaded chats from localStorage:', parsedChats.length);
      } catch (error) {
        console.error('Error parsing saved chats:', error);
      }
    }
    
    // Then load from backend (background sync)
    loadChatHistory();
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      try {
        localStorage.setItem('aiDoctorChats', JSON.stringify(chatHistory));
        console.log('💾 Saved', chatHistory.length, 'chats to localStorage');
      } catch (error) {
        console.error('Error saving chats to localStorage:', error);
      }
    }
  }, [chatHistory]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      console.log('📡 Fetching chat history from backend...');
      const response = await api.get('/ai-doctor-chat/chats');
      console.log('📡 Backend response:', response.data);
      
      if (response.data.success) {
        const backendChats = response.data.chats;
        
        // Merge with existing local chats (keep local ones not in backend)
        setChatHistory(prevHistory => {
          const localChats = prevHistory.filter(chat => chat.isLocal);
          const allChats = [...backendChats, ...localChats];
          
          // Remove duplicates based on _id
          const uniqueChats = allChats.filter((chat, index, self) =>
            index === self.findIndex(c => c._id === chat._id)
          );
          
          // Sort by lastUpdated
          return uniqueChats.sort((a, b) => 
            new Date(b.lastUpdated) - new Date(a.lastUpdated)
          );
        });
        
        console.log('✅ Synced with backend:', backendChats.length, 'chats from server');
        console.log('📊 Total chats after merge:', chatHistory.length);
      }
    } catch (error) {
      console.error('❌ Backend API Error:', error.response?.status, error.response?.data);
      console.error('❌ Full error:', error);
      console.warn('⚠️ Using local storage only - backend unavailable');
    }
  };

  const startNewChat = async () => {
    try {
      // Create a completely new chat and clear everything
      const newChat = {
        _id: Date.now().toString(),
        title: 'New Conversation',
        messages: [],
        lastUpdated: new Date(),
        isLocal: true
      };
      
      setCurrentChat(newChat);
      
      // Disable protection to allow clearing
      preventClear.current = false;
      setMessages([]);
      
      // Add to history
      setChatHistory([newChat, ...chatHistory]);
      
      message.success('✨ New conversation started');
    } catch (error) {
      console.error('Error creating new chat:', error);
      message.error('Failed to start new chat');
    }
  };

  const loadChat = async (chatId) => {
    try {
      // Find chat in local history first
      const localChat = chatHistory.find(c => c._id === chatId);
      
      if (localChat && localChat.isLocal) {
        // If it's a local chat, just use it directly
        console.log('Loading local chat:', localChat);
        setCurrentChat(localChat);
        setMessages(localChat.messages || []);
        return;
      }
      
      // Try to load from backend
      const response = await api.get(`/ai-doctor-chat/chats/${chatId}`);
      if (response.data.success) {
        const chat = response.data.chat;
        setCurrentChat(chat);
        
        // Disable protection temporarily to allow loading different chat
        preventClear.current = false;
        setMessages(chat.messages || []);
        
        // Re-enable if messages exist
        if (chat.messages && chat.messages.length > 0) {
          preventClear.current = true;
        }
      }
    } catch (error) {
      console.error('Error loading chat from backend:', error);
      
      // Fallback: use local version if available
      const localChat = chatHistory.find(c => c._id === chatId);
      if (localChat) {
        console.log('Using local fallback for chat:', localChat);
        setCurrentChat(localChat);
        
        preventClear.current = false;
        setMessages(localChat.messages || []);
        
        if (localChat.messages && localChat.messages.length > 0) {
          preventClear.current = true;
        }
        
        message.warning('Loaded chat from local storage');
      } else {
        message.error('Failed to load chat');
      }
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    Modal.confirm({
      title: 'Delete conversation?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const chatToDelete = chatHistory.find(c => c._id === chatId);
          
          // Remove from local history immediately
          setChatHistory(chatHistory.filter(chat => chat._id !== chatId));
          
          // If it's the current chat, clear it
          if (currentChat?._id === chatId) {
            setCurrentChat(null);
            preventClear.current = false;
            setMessages([]);
          }
          
          // Try to delete from backend if it's not local
          if (chatToDelete && !chatToDelete.isLocal) {
            api.delete(`/ai-doctor-chat/chats/${chatId}`).catch(err => {
              console.warn('Could not delete from backend:', err);
            });
          }
          
          message.success('Chat deleted');
        } catch (error) {
          console.error('Error deleting chat:', error);
          message.error('Failed to delete chat');
        }
      }
    });
  };

  const updateChatTitle = async (chatId, newTitle) => {
    try {
      // Update locally first
      setChatHistory(chatHistory.map(chat => 
        chat._id === chatId ? { ...chat, title: newTitle } : chat
      ));
      
      if (currentChat?._id === chatId) {
        setCurrentChat({ ...currentChat, title: newTitle });
      }
      
      setEditingChatId(null);
      setEditingTitle('');
      
      // Try to update backend in background
      const chatToUpdate = chatHistory.find(c => c._id === chatId);
      if (chatToUpdate && !chatToUpdate.isLocal) {
        api.put(`/ai-doctor-chat/chats/${chatId}/title`, { title: newTitle }).catch(err => {
          console.warn('Could not update title in backend:', err);
        });
      }
      
      message.success('Title updated');
    } catch (error) {
      console.error('Error updating chat title:', error);
      message.error('Failed to update title');
    }
  };

  const handleVoiceInput = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      message.error('Voice recognition not supported');
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Please upload an image file');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Image must be smaller than 10MB');
      return false;
    }
    
    setImageFile(file);
    message.success('📸 Image uploaded');
    return false;
  };

  const handleSubmit = async () => {
    if (!textInput.trim() && !imageFile) {
      message.warning('Please enter a message or upload an image');
      return;
    }

      // Create new chat if none exists (WITHOUT clearing messages)
    let chatToUse = currentChat;
    if (!chatToUse) {
      console.log('Creating new chat WITHOUT clearing messages');
      const newChat = {
        _id: Date.now().toString(),
        title: 'New Conversation',
        messages: [],
        lastUpdated: new Date(),
        isLocal: true
      };
      setCurrentChat(newChat);
      
      // Add to chat history
      const updatedHistory = [newChat, ...chatHistory];
      setChatHistory(updatedHistory);
      
      chatToUse = newChat;
      // DO NOT call setMessages([]) here - keep existing messages!
    }

    setIsLoading(true);
    
    try {
      // Prepare user message
      const userMessage = {
        type: 'user',
        content: textInput.trim() || '📸 Image uploaded',
        timestamp: new Date(),
        hasImage: !!imageFile
      };
      
      // Save the text input before clearing
      const savedTextInput = textInput.trim();
      const savedImageFile = imageFile;
      
      // Clear input immediately
      setTextInput('');
      setImageFile(null);

      // Add user message to UI - use current messages from ref
      const currentMessages = messagesRef.current;
      const updatedMessages = [...currentMessages, userMessage];
      
      // Enable protection against clearing messages
      preventClear.current = true;
      
      updateMessages(updatedMessages);
      console.log('📝 Messages after adding user message:', updatedMessages);
      console.log('🔒 Message protection ENABLED');

      // Prepare request data using the updated messages
      const requestData = {
        textInput: savedTextInput || null,
        conversationHistory: currentMessages.map(msg => ({
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp,
          hasImage: msg.hasImage || false
        }))
      };
      
      // Convert image if provided
      if (savedImageFile) {
        requestData.imageFile = await convertFileToBase64(savedImageFile);
      }

      // Add generating message
      const generatingMessage = {
        type: 'doctor',
        content: 'AI Doctor is analyzing...',
        timestamp: new Date(),
        isGenerating: true
      };
      
      const messagesWithGenerating = [...updatedMessages, generatingMessage];
      updateMessages(messagesWithGenerating);
      console.log('⏳ Messages with generating:', messagesWithGenerating);

      // Call AI Doctor API
      const response = await aiDoctorAPI.analyzeMedicalInput(requestData);
      
      if (response.success) {
        const doctorMessage = {
          type: 'doctor',
          content: response.data.analysis || response.data.doctor_response,
          timestamp: new Date()
        };
        
        // Replace generating message with actual response
        const finalMessages = [...updatedMessages, doctorMessage];
        updateMessages(finalMessages);
        console.log('✅ Final messages:', finalMessages);
        
        // Update current chat with messages for local storage
        if (currentChat) {
          const updatedChat = {
            ...currentChat,
            messages: finalMessages,
            lastUpdated: new Date(),
            title: currentChat.title === 'New Conversation' 
              ? (userMessage.content.substring(0, 50) + (userMessage.content.length > 50 ? '...' : ''))
              : currentChat.title
          };
          setCurrentChat(updatedChat);
          
          // Update in chat history
          setChatHistory(chatHistory.map(chat => 
            chat._id === currentChat._id ? updatedChat : chat
          ));
        }

        // Save chat to database (DON'T let it affect UI messages)
        if (currentChat && currentChat.isLocal) {
          // Save in background, don't wait
          api.post('/ai-doctor-chat/chats', {
            title: userMessage.content.substring(0, 50) + (userMessage.content.length > 50 ? '...' : ''),
            messages: finalMessages
          }).then(saveResponse => {
            if (saveResponse.data.success) {
              const savedChat = saveResponse.data.chat;
              setCurrentChat(savedChat);
              setChatHistory([savedChat, ...chatHistory.filter(c => c._id !== currentChat._id)]);
              console.log('💾 Chat saved to backend');
            }
          }).catch(saveError => {
            console.warn('⚠️ Could not save chat to backend (messages still visible):', saveError);
          });
        } else if (currentChat && !currentChat.isLocal) {
          // Update in background
          Promise.all([
            api.post(`/ai-doctor-chat/chats/${currentChat._id}/messages`, userMessage),
            api.post(`/ai-doctor-chat/chats/${currentChat._id}/messages`, doctorMessage)
          ]).then(() => {
            loadChatHistory();
            console.log('💾 Messages updated in backend');
          }).catch(updateError => {
            console.warn('⚠️ Could not update chat in backend (messages still visible):', updateError);
          });
        }

        message.success('✅ Response received');
      } else {
        const errorMessage = {
          type: 'doctor',
          content: '❌ Analysis failed. Please try again.',
          timestamp: new Date(),
          isError: true
        };
        
        // Remove generating message and add error
        const messagesWithError = [...updatedMessages, errorMessage];
        updateMessages(messagesWithError);
        console.log('❌ Messages with error:', messagesWithError);
        message.error('Analysis failed');
      }
      
    } catch (error) {
      console.error('AI Doctor error:', error);
      
      const errorMessage = {
        type: 'doctor',
        content: '❌ Failed to get response. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      
      const currentMessages = [...messages];
      updateMessages([...currentMessages, userMessage, errorMessage]);
      console.log('💥 Messages after error:', [...currentMessages, userMessage, errorMessage]);
      message.error('Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-Speech function with language support
  const handleSpeak = async (messageContent, messageId, language = 'en') => {
    try {
      console.log('🔊 Speaking:', { messageId, language, textLength: messageContent.length });
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Stop any Web Speech API synthesis
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // If already speaking this message in this language, stop it
      const speakingKey = `${messageId}-${language}`;
      if (speakingMessageId === speakingKey) {
        setSpeakingMessageId(null);
        return;
      }

      setLoadingAudioId(speakingKey);
      
      console.log(`🎙️ Requesting ${language === 'hi' ? 'Hindi' : 'English'} TTS from FastAPI...`);

      // Try FastAPI TTS first (better quality)
      try {
        const formData = new FormData();
        formData.append('text', messageContent);
        formData.append('lang', language); // Pass language code
        formData.append('speed', '1.67'); // Pass speed (67% faster)
        
        const AI_DOCTOR_URL = import.meta.env.VITE_AI_DOCTOR_URL || 'https://ai-doctor-genai.onrender.com';
        const response = await fetch(`${AI_DOCTOR_URL}/text-to-speech`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ FastAPI response:', data);
          
          if (data.success && data.audio_file) {
            // Play the audio file
            const audioUrl = `${AI_DOCTOR_URL}/audio/${data.audio_file.split('/').pop()}`;
            console.log(`🎵 Playing audio: ${audioUrl}`);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            
            audio.onplay = () => {
              setLoadingAudioId(null);
              setSpeakingMessageId(speakingKey);
            };
            
            audio.onended = () => {
              setSpeakingMessageId(null);
              audioRef.current = null;
            };
            
            audio.onerror = () => {
              console.warn('FastAPI audio playback failed, falling back to Web Speech API');
              setLoadingAudioId(null);
              useBrowserTTS(messageContent, messageId, language);
            };
            
            await audio.play();
            return;
          }
        }
      } catch (fastAPIError) {
        console.warn(`⚠️ FastAPI TTS unavailable for ${language}, using browser TTS:`, fastAPIError.message);
      }

      // Fallback to browser Web Speech API
      console.log(`🌐 Using browser TTS with language: ${language === 'hi' ? 'hi-IN' : 'en-US'}`);
      useBrowserTTS(messageContent, messageId, language);
      
    } catch (error) {
      console.error('TTS Error:', error);
      message.error('Failed to play audio');
      setSpeakingMessageId(null);
      setLoadingAudioId(null);
    }
  };

  // Browser-based TTS fallback with language support
  const useBrowserTTS = (text, messageId, language = 'en') => {
    if (!window.speechSynthesis) {
      message.error('Text-to-speech not supported in this browser');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 1.67; // Much faster speed (67% faster than normal)
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US'; // Set language
    
    // Try to select a good voice for the language
    const voices = window.speechSynthesis.getVoices();
    const languagePrefix = language === 'hi' ? 'hi' : 'en';
    
    console.log(`🔍 Available voices for ${languagePrefix}:`, 
      voices.filter(v => v.lang.startsWith(languagePrefix)).map(v => `${v.name} (${v.lang})`)
    );
    
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(languagePrefix) && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith(languagePrefix));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log(`✅ Selected voice: ${preferredVoice.name} (${preferredVoice.lang})`);
    } else {
      console.log(`⚠️ No ${languagePrefix} voice found, using default`);
    }

    const speakingKey = `${messageId}-${language}`;
    utterance.onstart = () => {
      setLoadingAudioId(null);
      setSpeakingMessageId(speakingKey);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setSpeakingMessageId(null);
      setLoadingAudioId(null);
    };

    window.speechSynthesis.speak(utterance);
    speechSynthesisRef.current = utterance;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="ai-doctor-container">
      {/* Exit Full Screen Button */}
      {onClose && (
        <Tooltip title="Exit AI Doctor" placement="left">
          <Button
            className="exit-fullscreen-btn"
            icon={<CloseOutlined />}
            onClick={onClose}
            shape="circle"
            size="large"
          />
        </Tooltip>
      )}
      
      {/* Sidebar - Chat History */}
      <div className={`chat-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={startNewChat}
            className="new-chat-btn"
            block
          >
            New Chat
          </Button>
        </div>

        <div className="chat-list">
          {chatHistory.length === 0 ? (
            <Empty 
              description="No conversations yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat._id}
                className={`chat-item ${currentChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => loadChat(chat._id)}
              >
                {editingChatId === chat._id ? (
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onPressEnter={() => updateChatTitle(chat._id, editingTitle)}
                    onBlur={() => updateChatTitle(chat._id, editingTitle)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="chat-item-content">
                      <HistoryOutlined className="chat-icon" />
                      <Text className="chat-title" ellipsis>{chat.title}</Text>
                    </div>
                    <div className="chat-item-actions">
                      <Tooltip title="Edit">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(chat._id);
                            setEditingTitle(chat.title);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => deleteChat(chat._id, e)}
                          danger
                        />
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <Button
          className="sidebar-toggle"
          icon={sidebarCollapsed ? <MoreOutlined /> : <CloseOutlined />}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {messages.length === 0 && !preventClear.current ? (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <RobotOutlined />
            </div>
            <h1 className="welcome-title">AI Doctor</h1>
            <p className="welcome-subtitle">
              Your intelligent medical assistant powered by advanced AI
            </p>
            <div className="capabilities">
              <div className="capability-card">
                <CameraOutlined />
                <span>Image Analysis</span>
              </div>
              <div className="capability-card">
                <AudioOutlined />
                <span>Voice Input</span>
              </div>
              <div className="capability-card">
                <SendOutlined />
                <span>Text Chat</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {/* Use messagesRef as fallback if messages is empty but protection is on */}
            {(messages.length > 0 ? messages : messagesRef.current).map((msg, index) => (
              <div key={`${msg.timestamp}-${index}`} className={`message ${msg.type}`}>
                <div className="message-avatar">
                  {msg.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                </div>
                <div className="message-content">
                  {msg.isGenerating ? (
                    <div className="generating">
                      <Spin size="small" />
                      <span>{msg.content}</span>
                    </div>
                  ) : (
                    <>
                      <div className={`message-text ${msg.isError ? 'error' : ''}`}>
                        {msg.content}
                      </div>
                      <div className="message-time">
                        {formatTime(msg.timestamp)}
                        {msg.type === 'doctor' && !msg.isError && (
                          <div className="audio-output-container">
                            <span className="audio-label">Audio Output:</span>
                            <div className="language-tabs">
                              <button
                                className={`lang-tab ${(selectedLanguage[`${msg.timestamp}-${index}`] || 'en') === 'en' ? 'active' : ''}`}
                                onClick={() => setSelectedLanguage(prev => ({ ...prev, [`${msg.timestamp}-${index}`]: 'en' }))}
                              >
                                EN
                              </button>
                              <button
                                className={`lang-tab ${selectedLanguage[`${msg.timestamp}-${index}`] === 'hi' ? 'active' : ''}`}
                                onClick={() => setSelectedLanguage(prev => ({ ...prev, [`${msg.timestamp}-${index}`]: 'hi' }))}
                              >
                                HI
                              </button>
                            </div>
                            <Tooltip title={
                              speakingMessageId === `${msg.timestamp}-${index}-${selectedLanguage[`${msg.timestamp}-${index}`] || 'en'}` 
                                ? 'Stop' 
                                : `Listen in ${(selectedLanguage[`${msg.timestamp}-${index}`] || 'en') === 'en' ? 'English' : 'Hindi'}`
                            }>
                              <Button
                                type="text"
                                size="small"
                                className="speak-btn"
                                icon={
                                  loadingAudioId === `${msg.timestamp}-${index}-${selectedLanguage[`${msg.timestamp}-${index}`] || 'en'}` ? (
                                    <LoadingOutlined />
                                  ) : (
                                    <SoundOutlined 
                                      style={{ 
                                        color: speakingMessageId === `${msg.timestamp}-${index}-${selectedLanguage[`${msg.timestamp}-${index}`] || 'en'}` ? '#667eea' : 'inherit'
                                      }} 
                                    />
                                  )
                                }
                                onClick={() => handleSpeak(msg.content, `${msg.timestamp}-${index}`, selectedLanguage[`${msg.timestamp}-${index}`] || 'en')}
                              />
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="input-area">
          {imageFile && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setImageFile(null)}
                  className="remove-image"
                />
              </div>
            </div>
          )}
          
          <div className="input-box">
            <div className="input-actions">
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Tooltip title="Upload Image">
                  <Button 
                    type="text" 
                    icon={<CameraOutlined />}
                    className="action-btn"
                  />
                </Tooltip>
              </Upload>

              <Tooltip title={isListening ? "Stop" : "Voice Input"}>
                <Button
                  type="text"
                  icon={<AudioOutlined />}
                  onClick={handleVoiceInput}
                  className={`action-btn ${isListening ? 'listening' : ''}`}
                />
              </Tooltip>
            </div>

            <TextArea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ask me anything about your health..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={(e) => {
                if (e.shiftKey) return;
                e.preventDefault();
                handleSubmit();
              }}
              className="message-input"
            />

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!textInput.trim() && !imageFile}
              className="send-btn"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDoctorTab;
