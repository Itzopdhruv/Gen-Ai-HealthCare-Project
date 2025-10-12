# 🧪 Testing Guide for AI Pharmacy Features

## 📋 **Complete Test Scenarios with Patient Information**

### **🎯 Test Scenario 1: Pain Relief Medicine with Allergy Check**

#### Patient Information:
- **Name**: John Doe
- **Age**: 45
- **Allergies**: Aspirin, NSAIDs
- **Medical Conditions**: Hypertension, Diabetes
- **Requested Medicine**: Ibuprofen 400mg (3 units)

#### Expected Results:
- ✅ System should WARN about NSAID allergy
- ✅ Suggest Paracetamol as safe alternative
- ✅ Show side effects: Nausea, Stomach upset
- ✅ Check drug interactions with diabetes medications
- ✅ Display compatibility score based on patient profile

#### How to Test:
1. Go to Prescriptions
2. Add medicine manually or upload prescription
3. Enter patient info with allergies: "Aspirin, NSAIDs"
4. Add medicine: Ibuprofen 400mg, Quantity: 3
5. Check alternatives - should show WARNING about allergy

---

### **🎯 Test Scenario 2: Anticoagulant with Drug Interaction**

#### Patient Information:
- **Name**: Sarah Johnson  
- **Age**: 65
- **Allergies**: None
- **Medical Conditions**: Atrial Fibrillation, High Blood Pressure
- **Current Medications**: Warfarin 5mg
- **Requested Medicine**: Aspirin 100mg (1 unit)

#### Expected Results:
- 🚨 **CRITICAL WARNING**: Warfarin + Aspirin = Severe bleeding risk
- ✅ System should prevent dispensing
- ✅ Show detailed interaction analysis
- ✅ Recommend contacting doctor
- ✅ Display risk level: CRITICAL

#### How to Test:
1. Go to Prescription Validator page: `/prescription-validator`
2. Enter patient age: 65
3. Add Medicine 1: Warfarin, 5mg, Once daily
4. Add Medicine 2: Aspirin, 100mg, Once daily
5. Click "Validate Prescription"
6. Should show CRITICAL warning with bleeding risk

---

### **🎯 Test Scenario 3: Out of Stock with Alternatives**

#### Patient Information:
- **Name**: Michael Chen
- **Age**: 35
- **Allergies**: Penicillin
- **Medical Conditions**: None
- **Requested Medicine**: Dolo-650 (2 units)

#### Expected Results:
- ⚠️ Show "Out of Stock" for Dolo-650
- ✅ Suggest alternatives: Paracetamol 500mg, Aspirin 100mg
- ✅ Display side effects for each alternative
- ✅ Show stock availability
- ✅ Calculate similarity score
- ✅ Display AI reasoning for each alternative

#### How to Test:
1. Go to Prescriptions
2. Add medicine manually: "Dolo-650"
3. Set quantity: 2
4. System will check inventory and show alternatives
5. Each alternative should show:
   - Side effects
   - Warnings
   - AI reasoning
   - Stock status
   - Compatibility score

---

### **🎯 Test Scenario 4: Elderly Patient with Multiple Conditions**

#### Patient Information:
- **Name**: Robert Martinez
- **Age**: 75
- **Allergies**: Sulfa drugs
- **Medical Conditions**: Kidney Disease, Heart Failure, Diabetes
- **Current Medications**: Digoxin, Furosemide, Metformin
- **Requested Medicine**: Ibuprofen 400mg

#### Expected Results:
- 🚨 **CONTRAINDICATED**: Ibuprofen with kidney disease
- ⚠️ **WARNING**: Drug interaction with Furosemide (electrolyte imbalance)
- ✅ Suggest safer alternative: Paracetamol 500mg
- ✅ Show reduced dosage recommendations for elderly
- ✅ Display monitoring requirements

#### How to Test:
1. Go to Prescription Validator
2. Enter:
   - Age: 75
   - Medical Conditions: "Kidney Disease, Heart Failure, Diabetes"
   - Medicines: Digoxin, Furosemide, Metformin, Ibuprofen
3. Click Validate
4. Should show multiple warnings and contraindications

---

### **🎯 Test Scenario 5: Pregnant Patient with Safety Concerns**

#### Patient Information:
- **Name**: Emily Watson
- **Age**: 28
- **Allergies**: None
- **Medical Conditions**: Pregnancy (2nd trimester)
- **Requested Medicine**: Ibuprofen 400mg

#### Expected Results:
- 🚨 **CONTRAINDICATED**: NSAIDs in pregnancy
- ✅ Suggest: Paracetamol (pregnancy category B)
- ✅ Show safety information
- ✅ Recommend consulting obstetrician

#### How to Test:
1. Add patient with condition: "Pregnancy"
2. Request Ibuprofen
3. System should flag contraindication
4. Suggest safer alternative (Paracetamol)

---

### **🎯 Test Scenario 6: Allergic Reaction Prevention**

#### Patient Information:
- **Name**: David Lee
- **Age**: 42
- **Allergies**: Aspirin, Ibuprofen, All NSAIDs
- **Medical Conditions**: Asthma
- **Requested Medicine**: Naproxen 220mg

#### Expected Results:
- 🚨 **ALLERGY ALERT**: Naproxen is an NSAID
- ✅ Suggest non-NSAID alternative: Paracetamol
- ✅ Show aspirin-sensitive asthma warning
- ✅ Recommend allergy testing

---

## 🧪 **Quick Test Commands**

### Test 1: Check Alternatives API
```bash
curl -X POST http://localhost:3002/api/medicines/alternatives \
  -H "Content-Type: application/json" \
  -d '{
    "medicineName": "Dolo-650",
    "requestedQuantity": 2,
    "patientAge": 45,
    "allergies": ["Aspirin"],
    "medicalConditions": ["Hypertension"]
  }'
```

### Test 2: Validate Prescription with Drug Interactions
```bash
curl -X POST http://localhost:3002/api/prescription/validate \
  -H "Content-Type: application/json" \
  -d '{
    "medicines": [
      {"name": "Warfarin", "dosage": "5mg", "frequency": "Once daily"},
      {"name": "Aspirin", "dosage": "100mg", "frequency": "Once daily"}
    ],
    "patientInfo": {
      "age": 65,
      "gender": "male",
      "medicalConditions": ["Atrial Fibrillation"]
    }
  }'
```

### Test 3: Health Monitoring
```bash
curl -X POST http://localhost:3002/api/ai/health-monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "vitalSigns": {
      "bloodPressure": {"systolic": 140, "diastolic": 90},
      "heartRate": 85,
      "temperature": 37.2,
      "bloodSugar": 150
    },
    "symptoms": ["headache", "fatigue"],
    "medications": ["Metformin", "Aspirin"],
    "age": 60,
    "gender": "male"
  }'
```

---

## 📝 **Expected Database Medicines for Testing**

### Pain Relief Category:
- ✅ **Paracetamol 500mg** - Stock: 45 units
- ✅ **Aspirin 100mg** - Stock: 25 units  
- ✅ **Ibuprofen 400mg** - Stock: 30 units
- ✅ **Naproxen 220mg** - Stock: 18 units
- ❌ **Dolo-650** - Stock: 0 units (OUT OF STOCK)

### Cardiac Category:
- ✅ **Warfarin 5mg** - Stock: 15 units
- ✅ **Digoxin 0.25mg** - Stock: 12 units
- ✅ **Furosemide 40mg** - Stock: 28 units

### Anticonvulsant:
- ✅ **Phenytoin 100mg** - Stock: 18 units

### Diabetes:
- ✅ **Metformin 500mg** - Stock: 60 units

### Antacids:
- ❌ **Belladonna Tincture** - Stock: 0 units (OUT OF STOCK)
- ✅ **Aluminum Hydroxide Gel** - Stock: 15 units
- ✅ **Calcium Carbonate** - Stock: 25 units
- ✅ **Omeprazole 20mg** - Stock: 22 units

---

## 🎯 **Features to Demonstrate**

### 1. AI Doctor Chatbot
- Ask: "What are the side effects of Warfarin?"
- Ask: "Can I take Aspirin with Ibuprofen?"
- Ask: "What medicine is safe for headache during pregnancy?"

### 2. Prescription Validator
- Test contradictory medicine combinations
- Check patient-specific contraindications
- Verify allergy checking

### 3. Medicine Alternatives
- Request out-of-stock medicine
- View AI-generated alternatives
- Check side effects and warnings
- See compatibility scores

### 4. OCR Prescription Processing
- Upload prescription image
- View extracted medicines
- Check alternatives for out-of-stock items
- Edit patient information

---

## ✅ **Success Criteria**

Each test should demonstrate:
- ✅ Patient information properly captured
- ✅ Allergies checked against medicines
- ✅ Medical conditions considered
- ✅ Drug interactions detected
- ✅ Side effects displayed
- ✅ Alternatives suggested intelligently
- ✅ Contraindications flagged
- ✅ AI reasoning provided
- ✅ Stock status shown
- ✅ Manager notifications for out-of-stock
