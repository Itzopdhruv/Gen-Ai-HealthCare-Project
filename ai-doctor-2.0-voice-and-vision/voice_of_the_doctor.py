# if you dont use pipenv uncomment the following:
# from dotenv import load_dotenv
# load_dotenv()

#Step1a: Setup Text to Speech–TTS–model with gTTS
import os
from gtts import gTTS

def text_to_speech_with_gtts_old(input_text, output_filepath):
    language="en"

    audioobj= gTTS(
        text=input_text,
        lang=language,
        slow=False
    )
    audioobj.save(output_filepath)


input_text="Hi this is Ai with Hassan!"
text_to_speech_with_gtts_old(input_text=input_text, output_filepath="gtts_testing.mp3")

#Step1b: ElevenLabs functionality removed - using only Google TTS 

#Step2: Use Model for Text output to Voice

import subprocess
import platform
from pydub import AudioSegment
from pydub.playback import play

def text_to_speech_with_gtts(input_text, output_filepath, lang="en", speed=1.4):
    """
    Convert text to speech using Google TTS with language and speed support
    
    Args:
        input_text: Text to convert to speech
        output_filepath: Path to save the audio file
        lang: Language code (default: "en")
              Supported: "en" (English), "hi" (Hindi), "mr" (Marathi), etc.
        speed: Playback speed multiplier (default: 1.67)
               1.0 = normal, 1.67 = 67% faster, 2.0 = double speed
    
    Returns:
        str: Path to the generated audio file
    """
    # Generate TTS audio
    audioobj = gTTS(
        text=input_text,
        lang=lang,
        slow=False
    )
    
    # Save to temporary file first
    temp_filepath = output_filepath.replace('.mp3', '_temp.mp3')
    audioobj.save(temp_filepath)
    
    # Speed up the audio if speed != 1.0
    if speed != 1.0:
        try:
            # Load audio
            audio = AudioSegment.from_mp3(temp_filepath)
            
            # Change speed (increase frame rate)
            # speed > 1.0 = faster, speed < 1.0 = slower
            new_frame_rate = int(audio.frame_rate * speed)
            
            # Apply speed change
            fast_audio = audio._spawn(audio.raw_data, overrides={
                "frame_rate": new_frame_rate
            })
            
            # Convert back to original frame rate (maintains speed but correct pitch)
            fast_audio = fast_audio.set_frame_rate(audio.frame_rate)
            
            # Export final audio
            fast_audio.export(output_filepath, format="mp3")
            
            # Clean up temp file
            import os
            os.remove(temp_filepath)
            
        except Exception as e:
            print(f"Warning: Could not apply speed change: {e}")
            # If speed change fails, use original
            import os
            os.rename(temp_filepath, output_filepath)
    else:
        # No speed change needed, just rename
        import os
        os.rename(temp_filepath, output_filepath)
    
    # Return the file path so Gradio can use it
    return output_filepath


input_text="Hi this is Ai with Hassan, autoplay testing!"
#text_to_speech_with_gtts(input_text=input_text, output_filepath="gtts_testing_autoplay.mp3")


# ElevenLabs function removed - using only Google TTS