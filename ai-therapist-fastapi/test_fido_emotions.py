#!/usr/bin/env python3
"""
Test script to verify if FIDO reacts differently to different emotions
"""

import requests
import json
import time

# Test different emotions
test_cases = [
    {
        "emotion": "happy",
        "message": "I just got promoted at work!",
        "expected_tone": "celebratory, encouraging"
    },
    {
        "emotion": "sad", 
        "message": "I lost my pet yesterday",
        "expected_tone": "empathetic, comforting"
    },
    {
        "emotion": "angry",
        "message": "My boss is being unfair to me",
        "expected_tone": "calming, understanding"
    },
    {
        "emotion": "neutral",
        "message": "How are you today?",
        "expected_tone": "warm, inviting"
    },
    {
        "emotion": "fearful",
        "message": "I'm scared about my health",
        "expected_tone": "reassuring, gentle"
    }
]

def test_fido_emotion_reaction():
    """Test if FIDO reacts differently to different emotions"""
    
    print("🤖 Testing FIDO's emotion-based responses...")
    print("=" * 60)
    
    base_url = "http://localhost:8001"
    
    # Check if server is running
    try:
        health_response = requests.get(f"{base_url}/health", timeout=5)
        if health_response.status_code == 200:
            print("✅ Server is running")
            health_data = health_response.json()
            print(f"📊 Services: {health_data['services']}")
        else:
            print("❌ Server health check failed")
            return
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server: {e}")
        print("💡 Make sure to run: python main.py")
        return
    
    print("\n🎭 Testing emotion-based responses:")
    print("-" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing {test_case['emotion'].upper()} emotion:")
        print(f"   Message: '{test_case['message']}'")
        print(f"   Expected tone: {test_case['expected_tone']}")
        
        try:
            # Send chat request with specific mood
            chat_data = {
                "message": test_case['message'],
                "session_id": f"test_session_{i}",
                "mood": test_case['emotion']
            }
            
            response = requests.post(
                f"{base_url}/chat",
                json=chat_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                fido_response = data['response']
                
                print(f"   🤖 FIDO's response: '{fido_response}'")
                
                # Simple analysis of response tone
                response_lower = fido_response.lower()
                if test_case['emotion'] == 'happy':
                    if any(word in response_lower for word in ['congrat', 'wonderful', 'great', 'amazing', 'fantastic']):
                        print("   ✅ Response shows celebratory tone")
                    else:
                        print("   ⚠️  Response may not be celebratory enough")
                        
                elif test_case['emotion'] == 'sad':
                    if any(word in response_lower for word in ['sorry', 'understand', 'difficult', 'comfort', 'support']):
                        print("   ✅ Response shows empathetic tone")
                    else:
                        print("   ⚠️  Response may not be empathetic enough")
                        
                elif test_case['emotion'] == 'angry':
                    if any(word in response_lower for word in ['understand', 'frustrat', 'calm', 'help', 'process']):
                        print("   ✅ Response shows calming tone")
                    else:
                        print("   ⚠️  Response may not be calming enough")
                        
                elif test_case['emotion'] == 'fearful':
                    if any(word in response_lower for word in ['safe', 'reassur', 'gentle', 'support', 'help']):
                        print("   ✅ Response shows reassuring tone")
                    else:
                        print("   ⚠️  Response may not be reassuring enough")
                        
                else:  # neutral
                    if any(word in response_lower for word in ['how', 'tell', 'share', 'feel', 'experience']):
                        print("   ✅ Response shows inviting tone")
                    else:
                        print("   ⚠️  Response may not be inviting enough")
                        
            else:
                print(f"   ❌ Request failed: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request error: {e}")
        
        # Small delay between requests
        time.sleep(1)
    
    print("\n" + "=" * 60)
    print("🎯 Test Summary:")
    print("✅ If FIDO shows different tones for different emotions, emotion reaction is working!")
    print("⚠️  If responses are similar, FIDO may not be reacting to emotions properly")

if __name__ == "__main__":
    test_fido_emotion_reaction()
