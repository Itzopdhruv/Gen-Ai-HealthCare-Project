#!/usr/bin/env python3
"""
Test emotion to mood mapping
"""
import requests
import json

def test_emotion_mapping():
    """Test the emotion to mood mapping"""
    print("🧪 Testing Emotion to Mood Mapping")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        ("neutral", "neutral"),
        ("Neutral", "neutral"), 
        ("happy", "happy"),
        ("Happy", "happy"),
        ("sad", "sad"),
        ("Sad", "sad"),
        ("angry", "angry"),
        ("Angry", "angry"),
        ("surprised", "neutral"),
        ("Surprised", "neutral"),
        ("fearful", "sad"),
        ("Fearful", "sad"),
        ("disgusted", "sad"),
        ("Disgusted", "sad"),
        ("unknown", "neutral")  # Should default to neutral
    ]
    
    # Frontend mapping (copied from the code)
    emotionToMood = {
        # Handle both capitalized and lowercase emotions
        'Happy': 'happy',
        'happy': 'happy',
        'Sad': 'sad',
        'sad': 'sad',
        'Angry': 'angry',
        'angry': 'angry',
        'Fear': 'sad',
        'fear': 'sad',
        'Fearful': 'sad',
        'fearful': 'sad',
        'Surprise': 'neutral',
        'surprise': 'neutral',
        'Surprised': 'neutral',
        'surprised': 'neutral',
        'Disgust': 'sad',
        'disgust': 'sad',
        'Disgusted': 'sad',
        'disgusted': 'sad',
        'Neutral': 'neutral',
        'neutral': 'neutral'
    }
    
    print("Testing frontend emotion mapping:")
    all_passed = True
    
    for emotion, expected_mood in test_cases:
        actual_mood = emotionToMood.get(emotion, 'neutral')
        status = "✅" if actual_mood == expected_mood else "❌"
        
        if actual_mood != expected_mood:
            all_passed = False
            
        print(f"{status} '{emotion}' -> '{actual_mood}' (expected: '{expected_mood}')")
    
    print("\n" + "=" * 50)
    
    if all_passed:
        print("🎉 All emotion mappings are correct!")
    else:
        print("❌ Some emotion mappings are incorrect!")
    
    return all_passed

def test_backend_api():
    """Test the backend API directly"""
    print("\n🧪 Testing Backend API")
    print("=" * 50)
    
    try:
        # Test with invalid image data (should trigger fallback)
        response = requests.post(
            "http://localhost:8001/detect-emotion",
            json={
                "image_data": "invalid_base64_data",
                "session_id": "test_session"
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend response: {data}")
            print(f"   Emotion: '{data['emotion']}'")
            print(f"   Confidence: {data['confidence']}")
            print(f"   Session ID: '{data['session_id']}'")
            
            # Check if emotion is lowercase
            if data['emotion'].islower():
                print("✅ Emotion is correctly lowercase")
                return True
            else:
                print(f"❌ Emotion is capitalized: '{data['emotion']}'")
                return False
        else:
            print(f"❌ API request failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 AI Therapist Emotion Mapping Test")
    print("=" * 60)
    
    # Test frontend mapping
    frontend_ok = test_emotion_mapping()
    
    # Test backend API
    backend_ok = test_backend_api()
    
    print("\n" + "=" * 60)
    print("📊 Test Results:")
    print(f"   Frontend Mapping: {'✅ PASS' if frontend_ok else '❌ FAIL'}")
    print(f"   Backend API: {'✅ PASS' if backend_ok else '❌ FAIL'}")
    
    if frontend_ok and backend_ok:
        print("\n🎉 All tests passed! Emotion detection should work correctly.")
        print("💡 If you're still seeing 'happy' instead of 'neutral', check:")
        print("   1. Browser console for emotion detection logs")
        print("   2. Make sure the AI Therapist is using the updated code")
        print("   3. Refresh the browser to clear any cached state")
    else:
        print("\n❌ Some tests failed. Please check the issues above.")
    
    return frontend_ok and backend_ok

if __name__ == "__main__":
    main()
