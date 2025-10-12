# 🚨 Contradictory Drugs Testing Guide

## ✅ Implementation Status
The AI-powered drug interaction warning system is **FULLY IMPLEMENTED** in:
- `app/api/prescription/validate/route.ts` - Backend validation API
- `app/api/prescriptions/advanced-alternatives/route.ts` - Integrated warnings in alternatives

## 🔴 CRITICAL Interactions (Severe - DO NOT DISPENSE)

### Test Case 1: **Warfarin + Aspirin** ⚠️ LIFE-THREATENING
**Why Dangerous:** Increases bleeding risk 10x - can cause fatal hemorrhage

**Test in Prescription:**
1. Go to "New Prescription"
2. Add medicines:
   - `Warfarin 5mg` (Anticoagulant)
   - `Aspirin 100mg` (NSAID)
3. Patient Age: 65
4. Medical Conditions: Heart Disease

**Expected Warning:**
```
🚨 CRITICAL: Severe Bleeding Risk
Warfarin + Aspirin combination significantly increases bleeding risk 
and can cause life-threatening hemorrhage.
ACTION: DO NOT DISPENSE - Contact prescribing doctor immediately
```

---

### Test Case 2: **Warfarin + Ibuprofen** ⚠️ SEVERE
**Why Dangerous:** Causes gastrointestinal bleeding, reduced platelet function

**Test in Prescription:**
1. Go to "New Prescription"
2. Add medicines:
   - `Warfarin 5mg` (Anticoagulant)
   - `Ibuprofen 200mg` or `Ibuprofen 400mg`
3. Patient Age: 70
4. Medical Conditions: Arthritis

**Expected Warning:**
```
🚨 CRITICAL: Bleeding Risk
Warfarin + Ibuprofen increases bleeding risk and can cause 
severe gastrointestinal bleeding.
ACTION: DO NOT DISPENSE - Contact prescribing doctor immediately
```

---

### Test Case 3: **Metformin + Contrast Agent** ⚠️ CRITICAL
**Why Dangerous:** Lactic acidosis + kidney failure (can be fatal)

**Test in Prescription:**
1. Go to "New Prescription"
2. Add medicines:
   - `Metformin 500mg` (Diabetes medication)
   - `Contrast Agent` (for X-ray/CT scan)
3. Patient Age: 55
4. Medical Conditions: Diabetes, Kidney Disease

**Expected Warning:**
```
🚨 CRITICAL: Lactic Acidosis Risk
Metformin + Contrast agents can cause lactic acidosis and kidney failure.
ACTION: DO NOT DISPENSE - Contact prescribing doctor immediately
```

---

## ⚠️ WARNING Interactions (Moderate - Dispense with Caution)

### Test Case 4: **Digoxin + Furosemide** ⚠️ MODERATE
**Why Dangerous:** Furosemide depletes potassium → Digoxin toxicity

**Test in Prescription:**
1. Go to "New Prescription"
2. Add medicines:
   - `Digoxin 0.25mg` (Cardiac Glycoside)
   - `Furosemide 40mg` (Diuretic)
3. Patient Age: 75
4. Medical Conditions: Heart Failure

**Expected Warning:**
```
⚠️ WARNING: Digoxin Toxicity Risk
Furosemide can increase digoxin levels and cause digoxin toxicity.
Side effects to watch: Nausea, irregular heartbeat, visual disturbances.
ACTION: Monitor digoxin levels and symptoms of toxicity
```

---

### Test Case 5: **Aspirin + Ibuprofen** ⚠️ MODERATE
**Why Dangerous:** Ibuprofen blocks aspirin's heart protection

**Test in Prescription:**
1. Go to "New Prescription"
2. Add medicines:
   - `Aspirin 100mg` (Cardioprotection)
   - `Ibuprofen 200mg` (Pain relief)
3. Patient Age: 60
4. Medical Conditions: Heart Disease

**Expected Warning:**
```
⚠️ WARNING: Reduced Cardioprotection
Ibuprofen reduces aspirin's cardioprotective effect and may 
increase heart attack risk.
ACTION: Dispense with caution - Advise patient to take aspirin 
2 hours before ibuprofen
```

---

### Test Case 6: **Paracetamol (Dolo-650) + Warfarin** ⚠️ MODERATE
**Why Dangerous:** Paracetamol enhances warfarin's blood-thinning effect

**Test in Prescription:**
1. Go to "New Prescription"
2. Add medicines:
   - `Dolo-650` (Paracetamol 650mg)
   - `Warfarin 5mg`
3. Patient Age: 68
4. Medical Conditions: Atrial Fibrillation

**Expected Warning:**
```
⚠️ WARNING: Increased Bleeding Risk
Paracetamol may enhance warfarin's anticoagulant effect and 
increase bleeding risk.
ACTION: Monitor INR levels closely - Consider dose adjustment
```

---

## 🔵 CAUTION Interactions (Minor - Monitor Closely)

### Test Case 7: **Phenytoin + Warfarin** 🔵 MINOR
**Why Concerning:** Phenytoin reduces warfarin effectiveness

**Test in Prescription:**
1. Go to "New Prescription"
2. Add medicines:
   - `Phenytoin 100mg` (Anticonvulsant)
   - `Warfarin 5mg`
3. Patient Age: 45
4. Medical Conditions: Epilepsy, DVT

**Expected Warning:**
```
🔵 CAUTION: Altered Anticoagulation
Phenytoin may decrease warfarin effectiveness and increase clotting risk.
ACTION: Monitor INR levels and adjust warfarin dose as needed
```

---

## 📋 How to Test

### Step 1: Open Prescription Module
1. Navigate to http://localhost:3003
2. Click on "Prescriptions" tab
3. Click "New Prescription" or "Upload Prescription"

### Step 2: Add Contradictory Medicines
- If using OCR: Upload any prescription image, then manually add the contradictory drugs
- If manual entry: Click "Add Medicine Manually" and enter the medicine names above

### Step 3: Fill Patient Information
```
Patient Name: Test Patient
Age: [Use age from test case]
Doctor: Dr. Test
Allergies: [Leave blank or as per test case]
Medical Conditions: [As per test case]
```

### Step 4: Proceed to Alternatives
1. Click "Find Alternatives"
2. **Watch for warnings in:**
   - 🚨 Red boxes for CRITICAL interactions
   - ⚠️ Yellow boxes for WARNING interactions
   - 🔵 Blue boxes for CAUTION interactions
3. The AI will also provide detailed reasoning in the "AI Analysis" section

---

## 🎯 Expected Behavior

### Critical Interactions ❌
- **Should BLOCK billing** (or show prominent "DO NOT DISPENSE" warning)
- **Red alert banner** at the top
- **Require manager override** or prescriber contact

### Warning Interactions ⚠️
- **Allow billing** with warnings
- **Yellow alert banner**
- **Require patient counseling** notes

### Caution Interactions 🔵
- **Allow billing** with monitoring notes
- **Blue info banner**
- **Suggest follow-up** requirements

---

## 🧪 Additional Test Combinations

### Triple Interaction Test
**Medicines:**
- Warfarin 5mg
- Aspirin 100mg
- Ibuprofen 200mg

**Expected:** Multiple critical warnings should appear, blocking the prescription

### Diabetes + Heart Disease Patient
**Medicines:**
- Metformin 500mg
- Digoxin 0.25mg
- Furosemide 40mg

**Patient Conditions:** Diabetes, Heart Failure, Kidney Disease

**Expected:** Multiple warnings + AI should note all patient-specific risks

---

## 🔍 Where to See Warnings

### 1. During Alternatives Selection
- Warnings appear in the "PrescriptionProcessor" component
- Look for colored boxes under each medicine alternative

### 2. AI Analysis Section
- Detailed narrative explanation from Gemini AI
- Specific interaction mechanisms
- Patient-specific considerations

### 3. Continue to Billing
- Final warning summary before processing payment
- Option to print warning labels for patient

---

## 📊 Medicines Available for Testing

| Medicine Name | Category | Use | Stock |
|--------------|----------|-----|-------|
| Warfarin 5mg | Anticoagulant | Blood thinner | 15 |
| Aspirin 100mg | NSAID | Pain/Cardioprotection | 150 |
| Ibuprofen 200mg | NSAID | Pain relief | 120 |
| Ibuprofen 400mg | NSAID | Pain relief | 80 |
| Digoxin 0.25mg | Cardiac Glycoside | Heart failure | 12 |
| Furosemide 40mg | Diuretic | Fluid retention | 28 |
| Phenytoin 100mg | Anticonvulsant | Seizures | 18 |
| Metformin 500mg | Antidiabetic | Diabetes | 200 |
| Dolo-650 | Analgesic | Pain/Fever | 500 |

---

## ✅ Success Criteria

A successful test means:
1. ✅ Critical warnings appear in **RED** with "DO NOT DISPENSE"
2. ✅ Warning interactions appear in **YELLOW** with "Caution Required"
3. ✅ Caution interactions appear in **BLUE** with "Monitor Closely"
4. ✅ AI provides detailed reasoning and patient-specific warnings
5. ✅ Warnings persist through the billing process
6. ✅ Allergy warnings trigger for patient-specific allergies

---

## 🚀 Quick Test Commands

### Test 1: Severe Bleeding Risk
```
Medicine 1: Warfarin 5mg
Medicine 2: Aspirin 100mg
Result: CRITICAL - DO NOT DISPENSE
```

### Test 2: Digoxin Toxicity
```
Medicine 1: Digoxin 0.25mg
Medicine 2: Furosemide 40mg
Result: WARNING - Monitor Levels
```

### Test 3: Reduced Cardioprotection
```
Medicine 1: Aspirin 100mg
Medicine 2: Ibuprofen 200mg
Result: WARNING - Time Separation Required
```

---

## 📝 Notes

- All contradictory drugs are already in the database with proper stock levels
- The AI uses both hardcoded rules (for common critical interactions) and intelligent analysis (for rare combinations)
- Warnings are generated in real-time using Google Gemini AI
- The system considers patient age, allergies, and medical conditions
- Each warning includes specific action items for the pharmacist

**Current Implementation:** 
- ✅ Drug interaction detection
- ✅ AI-powered analysis
- ✅ Patient-specific warnings
- ✅ Severity-based color coding
- ✅ Actionable recommendations

