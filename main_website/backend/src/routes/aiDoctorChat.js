import express from 'express';
import AIDoctorChat from '../models/AIDoctorChat.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all chat history for a user
router.get('/chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await AIDoctorChat.getUserChats(userId);
    
    res.json({
      success: true,
      chats: chats
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
});

// Get a specific chat by ID
router.get('/chats/:chatId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    
    const chat = await AIDoctorChat.getChatById(chatId, userId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    res.json({
      success: true,
      chat: chat
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: error.message
    });
  }
});

// Create a new chat
router.post('/chats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, messages } = req.body;
    
    console.log('Creating chat for user:', userId);
    console.log('Title:', title);
    console.log('Messages:', messages);
    
    const newChat = new AIDoctorChat({
      userId,
      title: title || 'New Conversation',
      messages: messages || []
    });
    
    await newChat.save();
    
    console.log('Chat created successfully:', newChat._id);
    
    res.json({
      success: true,
      chat: newChat
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message
    });
  }
});

// Add a message to a chat
router.post('/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { type, content, hasImage, hasAudio } = req.body;
    
    const chat = await AIDoctorChat.findOne({ _id: chatId, userId });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    chat.messages.push({
      type,
      content,
      hasImage: hasImage || false,
      hasAudio: hasAudio || false,
      timestamp: new Date()
    });
    
    await chat.save();
    
    res.json({
      success: true,
      chat: chat
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: error.message
    });
  }
});

// Delete a chat
router.delete('/chats/:chatId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    
    const result = await AIDoctorChat.deleteOne({ _id: chatId, userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: error.message
    });
  }
});

// Update chat title
router.put('/chats/:chatId/title', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { title } = req.body;
    
    const chat = await AIDoctorChat.findOne({ _id: chatId, userId });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    chat.title = title;
    await chat.save();
    
    res.json({
      success: true,
      chat: chat
    });
  } catch (error) {
    console.error('Error updating chat title:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat title',
      error: error.message
    });
  }
});

export default router;

