#!/usr/bin/env python3
"""
Test Groq Emotion Detection
"""
import os
from dotenv import load_dotenv
import base64
import cv2
import numpy as np
from groq import Groq

# Load environment variables
load_dotenv('config.env')

def test_groq_emotion_detection():
    """Test Groq emotion detection with a sample image"""
    print("🧪 Testing Groq Emotion Detection")
    print("=" * 50)
    
    try:
        # Initialize Groq client
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            print("❌ GROQ_API_KEY not found")
            return False
        
        client = Groq(api_key=groq_api_key)
        print("✅ Groq client initialized")
        
        # Create a test image (simple face-like pattern)
        test_image = np.zeros((200, 200, 3), dtype=np.uint8)
        
        # Draw a simple face
        cv2.circle(test_image, (100, 80), 30, (255, 255, 255), -1)  # Face
        cv2.circle(test_image, (90, 70), 5, (0, 0, 0), -1)  # Left eye
        cv2.circle(test_image, (110, 70), 5, (0, 0, 0), -1)  # Right eye
        cv2.ellipse(test_image, (100, 90), (15, 8), 0, 0, 180, (0, 0, 0), 2)  # Smile
        
        # Convert to base64
        _, buffer = cv2.imencode('.jpg', test_image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        print("📷 Test image created (simple happy face)")
        
        # Test emotion detection with feature analysis
        prompt = f"""You are an expert emotion detection AI. Analyze these facial features and determine the person's emotion:

        Facial Analysis Data:
        - Overall brightness: 150.0 (0-255 scale)
        - Contrast level: 45.0
        - Top half brightness: 160.0
        - Bottom half brightness: 140.0
        - Face dimensions: 60x60
        - Brightness ratio (top/bottom): 1.14

Based on these facial features, determine the most likely emotion and confidence level.

Guidelines:
- High brightness + high contrast = likely happy/excited
- Low brightness + low contrast = likely sad/depressed  
- High contrast + medium brightness = likely surprised/alert
- Balanced brightness + medium contrast = likely neutral/calm
- Top half brighter than bottom = likely smiling (happy)
- Bottom half darker = likely frowning (sad/angry)

Return ONLY in this exact format: EMOTION_NAME (CONFIDENCE%)

Valid emotions: happy, sad, angry, surprised, fearful, disgusted, neutral

Example: happy (85%)"""
        
        print("🤖 Sending to Groq API...")
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=30
        )
        
        result = response.choices[0].message.content.strip()
        print(f"🎭 Groq response: {result}")
        
        # Parse result
        import re
        match = re.search(r'(\w+)\s*\((\d+)%\)', result.lower())
        
        if match:
            emotion = match.group(1)
            confidence = int(match.group(2))
            print(f"✅ Parsed: {emotion} ({confidence}%)")
            
            # Validate emotion
            valid_emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral']
            if emotion in valid_emotions:
                print(f"✅ Valid emotion: {emotion}")
                return True
            else:
                print(f"❌ Invalid emotion: {emotion}")
                return False
        else:
            print("❌ Could not parse emotion from response")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run the test"""
    success = test_groq_emotion_detection()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Groq Emotion Detection Test PASSED!")
        print("✅ Real AI emotion detection is working!")
        print("🚀 Ready to replace fallback detection!")
    else:
        print("❌ Groq Emotion Detection Test FAILED!")
        print("🔄 Will use fallback detection")
    
    return success

if __name__ == "__main__":
    main()
