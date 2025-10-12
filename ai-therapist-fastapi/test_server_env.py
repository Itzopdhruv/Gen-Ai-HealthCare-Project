#!/usr/bin/env python3
"""
Test the exact server environment to find the exception
"""

import os
import sys
from dotenv import load_dotenv
from groq import Groq

# Load environment variables exactly like main.py
load_dotenv('config.env')

def test_server_environment():
    """Test in the exact same environment as the server"""
    
    print("🔍 Testing server environment...")
    print("=" * 50)
    
    # Initialize exactly like main.py
    try:
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        groq_client = Groq(api_key=groq_api_key)
        print("✅ Groq AI initialized successfully (llama-3.1-8b-instant)")
    except Exception as e:
        print(f"❌ Error initializing Groq AI: {e}")
        groq_client = None
    
    if not groq_client:
        print("❌ Groq client is None - this would return 'unavailable' message")
        return
    
    # Test the exact function that's failing
    def generate_therapist_response_test(message, emotion, session_id):
        """Exact copy of the function from main.py"""
        try:
            print(f"[DEBUG] generate_therapist_response called with message: {message[:50]}...")
            print(f"[DEBUG] Groq client object: {groq_client}")
            print(f"[DEBUG] Groq client is None: {groq_client is None}")
            
            if not groq_client:
                print("❌ Groq client is not initialized")
                return "I'm sorry, the AI service is currently unavailable. Please try again later."
            
            # Get emotion history for this session
            emotion_history = {}  # Empty for test
            session_emotions = emotion_history.get(session_id, [])
            recent_emotions = session_emotions[-5:] if len(session_emotions) > 5 else session_emotions
            
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
            Recent emotions: {', '.join(recent_emotions) if recent_emotions else 'None'}
            Respond as FIDO, acknowledging their {emotion} mood and providing appropriate support."""
            
            print(f"🎭 Generating response for emotion: '{emotion}' | Message: '{message[:30]}...'")
            
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
            
            ai_response = response.choices[0].message.content
            print(f"🤖 AI Response for {emotion}: {ai_response[:50]}...")
            return ai_response
            
        except Exception as e:
            print(f"❌ ERROR in generate_therapist_response: {e}")
            print(f"❌ Error type: {type(e)}")
            print(f"❌ Error details: {str(e)}")
            import traceback
            traceback.print_exc()
            return "I'm here to listen and help. Could you tell me more about what you're experiencing?"
    
    # Test with different emotions
    test_cases = [
        ("I'm feeling sad", "sad"),
        ("I'm happy today", "happy"),
        ("I'm angry", "angry"),
        ("Hello", "neutral")
    ]
    
    for message, emotion in test_cases:
        print(f"\n🎭 Testing: '{message}' with emotion '{emotion}'")
        result = generate_therapist_response_test(message, emotion, "test123")
        print(f"📝 Result: {result[:100]}...")
        
        if "I'm here to listen and help" in result:
            print("❌ Got fallback message - exception occurred!")
        else:
            print("✅ Got proper FIDO response!")

if __name__ == "__main__":
    test_server_environment()
