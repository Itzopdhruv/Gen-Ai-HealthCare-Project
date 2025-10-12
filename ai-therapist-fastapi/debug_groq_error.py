#!/usr/bin/env python3
"""
Test script to debug the exact error in generate_therapist_response
"""

import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv('config.env')

def test_groq_api_call():
    """Test the exact Groq API call from generate_therapist_response"""
    
    print("🔍 Testing Groq API call with exact parameters...")
    print("=" * 60)
    
    # Initialize Groq client
    groq_api_key = os.getenv('GROQ_API_KEY')
    groq_client = Groq(api_key=groq_api_key)
    
    # Test different model names
    models_to_test = [
        "llama-3.1-8b-instant",
        "llama-3.1-70b-versatile", 
        "llama-3.1-8b",
        "mixtral-8x7b-32768",
        "gemma-7b-it"
    ]
    
    for model in models_to_test:
        print(f"\n🤖 Testing model: {model}")
        try:
            response = groq_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Hello, test message"}
                ],
                temperature=0.8,
                max_tokens=200,
                top_p=0.9
            )
            
            ai_response = response.choices[0].message.content
            print(f"✅ Model {model} works!")
            print(f"📝 Response: {ai_response[:50]}...")
            return model  # Return the working model
            
        except Exception as e:
            print(f"❌ Model {model} failed: {e}")
            print(f"❌ Error type: {type(e)}")
    
    return None

def test_exact_function_call():
    """Test the exact function call that's failing"""
    
    print("\n🎭 Testing exact generate_therapist_response call...")
    print("=" * 60)
    
    # Initialize Groq client
    groq_api_key = os.getenv('GROQ_API_KEY')
    groq_client = Groq(api_key=groq_api_key)
    
    # Simulate the exact call from generate_therapist_response
    emotion = "sad"
    message = "I'm feeling really down today"
    session_id = "test123"
    
    # Create the exact prompts
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
    Recent emotions: None
    Respond as FIDO, acknowledging their {emotion} mood and providing appropriate support."""
    
    print(f"🎭 Emotion: {emotion}")
    print(f"💬 Message: {message}")
    print(f"📋 System prompt length: {len(system_prompt)}")
    print(f"📋 User prompt length: {len(user_prompt)}")
    
    try:
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
        print(f"✅ Function call successful!")
        print(f"🤖 FIDO Response: {ai_response}")
        return True
        
    except Exception as e:
        print(f"❌ Function call failed: {e}")
        print(f"❌ Error type: {type(e)}")
        print(f"❌ Error details: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 Debugging Groq API Issues...")
    
    # Test 1: Check which models work
    working_model = test_groq_api_call()
    
    # Test 2: Test exact function call
    success = test_exact_function_call()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 The exact function call works!")
        print("💡 The issue might be in the server environment or imports")
    else:
        print("❌ The exact function call fails!")
        if working_model:
            print(f"💡 Try using model: {working_model}")
        else:
            print("💡 Check Groq API status and model availability")
