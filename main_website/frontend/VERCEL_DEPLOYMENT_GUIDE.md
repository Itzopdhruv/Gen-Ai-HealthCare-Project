# 🚀 AayuLink Frontend - Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] **Backend deployed** at `https://backend-main-website.onrender.com`
- [x] **AI Doctor deployed** at `https://ai-doctor-genai.onrender.com`
- [x] **Pharm AI deployed** at `https://pharmacy-ai-rho.vercel.app`
- [x] **Frontend built successfully** with no errors
- [x] **Environment variables configured** for production

## 🔧 Configuration Changes Made

### 1. API Configuration (`src/services/api.js`)
- Updated to use `VITE_API_URL` environment variable
- Falls back to `/api` for local development

### 2. Vite Configuration (`vite.config.js`)
- Updated proxy target to use `VITE_API_URL` environment variable
- Maintains local development compatibility

### 3. Component Updates
- **AIDoctorTab.jsx**: Uses `VITE_AI_DOCTOR_URL` environment variable
- **LandingPage.jsx**: Uses `VITE_PHARM_AI_URL` environment variable
- **PatientDashboard.jsx**: Uses `VITE_PHARM_AI_URL` environment variable

### 4. Vercel Configuration (`vercel.json`)
- Added build command and output directory
- Configured environment variables for production

## 🌐 Environment Variables

The following environment variables are configured in `vercel.json`:

```json
{
  "env": {
    "VITE_API_URL": "https://backend-main-website.onrender.com/api",
    "VITE_AI_DOCTOR_URL": "https://ai-doctor-genai.onrender.com",
    "VITE_PHARM_AI_URL": "https://pharmacy-ai-rho.vercel.app"
  }
}
```

## 📋 Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**:
   ```bash
   cd "/Users/dhruvgupta/Desktop/coding/genai_healthcare /Gen-Ai-HealthCare-Project/main_website/frontend"
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import from GitHub**:
   - Select your repository: `Itzopdhruv/Gen-Ai-HealthCare-Project`
   - Set **Root Directory** to: `main_website/frontend`
4. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Set Environment Variables**:
   - `VITE_API_URL`: `https://backend-main-website.onrender.com/api`
   - `VITE_AI_DOCTOR_URL`: `https://ai-doctor-genai.onrender.com`
   - `VITE_PHARM_AI_URL`: `https://pharmacy-ai-rho.vercel.app`
6. **Click "Deploy"**

## 🔍 Post-Deployment Verification

### 1. Health Check
Visit your deployed frontend URL and check:
- [ ] Page loads without errors
- [ ] Navigation works
- [ ] Login/Register forms are functional

### 2. API Integration Test
- [ ] Try logging in (should connect to backend)
- [ ] Test AI Doctor integration
- [ ] Test Pharm AI integration

### 3. Cross-Origin Testing
- [ ] Verify CORS is working between frontend and backend
- [ ] Check browser console for any CORS errors

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Backend CORS is configured for Vercel domains
   - Check if frontend URL is added to backend CORS origins

2. **Environment Variables Not Loading**:
   - Ensure variables are set in Vercel dashboard
   - Variables must start with `VITE_` for Vite to access them

3. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`

4. **API Connection Issues**:
   - Verify backend is running and accessible
   - Check network tab in browser dev tools

## 📊 Build Information

- **Build Time**: ~6.62s
- **Bundle Size**: 1.9MB (564KB gzipped)
- **CSS Size**: 305KB (44KB gzipped)
- **Warnings**: Minor CSS syntax warning (non-blocking)

## 🔗 Integration URLs

- **Backend API**: `https://backend-main-website.onrender.com/api`
- **AI Doctor**: `https://ai-doctor-genai.onrender.com`
- **Pharm AI**: `https://pharmacy-ai-rho.vercel.app`
- **Frontend**: `https://your-frontend-name.vercel.app`

## 🎉 Success!

Once deployed, your AayuLink frontend will be fully integrated with:
- ✅ Backend API for authentication and data
- ✅ AI Doctor for medical consultations
- ✅ Pharm AI for pharmacy management
- ✅ Responsive design for all devices

---

**Next Steps**: After deployment, update any hardcoded URLs in documentation and test the complete user journey!
