#!/usr/bin/env python3
"""
Test script to check if FIDO reacts to different emotions
"""

import requests
import json
import time

def test_emotion_reaction():
    """Test FIDO's reaction to different emotions"""
    
    base_url = "http://localhost:8001"
    session_id = "test_emotion_session"
    
    # Test emotions
    test_cases = [
        {"mood": "happy", "message": "I'm feeling great today!"},
        {"mood": "sad", "message": "I'm feeling really down and lonely"},
        {"mood": "angry", "message": "I'm so frustrated with everything"},
        {"mood": "neutral", "message": "Hello, how are you?"},
        {"mood": "fearful", "message": "I'm scared about my future"}
    ]
    
    print("🧪 Testing FIDO's emotion reactions...")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['mood'].upper()} mood")
        print(f"Message: {test_case['message']}")
        
        try:
            # Send chat request
            response = requests.post(
                f"{base_url}/chat",
                json={
                    "message": test_case['message'],
                    "session_id": session_id,
                    "mood": test_case['mood']
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Response: {data['response']}")
                
                # Check if response mentions the emotion
                response_lower = data['response'].lower()
                mood_keywords = {
                    'happy': ['happy', 'joy', 'great', 'wonderful', 'positive'],
                    'sad': ['sad', 'down', 'lonely', 'comfort', 'support'],
                    'angry': ['angry', 'frustrated', 'calm', 'understand'],
                    'neutral': ['hello', 'how', 'tell me', 'share'],
                    'fearful': ['scared', 'fear', 'anxious', 'reassure', 'safe']
                }
                
                keywords = mood_keywords.get(test_case['mood'], [])
                found_keywords = [kw for kw in keywords if kw in response_lower]
                
                if found_keywords:
                    print(f"🎯 Emotion detected in response: {found_keywords}")
                else:
                    print("⚠️  No emotion-specific keywords found")
                    
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Server not running on port 8001")
            print("💡 Please start the server with: python main.py")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("-" * 40)
        time.sleep(1)  # Small delay between tests
    
    print("\n🏁 Emotion reaction test completed!")

if __name__ == "__main__":
    test_emotion_reaction()
