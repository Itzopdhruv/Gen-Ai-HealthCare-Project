# 🧪 Audio Output Testing Guide

## ✅ **System Status Check**

### 1. Backend Services
```bash
✅ Node.js Backend: Running on port 5001
✅ FastAPI Service: Running on port 8000
✅ FastAPI Health: {"status":"healthy","service":"AI Doctor","version":"1.0.0"}
```

---

## 🔍 **Testing Flow - Step by Step**

### **Phase 1: Frontend Component Check** ✅

**Location:** `main_website/frontend/src/components/AIDoctorTab.jsx`

**Test Steps:**
1. ✅ Open browser and navigate to AI Doctor tab
2. ✅ Check if messages are displaying
3. ✅ Look for "AUDIO OUTPUT:" label on AI responses
4. ✅ Verify speaker icon (🔊) is visible

**What to Look For:**
```
┌────────────────────────────────────────────────────┐
│ 🤖 AI Doctor Response                              │
│                                                    │
│ "Hello. I'm here to help with any health..."      │
│                                                    │
│ 05:25 PM  [ AUDIO OUTPUT: 🔊 ]                    │
│            └──────────────────┘                    │
│              ↑ Should see this badge               │
└────────────────────────────────────────────────────┘
```

**Expected State:**
- Badge opacity: 70% (visible but subtle)
- Text: "AUDIO OUTPUT:" in uppercase
- Icon: 🔊 SoundOutlined
- Background: Purple gradient (rgba(102, 126, 234, 0.15))

---

### **Phase 2: Hover Interaction** ✨

**Test Steps:**
1. ✅ Hover mouse over the "AUDIO OUTPUT:" badge
2. ✅ Check for visual changes

**Expected Behavior:**
```
Before Hover:
┌──────────────────────┐
│ AUDIO OUTPUT: 🔊     │  Opacity: 70%
└──────────────────────┘

During Hover:
┌──────────────────────┐
│ AUDIO OUTPUT: 🔊     │  Opacity: 100%
└──────────────────────┘  ↑ Lifts up 1px
                          Brighter glow
                          Box shadow visible
```

**CSS Changes to Verify:**
- Background brightens: `rgba(102, 126, 234, 0.15)` → `rgba(102, 126, 234, 0.25)`
- Border becomes more visible: `rgba(102, 126, 234, 0.3)` → `rgba(102, 126, 234, 0.5)`
- Transforms: `translateY(-1px)` (lifts up)
- Shadow: `0 4px 12px rgba(102, 126, 234, 0.2)` appears

---

### **Phase 3: Click & Loading State** ⏳

**Test Steps:**
1. ✅ Click the speaker icon
2. ✅ Observe loading state

**Expected Flow:**
```
Click! 
  ↓
┌──────────────────────┐
│ AUDIO OUTPUT: ⏳     │  ← Loading spinner appears
└──────────────────────┘
  ↓
State: loadingAudioId = "messageId"
Console: "🔊 Attempting to play audio..."
  ↓
API Call to FastAPI...
```

**Console Logs to Check:**
```javascript
// Should see in browser console (F12):
"🔊 Attempting to play audio for message: 1728734572-0"
"Fetching TTS from FastAPI..."
"POST http://localhost:8000/text-to-speech"
```

---

### **Phase 4: FastAPI TTS Generation** 🎙️

**Test Steps:**
1. ✅ Monitor network tab in browser DevTools
2. ✅ Check API request/response

**Expected Network Activity:**

**Request:**
```http
POST http://localhost:8000/text-to-speech
Content-Type: multipart/form-data

Body:
  text: "Hello. I'm here to help with any health-related questions..."
```

**Response:**
```json
HTTP 200 OK
{
  "success": true,
  "audio_file": "tts_output.mp3",
  "message": "Text converted to speech successfully"
}
```

**Backend Processing (Python):**
```python
# voice_of_the_doctor.py
1. Receive text input
2. Create gTTS object
3. audioobj = gTTS(text=input_text, lang='en', slow=False, tld='com')
4. Save to disk: audioobj.save("tts_output.mp3")
5. Return file path
```

**To Verify:**
- Check `ai-doctor-2.0-voice-and-vision/` folder
- Should see `tts_output.mp3` file created
- File size should be > 0 bytes

---

### **Phase 5: Audio File Serving** 📡

**Test Steps:**
1. ✅ Check second network request for audio file
2. ✅ Verify audio file downloads

**Expected Network Activity:**

**Request:**
```http
GET http://localhost:8000/audio/tts_output.mp3
```

**Response:**
```http
HTTP 200 OK
Content-Type: audio/mpeg
Content-Disposition: inline; filename=tts_output.mp3
Content-Length: [file size in bytes]

[Binary MP3 data]
```

**Audio File Details:**
- Format: MP3 (MPEG Audio Layer 3)
- Encoding: Google TTS voice
- Language: English (en)
- Quality: Standard gTTS quality

---

### **Phase 6: Audio Playback** 🔊

**Test Steps:**
1. ✅ Listen for audio output
2. ✅ Check visual feedback

**Expected Behavior:**

**Before Playing:**
```javascript
// State
speakingMessageId: null
loadingAudioId: "message-1728734572-0"

// UI
Icon: ⏳ (Loading spinner)
```

**During Playing:**
```javascript
// State
speakingMessageId: "message-1728734572-0"
loadingAudioId: null

// UI
Icon: 🔊 (SoundOutlined)
Color: #667eea (PURPLE)
Tooltip: "Stop"
```

**Visual Changes:**
```
Before Play:
┌──────────────────────┐
│ AUDIO OUTPUT: 🔊     │  White/Gray
└──────────────────────┘

During Play:
┌──────────────────────┐
│ AUDIO OUTPUT: 🔊     │  PURPLE (#667eea)
└──────────────────────┘
```

**Audio Characteristics:**
- Voice: Google TTS English voice
- Speed: Normal (controlled by gTTS, not adjustable via frontend)
- Quality: High (Google's neural TTS)

---

### **Phase 7: Fallback to Browser TTS** 🌐

**Test Steps:**
1. ✅ Stop FastAPI service
2. ✅ Click audio button again
3. ✅ Verify browser TTS activates

**Expected Flow:**
```
Click 🔊
  ↓
Try FastAPI
  ↓
❌ Fetch Error (Connection refused)
  ↓
Console: "FastAPI TTS unavailable, using browser TTS"
  ↓
Activate Web Speech API
  ↓
🔊 Browser voice plays!
```

**Browser TTS Settings:**
```javascript
utterance.rate = 1.3;      // 30% faster than normal ⚡
utterance.pitch = 1.0;     // Normal pitch
utterance.volume = 1.0;    // Full volume
utterance.lang = 'en-US';  // English (US)

// Voice Selection Priority:
1. voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
2. voices.find(v => v.lang.startsWith('en'))
3. Default system voice
```

**To Test Fallback:**
```powershell
# Stop FastAPI (in separate terminal)
# Press Ctrl+C in the FastAPI terminal

# Or kill the process
Get-Process -Id 19584 | Stop-Process
```

**Console Logs:**
```javascript
"⚠️ FastAPI TTS unavailable, using browser TTS: Failed to fetch"
"🔊 Using browser Web Speech API"
"Selected voice: Google UK English Female" // (or similar)
```

---

### **Phase 8: Stop Audio** ⏹️

**Test Steps:**
1. ✅ Click speaker icon while audio is playing
2. ✅ Verify audio stops immediately

**Expected Behavior:**

**During Play (Click 🔊):**
```javascript
// Check: speakingMessageId === messageId?
if (speakingMessageId === messageId) {
  // Stop audio
  audioRef.current.pause();
  setSpeakingMessageId(null);
  return; // Exit early
}
```

**Visual Feedback:**
```
Before Click:
┌──────────────────────┐
│ AUDIO OUTPUT: 🔊     │  PURPLE (playing)
└──────────────────────┘

After Click:
┌──────────────────────┐
│ AUDIO OUTPUT: 🔊     │  Gray (stopped)
└──────────────────────┘
```

**Audio State:**
- `audioRef.current.pause()` called
- `speakingMessageId` set to `null`
- Icon color returns to normal
- Tooltip changes from "Stop" to "Listen"

---

### **Phase 9: Multiple Messages** 🎵

**Test Steps:**
1. ✅ Send multiple messages to AI Doctor
2. ✅ Each response should have audio button
3. ✅ Play one, then play another
4. ✅ Verify first stops when second starts

**Expected Behavior:**

**Message 1 playing:**
```
Message 1: [ AUDIO OUTPUT: 🔊 ]  ← PURPLE (playing)
Message 2: [ AUDIO OUTPUT: 🔊 ]  ← Gray (idle)
Message 3: [ AUDIO OUTPUT: 🔊 ]  ← Gray (idle)
```

**Click Message 2 audio:**
```javascript
// handleSpeak() is called
1. Stop any currently playing audio
   - audioRef.current.pause() // Stops Message 1
   - window.speechSynthesis.cancel()
   
2. Start new audio for Message 2
   - setLoadingAudioId("message-2-id")
   - Fetch/Generate audio
   - Play Message 2
```

**Result:**
```
Message 1: [ AUDIO OUTPUT: 🔊 ]  ← Gray (stopped)
Message 2: [ AUDIO OUTPUT: 🔊 ]  ← PURPLE (playing)
Message 3: [ AUDIO OUTPUT: 🔊 ]  ← Gray (idle)
```

**State Management:**
```javascript
// Only ONE message can speak at a time
speakingMessageId: "message-2-id"  // Only one ID stored
loadingAudioId: null               // No loading
audioRef.current: <Audio object>   // Only one audio instance
```

---

### **Phase 10: Error Handling** ❌

**Test Scenarios:**

#### **Scenario 1: FastAPI Down**
```javascript
// Expected
Try FastAPI → Fail → Fallback to Browser TTS → Success
Console: "⚠️ FastAPI TTS unavailable, using browser TTS"
No error shown to user (silent fallback)
```

#### **Scenario 2: Audio File Not Found**
```javascript
// Expected
GET /audio/tts_output.mp3 → 404 Not Found
audio.onerror triggered
Console: "FastAPI audio playback failed, falling back to Web Speech API"
Fallback to Browser TTS
```

#### **Scenario 3: Browser TTS Not Supported**
```javascript
// Expected
if (!window.speechSynthesis) {
  message.error('Text-to-speech not supported in this browser');
  return;
}
// Show error message to user
// No audio plays
```

#### **Scenario 4: Network Error**
```javascript
// Expected
catch (error) {
  console.error('TTS Error:', error);
  message.error('Failed to play audio');
  setSpeakingMessageId(null);
  setLoadingAudioId(null);
}
// User sees error notification
// State is reset
```

---

## 🎯 **Complete Test Checklist**

### ✅ Visual Tests
- [ ] "AUDIO OUTPUT:" label is visible
- [ ] Speaker icon (🔊) is present
- [ ] Badge has purple gradient background
- [ ] Badge opacity is 70% by default
- [ ] Hover increases opacity to 100%
- [ ] Hover adds glow effect
- [ ] Hover lifts badge up 1px

### ✅ Interaction Tests
- [ ] Click shows loading spinner
- [ ] Audio starts playing
- [ ] Icon turns purple during playback
- [ ] Tooltip changes to "Stop" when playing
- [ ] Click again stops audio
- [ ] Only one audio plays at a time

### ✅ FastAPI Tests
- [ ] POST /text-to-speech returns success
- [ ] Audio file is generated (tts_output.mp3)
- [ ] GET /audio/{filename} serves MP3 file
- [ ] Audio quality is good (Google TTS)

### ✅ Browser TTS Tests
- [ ] Fallback activates when FastAPI unavailable
- [ ] Browser voice is selected correctly
- [ ] Speed is 1.3x (30% faster)
- [ ] Audio plays smoothly

### ✅ Error Handling Tests
- [ ] FastAPI down → Browser TTS works
- [ ] Audio file 404 → Browser TTS works
- [ ] No browser TTS → Error message shown
- [ ] Network error → User notified

### ✅ State Management Tests
- [ ] speakingMessageId updates correctly
- [ ] loadingAudioId shows during generation
- [ ] audioRef persists across renders
- [ ] Cleanup on unmount works
- [ ] No memory leaks

### ✅ Multiple Messages Tests
- [ ] Each message has audio button
- [ ] Independent controls for each
- [ ] Playing one stops others
- [ ] State tracking per message works

---

## 🔧 **Debugging Commands**

### Check Backend Status
```powershell
# Node.js Backend (port 5001)
netstat -ano | findstr :5001

# FastAPI (port 8000)
netstat -ano | findstr :8000
```

### Test FastAPI Endpoints
```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET

# List all endpoints
Invoke-WebRequest -Uri "http://localhost:8000/docs" -Method GET
```

### Check Audio File
```powershell
# Navigate to FastAPI directory
cd ai-doctor-2.0-voice-and-vision

# List audio files
dir *.mp3

# Check file size
(Get-Item tts_output.mp3).length
```

### Browser Console Tests
```javascript
// Open browser console (F12) and run:

// Test if Web Speech API is available
console.log('Speech Synthesis:', window.speechSynthesis);

// List available voices
window.speechSynthesis.getVoices().forEach(voice => {
  console.log(voice.name, voice.lang);
});

// Test creating utterance
const test = new SpeechSynthesisUtterance("Hello");
test.rate = 1.3;
window.speechSynthesis.speak(test);
```

---

## 📊 **Performance Metrics**

### Expected Timings:
- **Click to Loading**: < 50ms (instant)
- **Loading to Play** (FastAPI): 1-3 seconds
- **Loading to Play** (Browser): < 500ms (instant)
- **Audio Duration**: ~5-10 seconds per message
- **Stop Response**: < 50ms (instant)

### Network Bandwidth:
- **TTS Request**: ~1 KB (text data)
- **Audio File**: ~50-200 KB (depends on text length)
- **Total per play**: ~50-201 KB

---

## 🎓 **Common Issues & Solutions**

### Issue 1: No Audio Button Visible
**Symptoms:** Can't see "AUDIO OUTPUT:" badge
**Solution:** 
1. Check CSS file loaded correctly
2. Verify `msg.type === 'doctor'` condition
3. Check browser console for errors
4. Refresh page (Ctrl+Shift+R)

### Issue 2: Loading Forever
**Symptoms:** Spinner never stops
**Solution:**
1. Check FastAPI is running: `netstat -ano | findstr :8000`
2. Check browser Network tab for API errors
3. Verify CORS is enabled on FastAPI
4. Check console for error messages

### Issue 3: No Sound Plays
**Symptoms:** Icon turns purple but no audio
**Solution:**
1. Check browser volume settings
2. Check system volume
3. Check browser audio permissions
4. Try browser TTS: `window.speechSynthesis.speak(new SpeechSynthesisUtterance("test"))`
5. Check audio file exists: `dir ai-doctor-2.0-voice-and-vision\tts_output.mp3`

### Issue 4: Slow/Robotic Voice
**Symptoms:** Voice sounds unnatural
**Solution:**
1. If using browser TTS: Normal (varies by browser)
2. If using FastAPI: Should be natural Google voice
3. Check which system is being used in console logs
4. Restart FastAPI if audio file corrupted

---

## 🚀 **Manual Test Script**

Run through this script to verify everything works:

```
1. Open browser and navigate to AI Doctor
   ✓ Page loads
   ✓ Can see chat interface

2. Send message: "hi"
   ✓ AI responds
   ✓ "AUDIO OUTPUT:" badge appears

3. Hover over audio badge
   ✓ Badge glows
   ✓ Badge lifts up
   ✓ Tooltip shows "Listen"

4. Click speaker icon
   ✓ Spinner appears
   ✓ Audio starts playing
   ✓ Icon turns purple
   ✓ Tooltip changes to "Stop"

5. Listen to audio
   ✓ Voice is clear
   ✓ Speed is good (1.3x for browser TTS)
   ✓ Volume is audible

6. Click icon while playing
   ✓ Audio stops immediately
   ✓ Icon returns to gray
   ✓ Tooltip changes to "Listen"

7. Send another message
   ✓ Second message has audio button
   ✓ Can play second audio
   ✓ First audio stops when second starts

8. Stop FastAPI (Ctrl+C)
   ✓ Click audio on new message
   ✓ Falls back to browser TTS
   ✓ Console shows fallback message
   ✓ Audio still plays

9. Restart FastAPI
   ✓ Next audio uses FastAPI
   ✓ High-quality Google voice

10. Close AI Doctor tab
    ✓ No audio continues playing
    ✓ No errors in console
```

---

## ✅ **Test Results Summary**

**Current Status:**
- ✅ Node.js Backend: RUNNING (Port 5001)
- ✅ FastAPI Service: RUNNING (Port 8000)
- ✅ Health Check: PASSED
- ⏳ Frontend Component: NEEDS USER TESTING
- ⏳ Audio Playback: NEEDS USER TESTING
- ⏳ Browser TTS Fallback: NEEDS USER TESTING

**Next Steps:**
1. Open browser and test frontend
2. Click audio button and verify playback
3. Test fallback by stopping FastAPI
4. Report any issues

---

**Testing Date:** 2025-10-12  
**Tester:** AI Assistant  
**Version:** 1.0  
**Voice Speed:** 1.3x (Browser TTS)

