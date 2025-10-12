import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'doctor'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  hasImage: {
    type: Boolean,
    default: false
  },
  hasAudio: {
    type: Boolean,
    default: false
  }
});

const aiDoctorChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [messageSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  summary: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Update lastUpdated when messages are added
aiDoctorChatSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  
  // Auto-generate title from first user message if it's still "New Conversation"
  if (this.title === 'New Conversation' && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(msg => msg.type === 'user');
    if (firstUserMessage) {
      // Take first 50 characters of first message as title
      this.title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
    }
  }
  
  next();
});

// Static method to get user's chat history
aiDoctorChatSchema.statics.getUserChats = async function(userId) {
  return this.find({ userId })
    .sort({ lastUpdated: -1 })
    .select('_id title lastUpdated messages')
    .limit(50);
};

// Static method to get chat by ID
aiDoctorChatSchema.statics.getChatById = async function(chatId, userId) {
  return this.findOne({ _id: chatId, userId });
};

const AIDoctorChat = mongoose.model('AIDoctorChat', aiDoctorChatSchema);

export default AIDoctorChat;

