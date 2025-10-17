# 🔄 AI Doctor URL Update Guide

## ✅ Changes Made

### Backend Updates
- **File:** `backend/src/controllers/aiDoctorController.js`
- **Change:** Updated default AI_DOCTOR_API_URL from `http://localhost:8000` to `https://ai-doctor-genai.onrender.com`

### Frontend Updates
- **File:** `frontend/src/components/AIDoctorTab.jsx`
- **Change:** Updated direct API calls from `http://localhost:8000` to `https://ai-doctor-genai.onrender.com`

## 🔧 Environment Variable Configuration

### Backend Environment Variables
Add this to your backend `.env` file or deployment environment:

```env
AI_DOCTOR_API_URL=https://ai-doctor-genai.onrender.com
```

### Production Deployment
For production deployments, set the environment variable:
- **Vercel:** Add `AI_DOCTOR_API_URL=https://ai-doctor-genai.onrender.com` in environment variables
- **Railway:** Add `AI_DOCTOR_API_URL=https://ai-doctor-genai.onrender.com` in environment variables
- **Heroku:** Add `AI_DOCTOR_API_URL=https://ai-doctor-genai.onrender.com` in config vars

## 📱 Updated API Endpoints

### AI Doctor Service (Render)
- **Base URL:** `https://ai-doctor-genai.onrender.com`
- **Health Check:** `https://ai-doctor-genai.onrender.com/health`
- **Image Analysis:** `https://ai-doctor-genai.onrender.com/analyze-image`
- **Text-to-Speech:** `https://ai-doctor-genai.onrender.com/text-to-speech`
- **Audio Transcription:** `https://ai-doctor-genai.onrender.com/transcribe-audio`
- **Audio Recorder:** `https://ai-doctor-genai.onrender.com/audio-recorder`

### Main Website Backend
- **AI Doctor Health:** `/api/ai-doctor/health`
- **AI Doctor Analysis:** `/api/ai-doctor/analyze`
- **AI Doctor Audio:** `/api/ai-doctor/audio/:filename`

## 🧪 Testing the Integration

### 1. Test AI Doctor Service
```bash
curl https://ai-doctor-genai.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "AI Doctor",
  "version": "1.0.0",
  "api_status": "connected",
  "audio_available": false,
  "memory_usage": "XX.XX MB"
}
```

### 2. Test Main Website Integration
1. Start your main website backend
2. Navigate to the AI Doctor tab
3. Try uploading an image or recording audio
4. Check browser console for any errors

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - ✅ Fixed: AI Doctor service has CORS enabled for all origins
   - Solution: No additional CORS configuration needed

2. **SSL/HTTPS Issues**
   - ✅ Fixed: Render provides HTTPS by default
   - Solution: All URLs now use HTTPS

3. **Timeout Issues**
   - ✅ Fixed: Increased timeout to 60 seconds for AI processing
   - Solution: Render free tier may have cold start delays

4. **Audio File Access**
   - ✅ Fixed: Updated audio URL construction
   - Solution: Audio files are served from Render CDN

## 📊 Performance Notes

### Render Free Tier Limitations
- **Cold Start:** ~30 seconds after inactivity
- **Memory:** 512MB RAM limit
- **Uptime:** 750 hours/month free
- **Sleep:** After 15 minutes of inactivity

### Optimization Tips
1. Keep the service warm with periodic health checks
2. Use efficient image compression
3. Implement proper error handling for timeouts
4. Consider upgrading to paid tier for production

## 🔄 Rollback Plan

If you need to rollback to localhost:
1. Change `AI_DOCTOR_API_URL` back to `http://localhost:8000`
2. Update frontend direct calls back to `http://localhost:8000`
3. Ensure local AI Doctor service is running

---

**All AI Doctor integrations have been successfully updated to use the Render deployment! 🚀**
