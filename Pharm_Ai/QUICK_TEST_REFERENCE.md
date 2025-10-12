# 🚀 Quick Test Reference Card - Contradictory Drugs

## 🎯 FASTEST TESTS (Copy-Paste Ready)

### Test 1: CRITICAL - Bleeding Risk ⚠️⚠️⚠️
```
Medicine 1: Warfarin 5mg       (Quantity: 1)
Medicine 2: Aspirin 100mg      (Quantity: 1)
Patient Age: 65
Conditions: Heart Disease
Expected: 🚨 RED ALERT - DO NOT DISPENSE
```

### Test 2: WARNING - Digoxin Toxicity ⚠️⚠️
```
Medicine 1: Digoxin 0.25mg     (Quantity: 1)
Medicine 2: Furosemide 40mg    (Quantity: 1)
Patient Age: 75
Conditions: Heart Failure
Expected: ⚠️ YELLOW ALERT - Monitor Levels
```

### Test 3: WARNING - Cardioprotection Loss ⚠️
```
Medicine 1: Aspirin 100mg      (Quantity: 1)
Medicine 2: Ibuprofen 200mg    (Quantity: 1)
Patient Age: 60
Conditions: Heart Disease
Expected: ⚠️ YELLOW ALERT - Time Separation
```

---

## 📋 Step-by-Step Testing

### Option A: Manual Entry
1. Click "New Prescription"
2. Click "Add Medicine Manually"
3. Fill patient info:
   ```
   Name: Test Patient
   Age: [from test case]
   Doctor: Dr. Test
   Allergies: [leave blank]
   Medical Conditions: [from test case]
   ```
4. Add medicines (type exact names from test case)
5. Click "Find Alternatives"
6. **Look for colored warning boxes!**

### Option B: OCR Upload
1. Click "Upload Prescription"
2. Upload any prescription image
3. After OCR processing, click "Edit"
4. Replace medicines with test case medicines
5. Update patient conditions
6. Click "Find Alternatives"
7. **Look for colored warning boxes!**

---

## 🎨 What to Look For

### 🚨 CRITICAL Warning (RED)
```
┌────────────────────────────────────────┐
│ 🚨 CRITICAL: Severe Bleeding Risk      │
│ Warfarin + Aspirin increases bleeding  │
│ risk and can cause fatal hemorrhage    │
│                                        │
│ ACTION: DO NOT DISPENSE               │
│ Contact doctor immediately!            │
└────────────────────────────────────────┘
```

### ⚠️ WARNING (YELLOW)
```
┌────────────────────────────────────────┐
│ ⚠️ WARNING: Digoxin Toxicity Risk      │
│ Furosemide increases digoxin levels    │
│                                        │
│ ACTION: Monitor digoxin levels         │
└────────────────────────────────────────┘
```

### 🔵 CAUTION (BLUE)
```
┌────────────────────────────────────────┐
│ 🔵 CAUTION: Altered Anticoagulation    │
│ Monitor INR levels closely             │
│                                        │
│ ACTION: Adjust warfarin dose           │
└────────────────────────────────────────┘
```

---

## ✅ All Medicines Ready in Database

| Medicine | Stock | Category | Ready? |
|----------|-------|----------|--------|
| Warfarin 5mg | 15 | Anticoagulant | ✅ |
| Aspirin 100mg | 150 | NSAID | ✅ |
| Ibuprofen 200mg | 120 | NSAID | ✅ |
| Ibuprofen 400mg | 80 | NSAID | ✅ |
| Digoxin 0.25mg | 12 | Cardiac | ✅ |
| Furosemide 40mg | 28 | Diuretic | ✅ |
| Phenytoin 100mg | 18 | Anticonvulsant | ✅ |
| Metformin 500mg | 200 | Diabetes | ✅ |
| Dolo-650 | 500 | Pain Relief | ✅ |

---

## 🏆 Best Test for Demo

### **Test: Triple Threat (Most Impressive)**
```
Medicine 1: Warfarin 5mg
Medicine 2: Aspirin 100mg
Medicine 3: Ibuprofen 200mg

Patient:
- Age: 70
- Conditions: Heart Disease, Arthritis
- Allergies: None

Expected Result:
🚨 MULTIPLE CRITICAL WARNINGS
- Warfarin + Aspirin: CRITICAL bleeding risk
- Warfarin + Ibuprofen: CRITICAL bleeding risk
- Aspirin + Ibuprofen: WARNING cardioprotection loss

AI Analysis: "This prescription combination poses 
SEVERE RISK of life-threatening bleeding. The patient 
is on triple antiplatelet therapy which is extremely 
dangerous. IMMEDIATE DOCTOR CONSULTATION REQUIRED."
```

---

## 📞 What to Show Judges

1. **Show the normal flow first:**
   - Add safe medicines (Paracetamol + Omeprazole)
   - Show it processes smoothly ✅

2. **Then show the AI safety system:**
   - Add Warfarin + Aspirin
   - Show the RED CRITICAL alert 🚨
   - Highlight "DO NOT DISPENSE" action

3. **Explain the impact:**
   > "This AI system can prevent fatal medical errors.
   > In real pharmacies, drug interactions cause 
   > 200,000+ hospitalizations annually. Our system 
   > catches these in real-time!"

4. **Show the alternatives:**
   - System suggests safer alternatives
   - Shows why each alternative is better
   - Provides patient-specific recommendations

---

## 💡 Pro Tips

1. **Clear browser cache** between tests (Ctrl+Shift+R / Cmd+Shift+R)
2. **Check terminal logs** for detailed AI analysis
3. **Test with real patient conditions** for more realistic warnings
4. **Try the allergy test:** Add "Dolo-650" allergy, then prescribe Paracetamol 500mg
5. **Combine interactions:** Add 3+ medicines to see multiple warnings

---

## 🐛 If Warnings Don't Appear

1. Check terminal - are medicines being found?
   ```
   ✅ Found match for "Warfarin 5mg"
   ✅ Found match for "Aspirin 100mg"
   ```

2. Hard refresh browser (Ctrl+Shift+R)

3. Check medicine names - must be exact:
   - ✅ "Warfarin 5mg"
   - ❌ "Warfarin"
   - ❌ "warfarin 5mg"

4. Verify patient conditions match test case

5. Look for warnings in multiple places:
   - Main alternatives section
   - AI Analysis box
   - Side effects section

---

## 🎬 Demo Script

```
"Let me show you our AI-powered drug interaction 
warning system. I'll add a dangerous combination 
that could cause fatal bleeding..."

[Add Warfarin + Aspirin]

"Watch what happens... The AI immediately detects 
this CRITICAL interaction and blocks the prescription!"

[Point to RED warning]

"It even tells the pharmacist exactly what to do:
'DO NOT DISPENSE - Contact doctor immediately.'

This is powered by Google Gemini AI, analyzing:
✓ Drug interactions
✓ Patient allergies  
✓ Medical conditions
✓ Age-specific risks
✓ Side effects

All in real-time, preventing potentially fatal errors!"
```

---

**Ready to test! 🚀**

Start with **Test 1** (Warfarin + Aspirin) for the most dramatic effect!

