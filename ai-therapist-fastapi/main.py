from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import base64
import json
import os
from groq import Groq
from dotenv import load_dotenv
import re
import uuid
from datetime import datetime, timedelta
import asyncio
import tensorflow as tf
from collections import Counter
import time

# Load environment variables
load_dotenv('config.env')

app = FastAPI(title="AI Therapist API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
emotion_model = None
face_detector = None
current_emotions = {}
emotion_history = {}
active_sessions = {}
groq_client = None  # ✅ Add Groq client

# Pydantic models
class EmotionDetectionRequest(BaseModel):
    image_data: str
    session_id: str

class EmotionDetectionResponse(BaseModel):
    emotion: str
    confidence: float
    session_id: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    mood: str = "neutral"  # ✅ Add mood field

class ChatResponse(BaseModel):
    response: str
    session_id: str

# Initialize Groq AI Client
try:
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    groq_client = Groq(api_key=groq_api_key)
    print("✅ Groq AI initialized successfully (llama-3.1-8b-instant)")
except Exception as e:
    print(f"❌ Error initializing Groq AI: {e}")
    groq_client = None

# Initialize OpenCV face detector
try:
    face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_detector.empty():
        print("[ERROR] Could not load Haar cascade classifier")
        face_detector = None
    else:
        print("[SUCCESS] OpenCV face detector initialized successfully")
except Exception as e:
    print(f"[ERROR] Error initializing face detector: {e}")
    face_detector = None

# Load the emotion detection model
def load_emotion_model():
    global emotion_model
    try:
        # Try to load the model from the AI THERAPIST directory
        model_path = "../AI THERAPIST/mobile_net_v2_firstmodel.h5"
        if os.path.exists(model_path):
            from keras.models import load_model
            emotion_model = load_model(model_path)
            print("[SUCCESS] Emotion model loaded successfully from AI THERAPIST directory")
            return True
        else:
            print("[ERROR] Model file not found at:", model_path)
            print("[INFO] Using fallback emotion detection (no ML model)")
            return False
    except Exception as e:
        print(f"[ERROR] Error loading emotion model: {e}")
        print("[INFO] Using fallback emotion detection (no ML model)")
        return False

# Load the model
load_emotion_model()

def clean_text(text):
    """Clean text by removing emojis and special characters"""
    import re
    # Remove emojis and special Unicode characters
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def predict_emotion(face_image):
    """Predict emotion using the MobileNetV2 model or fallback method"""
    try:
        if emotion_model is None:
            return predict_emotion_fallback(face_image)
        
        # Decode the image if it's base64
        if isinstance(face_image, str):
            face_image = base64.b64decode(face_image)
        
        # Convert to numpy array
        if not isinstance(face_image, np.ndarray):
            face_image = cv2.imdecode(np.frombuffer(face_image, np.uint8), cv2.IMREAD_COLOR)
        
        # Ensure array is C-contiguous
        face_image = np.ascontiguousarray(face_image)
        
        # Resize to model input size (224x224)
        final_image = cv2.resize(face_image, (224, 224))
        final_image = np.expand_dims(final_image, axis=0)
        final_image = final_image / 255.0  # Normalize
        final_image = np.ascontiguousarray(final_image)

        # Make prediction
        predictions = emotion_model.predict(final_image, verbose=0)
        
        # Emotion labels (same as in the original AI THERAPIST)
        emotion_labels = ["Angry", "Disgust", "Fear", "Happy", "Surprise", "Sad", "Neutral"]
        predicted_emotion = emotion_labels[np.argmax(predictions)]
        confidence = float(np.max(predictions))
        
        return predicted_emotion, confidence
        
    except Exception as e:
        print(f"Model prediction failed: {e}")
        return predict_emotion_fallback(face_image)

def predict_emotion_fallback(face_image):
    """Fallback emotion detection using basic image analysis"""
    try:
        # Decode the image if it's base64
        if isinstance(face_image, str):
            face_image = base64.b64decode(face_image)
        
        # Convert to numpy array
        face_image = cv2.imdecode(np.frombuffer(face_image, np.uint8), cv2.IMREAD_COLOR)
        
        if face_image is None:
            return "Neutral", 0.3
        
        # Ensure array is C-contiguous
        face_image = np.ascontiguousarray(face_image)
        
        # Convert to grayscale
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        
        # Calculate basic features
        brightness = np.mean(gray)
        contrast = np.std(gray)
        
        # Simple heuristics based on image features
        if brightness > 140:
            return "Happy", 0.7
        elif brightness < 80:
            return "Sad", 0.6
        elif contrast > 60:
            return "Surprise", 0.5
        elif contrast < 30:
            return "Neutral", 0.6
        else:
            return "Neutral", 0.5
        
    except Exception as e:
        print(f"Fallback prediction failed: {e}")
        return "Neutral", 0.5

def detect_emotion_from_image(image_data):
    """Detect emotion from a single image using face detection + emotion prediction"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return "Neutral", 0.3
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        if face_detector is None:
            return "Neutral", 0.3
            
        faces = face_detector.detectMultiScale(
            gray, 
            scaleFactor=1.1,   # Original sensitivity
            minNeighbors=3,    # Original strictness
            minSize=(30, 30),  # Original minimum size
            maxSize=(300, 300), # Original maximum size
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        if len(faces) == 0:
            return "No Face", 0.0
        
        # Get the largest face
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face
        
        # Validate face size - should be reasonable for a full face
        if w < 20 or h < 20:
            return "No Face", 0.0
        
        # Expand ROI for better emotion detection
        def expand_roi(x, y, w, h, scale_w, scale_h, img_shape):
            new_x = max(int(x - w * (scale_w - 1) / 2), 0)
            new_y = max(int(y - h * (scale_h - 1) / 2), 0)
            new_w = min(int(w * scale_w), img_shape[1] - new_x)
            new_h = min(int(h * scale_h), img_shape[0] - new_y)
            return new_x, new_y, new_w, new_h
        
        scale_w = 1.3  # Original horizontal expansion
        scale_h = 1.5  # Original vertical expansion
        new_x, new_y, new_w, new_h = expand_roi(x, y, w, h, scale_w, scale_h, image.shape)
        
        # Extract face region
        face_roi = image[new_y:new_y+new_h, new_x:new_x+new_w]
        
        # Predict emotion
        emotion, confidence = predict_emotion(face_roi)
        
        # Convert Surprise to Neutral (as in original)
        if emotion == "Surprise":
            emotion = "Neutral"
            
        print(f"Face detected: {w}x{h} at ({x},{y}) - Emotion: {emotion} ({confidence:.2f})")
        
        return emotion, confidence
        
    except Exception as e:
        print(f"❌ ERROR IN EMOTION DETECTION: {e}")
        print("=" * 50)
        return "Neutral", 0.5

def generate_therapist_response(message, emotion, session_id):
    """Generate AI therapist response using Groq"""
    print("=" * 80)
    print("GENERATE_THERAPIST_RESPONSE CALLED")
    print("=" * 80)
    print(f"Message: {message}")
    print(f"Emotion: {emotion}")
    print(f"Session ID: {session_id}")
    print("=" * 80)
    
    try:
        print(f"[DEBUG] generate_therapist_response called with message: {message[:50]}...")
        print(f"[DEBUG] Groq client object: {groq_client}")
        print(f"[DEBUG] Groq client is None: {groq_client is None}")
        
        if not groq_client:
            print("*** GROQ CLIENT IS NONE - RETURNING UNAVAILABLE MESSAGE ***")
            return "I'm sorry, the AI service is currently unavailable. Please try again later."
        
        print("✅ Groq client is available")
        
        # Get emotion history for this session
        session_emotions = emotion_history.get(session_id, [])
        recent_emotions = session_emotions[-5:] if len(session_emotions) > 5 else session_emotions
        
        print(f"📊 Session emotions: {len(session_emotions)} total, {len(recent_emotions)} recent")
        
        # Create context-aware prompt based on emotion
        emotion_guidelines = {
            'happy': "The patient appears to be in a positive mood. Acknowledge their happiness, encourage them to share what's going well, and help them build on this positive energy.",
            'sad': "The patient seems to be feeling down or sad. Be extra gentle and empathetic, validate their feelings, and offer comfort and support.",
            'angry': "The patient appears frustrated or angry. Stay calm and non-judgmental, help them process their feelings, and guide them toward constructive solutions.",
            'neutral': "The patient seems calm and neutral. Be warm and inviting, ask open-ended questions to understand their current state, and provide general support.",
            'surprised': "The patient seems surprised or alert. Be reassuring, help them process what might have surprised them, and provide stability.",
            'fearful': "The patient appears anxious or fearful. Be very gentle and reassuring, validate their concerns, and help them feel safe.",
            'disgusted': "The patient seems to be experiencing disgust or strong negative feelings. Be understanding and help them process these feelings constructively."
        }
        
        emotion_guidance = emotion_guidelines.get(emotion.lower(), emotion_guidelines['neutral'])
        print(f"🎯 Emotion guidance found: {emotion.lower() in emotion_guidelines}")
        print(f"📋 Emotion guidance: {emotion_guidance[:50]}...")
        
        system_prompt = f"""You are a compassionate AI therapist named FIDO. 
        EMOTION-SPECIFIC GUIDANCE: {emotion_guidance}
        IMPORTANT: Your response MUST reflect the patient's current emotion ({emotion}). Adapt your tone, approach, and suggestions accordingly.
        Guidelines:
        1. Acknowledge their current emotional state specifically
        2. Provide emotion-appropriate support and advice
        3. Ask thoughtful follow-up questions relevant to their mood
        4. Maintain a professional yet warm tone
        5. Keep responses concise but meaningful (2-3 sentences)
        Current patient emotion: {emotion}"""
        
        user_prompt = f"""Patient message: "{message}"
        Patient's current emotional state: {emotion}
        Recent emotions: {', '.join([str(e.get('emotion', e)) if isinstance(e, dict) else str(e) for e in recent_emotions]) if recent_emotions else 'None'}
        Respond as FIDO, acknowledging their {emotion} mood and providing appropriate support."""
        
        print(f"🎭 Generating response for emotion: '{emotion}' | Message: '{message[:30]}...'")
        print(f"📏 System prompt length: {len(system_prompt)}")
        print(f"📏 User prompt length: {len(user_prompt)}")
        
        print("🚀 Making Groq API call...")
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            max_tokens=200,
            top_p=0.9
        )
        
        print("✅ Groq API call successful!")
        ai_response = response.choices[0].message.content
        print(f"🤖 AI Response for {emotion}: {ai_response[:50]}...")
        print(f"✅ SUCCESS: Generated response successfully")
        print(f"{'='*60}\n")
        return ai_response
        
    except Exception as e:
        print("=" * 80)
        print("*** EXCEPTION CAUGHT IN generate_therapist_response ***")
        print("=" * 80)
        print(f"ERROR: {e}")
        print(f"ERROR TYPE: {type(e)}")
        print("*** THIS IS WHY YOU GET FALLBACK MESSAGE ***")
        import traceback
        traceback.print_exc()
        print("=" * 80)
        return "I'm here to listen and help. Could you tell me more about what you're experiencing?"

@app.get("/")
async def root():
    return {"message": "AI Therapist API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
        return {
        "status": "healthy",
        "services": {
            "opencv": face_detector is not None,
            "groq_ai": groq_client is not None,
            "emotion_model": emotion_model is not None
        }
    }

@app.post("/detect-emotion", response_model=EmotionDetectionResponse)
async def detect_emotion(request: EmotionDetectionRequest):
    try:
        emotion, confidence = detect_emotion_from_image(request.image_data)
        
        # Store emotion in history
        if request.session_id not in emotion_history:
            emotion_history[request.session_id] = []
        emotion_history[request.session_id].append({
            "emotion": emotion,
            "timestamp": datetime.now().isoformat()
        })
        
        # Update current emotions
        current_emotions[request.session_id] = {
                "emotion": emotion,
                "confidence": confidence,
            "timestamp": datetime.now().isoformat()
        }
        
        return EmotionDetectionResponse(
            emotion=emotion,
            confidence=confidence,
            session_id=request.session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting emotion: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    print("=" * 80)
    print("CHAT ENDPOINT CALLED - CHECKING FOR FALLBACK TRIGGER")
    print("=" * 80)
    print(f"Message: {request.message}")
    print(f"Request mood: {request.mood}")
    print(f"Session ID: {request.session_id}")
    print("=" * 80)
    
    try:
        # Use mood from request, fallback to stored emotion
        mood = request.mood if request.mood else current_emotions.get(request.session_id, {}).get("emotion", "neutral")
        
        print(f"FINAL MOOD USED: {mood}")
        print("CALLING generate_therapist_response...")
        
        response = generate_therapist_response(request.message, mood, request.session_id)
        
        print(f"RESPONSE RECEIVED: {response[:100]}")
        
        if "I'm here to listen and help" in response:
            print("*** FALLBACK MESSAGE DETECTED ***")
            print("*** CHECK generate_therapist_response FUNCTION ***")
        
        print("=" * 80)
        
        return ChatResponse(
            response=response,
            session_id=request.session_id
        )
        
    except Exception as e:
        print(f"\n❌ CHAT ENDPOINT ERROR!")
        print(f"❌ Error: {e}")
        print(f"❌ Error type: {type(e)}")
        print(f"🔍 TRIGGER: Exception in chat endpoint")
        import traceback
        traceback.print_exc()
        print(f"{'='*60}\n")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.get("/session/{session_id}/emotions")
async def get_emotion_history(session_id: str):
    """Get emotion history for a session"""
    return {
        "session_id": session_id,
        "emotions": emotion_history.get(session_id, []),
        "current_emotion": current_emotions.get(session_id, {})
    }

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    active_sessions[session_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "emotion_detection":
                # Handle emotion detection
                emotion, confidence = detect_emotion_from_image(message_data["image_data"])
                
                # Store emotion
                if session_id not in emotion_history:
                    emotion_history[session_id] = []
                emotion_history[session_id].append({
                    "emotion": emotion,
                    "timestamp": datetime.now().isoformat()
                })
                
                current_emotions[session_id] = {
                "emotion": emotion,
                "confidence": confidence,
                    "timestamp": datetime.now().isoformat()
                }
                
                await websocket.send_text(json.dumps({
                    "type": "emotion_detected",
                    "emotion": emotion,
                    "confidence": confidence
                }))
                
            elif message_data.get("type") == "chat":
                # Handle chat message
                current_emotion = current_emotions.get(session_id, {}).get("emotion", "neutral")
                response = generate_therapist_response(message_data["message"], current_emotion, session_id)
                
                await websocket.send_text(json.dumps({
                    "type": "chat_response",
                    "response": response
            }))
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if session_id in active_sessions:
            del active_sessions[session_id]

@app.post("/update-mood")
async def update_mood(request: dict):
    """Update mood for a session"""
    try:
        session_id = request.get("session_id")
        mood = request.get("mood")
        
        if not session_id or not mood:
            raise HTTPException(status_code=400, detail="session_id and mood are required")
        
        # Store mood in session data
        if session_id not in emotion_history:
            emotion_history[session_id] = []
        
        emotion_history[session_id].append({
            "mood": mood,
            "timestamp": datetime.now().isoformat()
        })
        
        return {"status": "success", "message": "Mood updated successfully"}
    except Exception as e:
        print(f"Error updating mood: {e}")
        raise HTTPException(status_code=500, detail="Failed to update mood")

@app.post("/save-session")
async def save_session(request: dict):
    """Save therapy session data"""
    try:
        # In a real application, you would save this to a database
        # For now, we'll just return success
        session_id = request.get("patient_id", "anonymous")
        print(f"Session saved for patient: {session_id}")
        
        return {
            "status": "success", 
            "message": "Session saved successfully",
            "session_id": session_id
        }
    except Exception as e:
        print(f"Error saving session: {e}")
        raise HTTPException(status_code=500, detail="Failed to save session")

@app.get("/session-history/{patient_id}")
async def get_session_history(patient_id: str):
    """Get session history for a patient"""
    try:
        # In a real application, you would fetch this from a database
        # For now, we'll return empty sessions
        return {
            "patient_id": patient_id,
            "sessions": []
        }
    except Exception as e:
        print(f"Error getting session history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get session history")

if __name__ == "__main__":
    import uvicorn
    print("[STARTING] AI Therapist API...")
    print("[INFO] Available endpoints:")
    print("   GET  / - Health check")
    print("   GET  /health - Detailed health status")
    print("   POST /detect-emotion - Detect emotion from image")
    print("   POST /chat - Chat with AI therapist")
    print("   POST /update-mood - Update mood for session")
    print("   POST /save-session - Save therapy session")
    print("   GET  /session-history/{patient_id} - Get session history")
    print("   GET  /session/{session_id}/emotions - Get emotion history")
    print("   WS   /ws/{session_id} - WebSocket connection")
    print("[INFO] Server will be available at: http://localhost:8001")
    print("[INFO] API docs at: http://localhost:8001/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8001)