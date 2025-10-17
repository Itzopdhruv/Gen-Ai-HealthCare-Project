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
        # Ensure face ROI is C-contiguous before processing
        face_roi = np.ascontiguousarray(face_roi)
        
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
