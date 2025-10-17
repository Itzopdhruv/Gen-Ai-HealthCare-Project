# 🚀 Main Website Deployment Guide

## ✅ Pharm-Ai Integration Updated

### Changes Made:
- **Frontend**: Updated Pharm-Ai buttons to use deployed URL `https://pharmacy-ai-rho.vercel.app/`
- **Backend**: No changes needed (no direct API calls to Pharm-Ai)
- **Integration**: Seamless connection to deployed Pharm-Ai service

## 🏗️ Main Website Architecture

### Backend (Node.js + Express)
- **Location**: `main_website/backend/`
- **Port**: 5001 (development), configurable for production
- **Database**: MongoDB
- **Features**: Authentication, appointments, prescriptions, AI integration

### Frontend (React + Vite)
- **Location**: `main_website/frontend/`
- **Port**: 3000 (development)
- **Features**: Patient dashboard, admin panel, video calls, AI integration

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

#### Frontend Deployment on Vercel:
1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure:**
   - **Root Directory**: `main_website/frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Environment Variables for Frontend:
```env
VITE_API_URL=https://your-backend-url.com
VITE_AI_DOCTOR_URL=https://ai-doctor-genai.onrender.com
VITE_PHARM_AI_URL=https://pharmacy-ai-rho.vercel.app
```

### Option 2: Railway (Recommended for Backend)

#### Backend Deployment on Railway:
1. **Go to [railway.app](https://railway.app)**
2. **Click "New Project"**
3. **Deploy from GitHub**
4. **Select your repository**
5. **Configure:**
   - **Root Directory**: `main_website/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### Environment Variables for Backend:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Option 3: Render (Alternative)

#### Backend on Render:
1. **Go to [render.com](https://render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect GitHub repository**
4. **Configure:**
   - **Root Directory**: `main_website/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Backend

1. **Navigate to backend directory:**
   ```bash
   cd main_website/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Test locally:**
   ```bash
   npm start
   ```

4. **Create production environment file:**
   ```bash
   cp .env.example .env.production
   ```

### Step 2: Deploy Backend

#### Using Railway:
1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   cd main_website/backend
   railway init
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Set environment variables:**
   ```bash
   railway variables set MONGODB_URI=your_mongodb_uri
   railway variables set JWT_SECRET=your_jwt_secret
   # ... set other variables
   ```

### Step 3: Deploy Frontend

#### Using Vercel:
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy frontend:**
   ```bash
   cd main_website/frontend
   vercel
   ```

4. **Set environment variables in Vercel dashboard:**
   - `VITE_API_URL` = your backend URL
   - `VITE_AI_DOCTOR_URL` = https://ai-doctor-genai.onrender.com
   - `VITE_PHARM_AI_URL` = https://pharmacy-ai-rho.vercel.app

### Step 4: Update API URLs

#### Update Frontend API Configuration:
1. **Edit `main_website/frontend/src/services/api.js`**
2. **Update base URL:**
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.railway.app';
   ```

## 📱 Application Features

### Core Features:
- ✅ **Patient Dashboard** - Health metrics, appointments, prescriptions
- ✅ **Admin Panel** - User management, appointment scheduling
- ✅ **Video Calls** - Jitsi Meet integration
- ✅ **AI Doctor Integration** - Medical image analysis
- ✅ **Pharm-Ai Integration** - Pharmacy management
- ✅ **AI Therapist** - Emotion detection and therapy
- ✅ **Prescription Management** - OCR processing and validation

### API Endpoints:
- `/api/auth/*` - Authentication
- `/api/appointments/*` - Appointment management
- `/api/prescriptions/*` - Prescription processing
- `/api/ai-doctor/*` - AI Doctor integration
- `/api/ai-therapist/*` - AI Therapist integration
- `/api/health-metrics/*` - Health data management

## 🔗 Service Integration

### Deployed Services:
1. **AI Doctor**: https://ai-doctor-genai.onrender.com
2. **Pharm-Ai**: https://pharmacy-ai-rho.vercel.app
3. **Main Website Backend**: Your deployed backend URL
4. **Main Website Frontend**: Your deployed frontend URL

### Integration Flow:
```
Frontend (Vercel) → Backend (Railway) → AI Services (Render/Vercel)
```

## 🧪 Testing Deployment

### Backend Testing:
```bash
# Health check
curl https://your-backend-url.railway.app/api/health

# Test AI Doctor integration
curl https://your-backend-url.railway.app/api/ai-doctor/health
```

### Frontend Testing:
1. **Visit your frontend URL**
2. **Test login/signup**
3. **Test Pharm-Ai integration** (should open in new tab)
4. **Test AI Doctor integration**
5. **Test video calls**

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Update `FRONTEND_URL` in backend environment variables
   - Check CORS configuration in `server.js`

2. **API Connection Issues**
   - Verify `VITE_API_URL` in frontend environment variables
   - Check backend is running and accessible

3. **Database Connection Issues**
   - Verify `MONGODB_URI` is correct
   - Check database permissions and network access

4. **AI Service Integration Issues**
   - Verify AI service URLs are correct
   - Check API keys are valid
   - Monitor service health endpoints

## 📊 Monitoring

### Backend Monitoring:
- **Railway Dashboard**: Monitor logs, metrics, and errors
- **Health Endpoints**: Regular health checks
- **Database**: Monitor connection and performance

### Frontend Monitoring:
- **Vercel Analytics**: Performance and usage metrics
- **Error Tracking**: Monitor client-side errors
- **User Experience**: Track Core Web Vitals

## 🔄 Updates and Maintenance

### Deploying Updates:
```bash
# Backend updates
cd main_website/backend
git add .
git commit -m "Update backend feature"
git push origin main
# Railway will auto-deploy

# Frontend updates
cd main_website/frontend
git add .
git commit -m "Update frontend feature"
git push origin main
# Vercel will auto-deploy
```

### Environment Variable Updates:
1. **Backend**: Update in Railway dashboard
2. **Frontend**: Update in Vercel dashboard
3. **Redeploy** if necessary

---

**Your main website is ready for deployment with full Pharm-Ai integration! 🚀**

**Deployed Services:**
- **Pharm-Ai**: https://pharmacy-ai-rho.vercel.app ✅
- **AI Doctor**: https://ai-doctor-genai.onrender.com ✅
- **Main Website**: Ready for deployment 🚀
