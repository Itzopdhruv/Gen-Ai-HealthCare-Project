def load_emotion_model():
    global emotion_model
    try:
        # Try to load the model from the AI THERAPIST directory
        model_path = "../AI THERAPIST/mobile_net_v2_firstmodel.h5"
        if os.path.exists(model_path):
            from keras.models import load_model
            try:
                emotion_model = load_model(model_path, compile=False)
                print("[SUCCESS] Emotion model loaded successfully from AI THERAPIST directory")
                return True
            except Exception as model_error:
                print(f"[ERROR] Model loading failed due to compatibility issues: {model_error}")
                print("[INFO] Using fallback emotion detection (no ML model)")
                return False
        else:
            print("[ERROR] Model file not found at:", model_path)
            print("[INFO] Using fallback emotion detection (no ML model)")
            return False
    except Exception as e:
        print(f"[ERROR] Error loading emotion model: {e}")
        print("[INFO] Using fallback emotion detection (no ML model)")
        return False
