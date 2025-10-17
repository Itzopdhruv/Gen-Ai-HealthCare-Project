#!/usr/bin/env python3
"""
Test script to verify AI Doctor deployment readiness
"""

import os
import sys
import importlib

def test_imports():
    """Test if all required modules can be imported"""
    required_modules = [
        'fastapi',
        'uvicorn',
        'groq',
        'dotenv',
        'pydantic',
        'PIL',
        'requests',
        'gtts',
        'pydub',
        'speech_recognition',
        'aiofiles',
        'httpx',
        'psutil'
    ]
    
    print("🔍 Testing module imports...")
    failed_imports = []
    
    for module in required_modules:
        try:
            importlib.import_module(module)
            print(f"✅ {module}")
        except ImportError as e:
            print(f"❌ {module}: {e}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"\n❌ Failed to import: {', '.join(failed_imports)}")
        return False
    else:
        print("\n✅ All modules imported successfully!")
        return True

def test_environment():
    """Test environment variables"""
    print("\n🔍 Testing environment variables...")
    
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        print("✅ GROQ_API_KEY is set")
    else:
        print("⚠️ GROQ_API_KEY not set (will be set in Render)")
    
    host = os.getenv("HOST", "0.0.0.0")
    port = os.getenv("PORT", "8000")
    print(f"✅ HOST: {host}")
    print(f"✅ PORT: {port}")
    
    return True

def test_file_structure():
    """Test if required files exist"""
    print("\n🔍 Testing file structure...")
    
    required_files = [
        'fastapi_app.py',
        'requirements.txt',
        'render.yaml',
        'runtime.txt',
        'Procfile'
    ]
    
    missing_files = []
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file}")
            missing_files.append(file)
    
    if missing_files:
        print(f"\n❌ Missing files: {', '.join(missing_files)}")
        return False
    else:
        print("\n✅ All required files present!")
        return True

def main():
    """Run all tests"""
    print("🚀 AI Doctor Deployment Test")
    print("=" * 40)
    
    tests = [
        test_imports,
        test_environment,
        test_file_structure
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 40)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Ready for deployment!")
        return 0
    else:
        print("❌ Some tests failed. Please fix issues before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
