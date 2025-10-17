# 🚀 AayuLink Backend Render Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Configuration Files Created
- ✅ `render.yaml` - Render service configuration
- ✅ `Procfile` - Alternative deployment configuration
- ✅ CORS configuration updated for production
- ✅ Environment variable handling improved

### 2. Code Fixes Applied
- ✅ Removed hardcoded API keys for production
- ✅ Updated CORS to support multiple origins
- ✅ Added proper error handling
- ✅ Environment variable validation

## 🔧 Render Deployment Steps

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### Step 2: Deploy on Render

#### Option A: Using render.yaml (Recommended)
1. **Go to [render.com](https://render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Select your repository**
5. **Render will automatically detect the render.yaml configuration**

#### Option B: Manual Configuration
1. **Go to [render.com](https://render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure manually:**
   - **Name**: `aayulink-backend`
   - **Root Directory**: `main_website/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables

In Render Dashboard → Environment Variables, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | Server port (Render will override) |
| `MONGODB_URI` | `your_mongodb_connection_string` | MongoDB connection |
| `JWT_SECRET` | `your_jwt_secret_key` | JWT signing secret |
| `FRONTEND_URL` | `https://your-frontend-url.vercel.app` | Frontend URL |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Google Gemini API key |
| `GROQ_API_KEY` | `your_groq_api_key` | Groq API key |
| `CLOUDINARY_CLOUD_NAME` | `your_cloudinary_name` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `your_cloudinary_key` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `your_cloudinary_secret` | Cloudinary API secret |
| `AI_DOCTOR_API_URL` | `https://ai-doctor-genai.onrender.com` | AI Doctor service URL |
| `PHARM_AI_URL` | `https://pharmacy-ai-rho.vercel.app` | Pharm-Ai service URL |

### Step 4: Deploy and Test

1. **Click "Create Web Service"**
2. **Monitor the build logs**
3. **Wait for deployment to complete**
4. **Test the health endpoint**: `https://your-app.onrender.com/`

## 📱 Application Features

### Core Backend Features:
- ✅ **Authentication System** - JWT-based auth with 2FA
- ✅ **Patient Management** - CRUD operations for patients
- ✅ **Appointment System** - Scheduling and management
- ✅ **Prescription Processing** - OCR and validation
- ✅ **Health Metrics** - Data collection and storage
- ✅ **AI Integration** - AI Doctor and AI Therapist
- ✅ **File Upload** - Audio, video, and document handling
- ✅ **Security** - Rate limiting, CORS, helmet protection

### API Endpoints:
- `GET /` - Health check
- `POST /api/auth/*` - Authentication
- `GET /api/patients/*` - Patient management
- `POST /api/appointments/*` - Appointment system
- `POST /api/prescriptions/*` - Prescription processing
- `GET /api/ai-doctor/*` - AI Doctor integration
- `POST /api/recordings/*` - Audio/video processing

## 🔧 Configuration Details

### render.yaml Configuration:
```yaml
services:
  - type: web
    name: aayulink-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      # ... other environment variables
```

### CORS Configuration:
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://*.vercel.app',
      'https://*.netlify.app'
    ].filter(Boolean);
    // ... CORS logic
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check for syntax errors in server.js

2. **Database Connection Issues**
   - Verify MONGODB_URI is correct
   - Check database permissions
   - Ensure database is accessible from Render

3. **CORS Errors**
   - Update FRONTEND_URL environment variable
   - Check CORS configuration in server.js
   - Verify allowed origins

4. **API Key Issues**
   - Verify all API keys are set correctly
   - Check API key permissions
   - Test API keys independently

### Performance Optimization:

1. **Memory Usage**
   - Monitor memory usage in Render dashboard
   - Optimize database queries
   - Implement proper error handling

2. **Response Times**
   - Use compression middleware
   - Implement caching where appropriate
   - Optimize database indexes

## 📊 Monitoring

### Render Dashboard:
- **Logs**: Monitor application logs
- **Metrics**: CPU, memory, and response times
- **Deployments**: Track deployment history

### Health Checks:
```bash
# Basic health check
curl https://your-app.onrender.com/

# Database health check
curl https://your-app.onrender.com/api/health

# AI Doctor integration check
curl https://your-app.onrender.com/api/ai-doctor/health
```

## 🔄 Updates and Maintenance

### Deploying Updates:
```bash
# Make changes to your code
git add .
git commit -m "Update backend feature"
git push origin main

# Render will automatically redeploy
```

### Environment Variable Updates:
1. Go to Render Dashboard
2. Navigate to Environment Variables
3. Update the required variables
4. Redeploy the service

## 🔗 Service Integration

### Connected Services:
- **AI Doctor**: https://ai-doctor-genai.onrender.com
- **Pharm-Ai**: https://pharmacy-ai-rho.vercel.app
- **Frontend**: Your deployed frontend URL
- **Database**: Your MongoDB instance

### Integration Flow:
```
Frontend → AayuLink Backend → AI Services
```

## 🎯 Post-Deployment Checklist

- [ ] Backend deploys successfully
- [ ] Health endpoint responds
- [ ] Database connection works
- [ ] CORS configuration allows frontend
- [ ] AI Doctor integration works
- [ ] Pharm-Ai integration works
- [ ] File upload functionality works
- [ ] Authentication system works
- [ ] All API endpoints respond correctly

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test database connectivity
4. Check API key validity
5. Review CORS configuration

---

**Your AayuLink backend is ready for Render deployment! 🚀**

**Deployed Services:**
- ✅ **AI Doctor**: https://ai-doctor-genai.onrender.com
- ✅ **Pharm-Ai**: https://pharmacy-ai-rho.vercel.app
- 🚀 **AayuLink Backend**: Ready for deployment
