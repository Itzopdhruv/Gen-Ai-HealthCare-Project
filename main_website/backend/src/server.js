 import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before any other imports
const envPath = path.resolve(process.cwd(), '.env');
console.log('📁 Looking for .env file at:', envPath);
console.log('📁 Current working directory:', process.cwd());
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.warn('⚠️  .env file not found, using default values:', result.error.message);
} else {
  console.log('✅ .env file loaded successfully');
  console.log('📦 Parsed values:', result.parsed);
}

// Set GROQ_API_KEY for testing if not in environment (development only)
if (!process.env.GROQ_API_KEY && process.env.NODE_ENV !== 'production') {
  process.env.GROQ_API_KEY = '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';
  console.log('🔧 Set GROQ_API_KEY for testing (development mode)');
}

// Debug: Check if API keys are loaded
console.log('🔍 Environment check:');
console.log('PORT:', process.env.PORT);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'undefined');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 10)}...` : 'undefined');

// Now import everything else
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { initializeRateLimiter, getRateLimiter } from './services/rateLimiterService.js';

// Import routes
import authRoutes from './routes/auth.js';
import patientAuthRoutes from './routes/patientAuth.js';
import patientRoutes from './routes/patient.js';
import patientAccessRoutes from './routes/patientAccess.js';
import medicalHistoryRoutes from './routes/medicalHistory.js';
import prescriptionRoutes from './routes/prescription.js';
import reportRoutes from './routes/reports.js';
import aiAssistantRoutes from './routes/aiAssistant.js';
import aiDoctorRoutes from './routes/aiDoctor.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import adminAppointmentRoutes from './routes/adminAppointmentRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import recordingRoutes from './routes/recordingRoutes.js';
import healthMetricsRoutes from './routes/healthMetrics.js';
import securityRoutes from './routes/securityRoutes.js';
import twoFactorAuthRoutes from './routes/twoFactorAuth.js';
import accessLogsRoutes from './routes/accessLogs.js';
import aiDoctorChatRoutes from './routes/aiDoctorChat.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { logAccess, logLoginAttempt, updateLoginStatus, logLogout } from './middleware/accessLogging.js';
import { summarizeReportWithGemini, testGeminiPrompt } from './services/geminiService.js';
import { addMigrationEndpoint } from './utils/migrateJitsiIds.js';
import { addFixEndpoint } from './utils/fixAppointmentMeetingIds.js';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - Dynamic rate limiter
const limiter = initializeRateLimiter();
app.use(limiter);

// Apply access logging middleware to all routes
app.use(logAccess);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://*.vercel.app',
      'https://*.netlify.app',
      // Additional Vercel patterns for better compatibility
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.vercel\.dev$/,
      'https://vercel.app'
    ].filter(Boolean);
    
    if (allowedOrigins.some(allowedOrigin => {
      // Handle regex patterns
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      // Handle string patterns with wildcards
      if (typeof allowedOrigin === 'string' && allowedOrigin.includes('*')) {
        return origin.includes(allowedOrigin.replace('*', ''));
      }
      // Handle exact matches
      return origin === allowedOrigin;
    })) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'X-HTTP-Method-Override',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://premyadavptts_db_user:qUoeB8QVKwigzaMt@cluster4.leu26pe.mongodb.net/';
    
    await mongoose.connect(mongoURI, {
      // Remove deprecated options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will continue without database connection');
    console.log('💡 To fix: Add your IP address to MongoDB Atlas Network Access');
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient-auth', patientAuthRoutes);
console.log('✅ Mounted routes: /api/auth, /api/patient-auth');
app.use('/api/patient', patientRoutes);
app.use('/api/patient-access', patientAccessRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/ai-doctor', aiDoctorRoutes);
app.use('/api/ai-doctor-chat', aiDoctorChatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin/appointments', adminAppointmentRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/health-metrics', healthMetricsRoutes);
app.use('/api/admin/security', securityRoutes);
app.use('/api/auth/2fa', twoFactorAuthRoutes);
app.use('/api/admin/security', accessLogsRoutes);

// CORS configuration for file uploads
app.use('/api/recordings', cors(corsOptions));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'AayuLink API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Patient auth health check
app.get('/api/health/patient-auth', (req, res) => {
  res.json({ success: true, route: '/api/patient-auth', methods: ['POST /request-otp', 'POST /verify-otp'] });
});

// Gemini health check
app.get('/api/health/gemini', async (req, res) => {
  try {
    const text = await summarizeReportWithGemini({
      title: 'Health Check',
      documentType: 'other',
      ocrText: 'Sample text',
      structuredData: { diagnosis: 'Sample' }
    });
    const usedRealKey = process.env.GEMINI_API_KEY && !/DUMMY_GEMINI_API_KEY_REPLACE_ME/i.test(process.env.GEMINI_API_KEY);
    res.json({ success: true, usedRealKey, sample: text?.slice(0, 120) });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Gemini failed' });
  }
});

// Direct Gemini test endpoint
app.get('/api/health/gemini-test', async (req, res) => {
  try {
    const prompt = req.query.q || 'Say hello from Gemini';
    const text = await testGeminiPrompt(prompt);
    res.json({ success: true, text: text.slice(0, 500) });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Gemini test failed' });
  }
});

// Database health endpoint
app.get('/api/health/db', (req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    success: true,
    mongo: {
      readyState: state,
      status: stateMap[state] || 'unknown'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message 
  });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Add migration endpoint for Jitsi IDs
addMigrationEndpoint(app);

// Add fix endpoint for appointment meeting IDs
addFixEndpoint(app);

server.listen(PORT, () => {
  console.log(`🚀 AayuLink Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  
  // Check Google Cloud configuration
  const hasGoogleCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasGoogleProjectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  
  if (!hasGoogleCredentials || !hasGoogleProjectId) {
    console.log(`\n⚠️  GOOGLE CLOUD SPEECH-TO-TEXT NOT CONFIGURED`);
    console.log(`   This means audio recordings will use mock transcription instead of real speech recognition`);
    console.log(`   To enable real transcription, add to your .env file:`);
    if (!hasGoogleCredentials) console.log(`   - GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json`);
    if (!hasGoogleProjectId) console.log(`   - GOOGLE_CLOUD_PROJECT_ID=your-project-id`);
    console.log(`\n`);
  } else {
    console.log(`✅ Google Cloud Speech-to-Text configured`);
  }
});
