// In-memory database for demo purposes
// In production, this would be replaced with a real database like PostgreSQL, MongoDB, etc.

export interface Medicine {
  id: string
  name: string
  genericName: string
  category: string
  manufacturer: string
  batchNumber: string
  expiryDate: string
  stock: number
  minStock: number
  maxStock: number
  price: number
  costPrice: number
  description: string
  sideEffects: string[]
  contraindications: string[]
  dosage: string
  unit: string
  prescriptionRequired: boolean
  status: 'active' | 'inactive' | 'discontinued'
  createdAt: string
  updatedAt: string
  lastRestocked: string
  supplier: string
  barcode?: string
  imageUrl?: string
}

export interface InventoryTransaction {
  id: string
  medicineId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  reference?: string
  userId: string
  timestamp: string
  notes?: string
}

export interface StockAlert {
  id: string
  medicineId: string
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'expired'
  message: string
  isRead: boolean
  createdAt: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface SalesRecord {
  id: string
  prescriptionId: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  doctorName: string
  medicines: Array<{
    medicineId: string
    medicineName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    isAlternative: boolean
    originalMedicine?: string
  }>
  totalAmount: number
  discount?: number
  tax?: number
  paymentMethod: 'cash' | 'card' | 'insurance' | 'other'
  status: 'completed' | 'refunded' | 'partial_refund'
  soldBy: string
  soldAt: string
  notes?: string
}

export interface SalesSummary {
  totalSales: number
  totalTransactions: number
  totalMedicinesSold: number
  averageTransactionValue: number
  topSellingMedicines: Array<{
    medicineName: string
    quantitySold: number
    revenue: number
  }>
  dailySales: Array<{
    date: string
    sales: number
    transactions: number
  }>
}

// In-memory storage
export let medicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    category: 'Pain Relief',
    manufacturer: 'ABC Pharmaceuticals',
    batchNumber: 'BATCH001',
    expiryDate: '2025-12-31',
    stock: 45,
    minStock: 20,
    maxStock: 100,
    price: 2.50,
    costPrice: 1.80,
    description: 'Pain reliever and fever reducer',
    sideEffects: ['Nausea', 'Stomach upset'],
    contraindications: ['Liver disease', 'Alcoholism'],
    dosage: '500mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-10T00:00:00Z',
    supplier: 'MedSupply Co.',
    barcode: '1234567890123'
  },
  {
    id: '2',
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    category: 'Anti-inflammatory',
    manufacturer: 'XYZ Pharma',
    batchNumber: 'BATCH002',
    expiryDate: '2025-06-30',
    stock: 8,
    minStock: 15,
    maxStock: 80,
    price: 3.75,
    costPrice: 2.50,
    description: 'Anti-inflammatory and pain reliever',
    sideEffects: ['Stomach irritation', 'Dizziness'],
    contraindications: ['Stomach ulcers', 'Heart disease'],
    dosage: '400mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-05T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890124'
  },
  {
    id: '3',
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    manufacturer: 'MedLife Inc.',
    batchNumber: 'BATCH003',
    expiryDate: '2024-08-15',
    stock: 32,
    minStock: 10,
    maxStock: 50,
    price: 8.90,
    costPrice: 6.20,
    description: 'Broad-spectrum antibiotic',
    sideEffects: ['Diarrhea', 'Nausea', 'Rash'],
    contraindications: ['Penicillin allergy'],
    dosage: '250mg',
    unit: 'capsules',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890125'
  },
  {
    id: '4',
    name: 'Metformin 500mg',
    genericName: 'Metformin',
    category: 'Diabetes',
    manufacturer: 'DiabCare Pharma',
    batchNumber: 'BATCH004',
    expiryDate: '2025-03-20',
    stock: 0,
    minStock: 5,
    maxStock: 30,
    price: 12.50,
    costPrice: 8.75,
    description: 'Type 2 diabetes medication',
    sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
    contraindications: ['Kidney disease', 'Liver disease'],
    dosage: '500mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-08T00:00:00Z',
    supplier: 'MedSupply Co.',
    barcode: '1234567890126'
  },
  {
    id: '5',
    name: 'Aspirin 100mg',
    genericName: 'Acetylsalicylic Acid',
    category: 'Pain Relief',
    manufacturer: 'PainFree Pharma',
    batchNumber: 'BATCH005',
    expiryDate: '2025-09-30',
    stock: 25,
    minStock: 10,
    maxStock: 50,
    price: 1.25,
    costPrice: 0.85,
    description: 'Pain reliever and anti-inflammatory',
    sideEffects: ['Stomach irritation', 'Bleeding risk'],
    contraindications: ['Stomach ulcers', 'Bleeding disorders'],
    dosage: '100mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-14T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890127'
  },
  {
    id: '6',
    name: 'Naproxen 220mg',
    genericName: 'Naproxen',
    category: 'Pain Relief',
    manufacturer: 'ReliefMax Inc.',
    batchNumber: 'BATCH006',
    expiryDate: '2025-11-15',
    stock: 18,
    minStock: 8,
    maxStock: 40,
    price: 4.20,
    costPrice: 2.80,
    description: 'Non-steroidal anti-inflammatory drug',
    sideEffects: ['Stomach upset', 'Dizziness', 'Headache'],
    contraindications: ['Heart disease', 'Kidney problems'],
    dosage: '220mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'MedSupply Co.',
    barcode: '1234567890128'
  },
  {
    id: '7',
    name: 'Tramadol 50mg',
    genericName: 'Tramadol',
    category: 'Pain Relief',
    manufacturer: 'PainCare Solutions',
    batchNumber: 'BATCH007',
    expiryDate: '2025-07-20',
    stock: 12,
    minStock: 5,
    maxStock: 25,
    price: 15.75,
    costPrice: 10.50,
    description: 'Opioid pain medication',
    sideEffects: ['Nausea', 'Dizziness', 'Constipation'],
    contraindications: ['Respiratory depression', 'Drug addiction'],
    dosage: '50mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-11T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890129'
  },
  {
    id: '8',
    name: 'Dolo-650',
    genericName: 'Paracetamol',
    category: 'Pain Relief',
    manufacturer: 'Micro Labs',
    batchNumber: 'BATCH008',
    expiryDate: '2025-08-15',
    stock: 0,
    minStock: 20,
    maxStock: 100,
    price: 3.50,
    costPrice: 2.20,
    description: 'Paracetamol 650mg tablet for pain and fever',
    sideEffects: ['Nausea', 'Stomach upset'],
    contraindications: ['Liver disease', 'Alcoholism'],
    dosage: '650mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-10T00:00:00Z',
    supplier: 'MedSupply Co.',
    barcode: '1234567890130'
  },
  {
    id: '9',
    name: 'Belladonna Tincture and Aluminum Hydroxide Gel Solution',
    genericName: 'Belladonna + Aluminum Hydroxide',
    category: 'Antacid',
    manufacturer: 'Digestive Health Pharma',
    batchNumber: 'BATCH009',
    expiryDate: '2025-05-30',
    stock: 0,
    minStock: 10,
    maxStock: 50,
    price: 8.75,
    costPrice: 5.50,
    description: 'Antacid and antispasmodic combination',
    sideEffects: ['Dry mouth', 'Blurred vision', 'Constipation'],
    contraindications: ['Glaucoma', 'Prostate enlargement', 'Heart disease'],
    dosage: '5-10ml',
    unit: 'ml',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-09T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890131'
  },
  {
    id: '10',
    name: 'Aluminum Hydroxide Gel',
    genericName: 'Aluminum Hydroxide',
    category: 'Antacid',
    manufacturer: 'Digestive Health Pharma',
    batchNumber: 'BATCH010',
    expiryDate: '2025-06-15',
    stock: 35,
    minStock: 15,
    maxStock: 60,
    price: 4.25,
    costPrice: 2.80,
    description: 'Antacid for stomach acid neutralization',
    sideEffects: ['Constipation', 'Nausea'],
    contraindications: ['Kidney disease', 'Aluminum sensitivity'],
    dosage: '10-20ml',
    unit: 'ml',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890132'
  },
  {
    id: '11',
    name: 'Magnesium Hydroxide Suspension',
    genericName: 'Magnesium Hydroxide',
    category: 'Antacid',
    manufacturer: 'Digestive Health Pharma',
    batchNumber: 'BATCH011',
    expiryDate: '2025-07-20',
    stock: 28,
    minStock: 12,
    maxStock: 50,
    price: 3.80,
    costPrice: 2.40,
    description: 'Antacid and mild laxative',
    sideEffects: ['Diarrhea', 'Nausea'],
    contraindications: ['Kidney disease', 'Severe dehydration'],
    dosage: '15-30ml',
    unit: 'ml',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'MedSupply Co.',
    barcode: '1234567890133'
  },
  {
    id: '12',
    name: 'Calcium Carbonate Tablets',
    genericName: 'Calcium Carbonate',
    category: 'Antacid',
    manufacturer: 'Digestive Health Pharma',
    batchNumber: 'BATCH012',
    expiryDate: '2025-09-30',
    stock: 42,
    minStock: 20,
    maxStock: 80,
    price: 2.95,
    costPrice: 1.90,
    description: 'Antacid and calcium supplement',
    sideEffects: ['Constipation', 'Gas'],
    contraindications: ['Hypercalcemia', 'Kidney stones'],
    dosage: '500mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-14T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890134'
  },
  {
    id: '13',
    name: 'Paracetamol 650mg',
    genericName: 'Acetaminophen',
    category: 'Pain Relief',
    manufacturer: 'ABC Pharmaceuticals',
    batchNumber: 'BATCH013',
    expiryDate: '2025-10-15',
    stock: 55,
    minStock: 25,
    maxStock: 120,
    price: 3.25,
    costPrice: 2.10,
    description: 'Higher strength paracetamol for pain and fever',
    sideEffects: ['Nausea', 'Stomach upset'],
    contraindications: ['Liver disease', 'Alcoholism'],
    dosage: '650mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-11T00:00:00Z',
    supplier: 'MedSupply Co.',
    barcode: '1234567890135'
  },
  {
    id: '14',
    name: 'Ibuprofen 200mg',
    genericName: 'Ibuprofen',
    category: 'Anti-inflammatory',
    manufacturer: 'XYZ Pharma',
    batchNumber: 'BATCH014',
    expiryDate: '2025-08-30',
    stock: 38,
    minStock: 20,
    maxStock: 80,
    price: 2.80,
    costPrice: 1.85,
    description: 'Lower strength ibuprofen for mild pain',
    sideEffects: ['Stomach irritation', 'Dizziness'],
    contraindications: ['Stomach ulcers', 'Heart disease'],
    dosage: '200mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890136'
  },
  {
    id: '15',
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    category: 'Proton Pump Inhibitor',
    manufacturer: 'Digestive Health Pharma',
    batchNumber: 'BATCH015',
    expiryDate: '2025-11-20',
    stock: 22,
    minStock: 10,
    maxStock: 40,
    price: 6.50,
    costPrice: 4.20,
    description: 'Proton pump inhibitor for acid reduction',
    sideEffects: ['Headache', 'Nausea', 'Diarrhea'],
    contraindications: ['Severe liver disease'],
    dosage: '20mg',
    unit: 'capsules',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890137'
  },
  {
    id: '16',
    name: 'Warfarin 5mg',
    genericName: 'Warfarin',
    category: 'Anticoagulant',
    manufacturer: 'CardioCare Pharma',
    batchNumber: 'BATCH016',
    expiryDate: '2025-12-15',
    stock: 15,
    minStock: 5,
    maxStock: 30,
    price: 8.25,
    costPrice: 5.50,
    description: 'Anticoagulant for blood clot prevention',
    sideEffects: ['Bleeding', 'Bruising', 'Nausea', 'Hair loss'],
    contraindications: ['Active bleeding', 'Severe liver disease', 'Pregnancy'],
    dosage: '5mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-14T00:00:00Z',
    supplier: 'CardioSupply Ltd.',
    barcode: '1234567890138'
  },
  {
    id: '17',
    name: 'Digoxin 0.25mg',
    genericName: 'Digoxin',
    category: 'Cardiac Glycoside',
    manufacturer: 'HeartCare Pharma',
    batchNumber: 'BATCH017',
    expiryDate: '2025-10-30',
    stock: 12,
    minStock: 5,
    maxStock: 25,
    price: 12.75,
    costPrice: 8.50,
    description: 'Cardiac glycoside for heart failure and arrhythmias',
    sideEffects: ['Nausea', 'Vomiting', 'Irregular heartbeat', 'Visual disturbances'],
    contraindications: ['Ventricular fibrillation', 'Severe heart block'],
    dosage: '0.25mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'HeartSupply Co.',
    barcode: '1234567890139'
  },
  {
    id: '18',
    name: 'Furosemide 40mg',
    genericName: 'Furosemide',
    category: 'Diuretic',
    manufacturer: 'RenalCare Pharma',
    batchNumber: 'BATCH018',
    expiryDate: '2025-09-20',
    stock: 28,
    minStock: 10,
    maxStock: 50,
    price: 3.50,
    costPrice: 2.30,
    description: 'Loop diuretic for fluid retention and hypertension',
    sideEffects: ['Dehydration', 'Low potassium', 'Dizziness', 'Increased urination'],
    contraindications: ['Severe dehydration', 'Anuria'],
    dosage: '40mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'RenalSupply Ltd.',
    barcode: '1234567890140'
  },
  {
    id: '19',
    name: 'Phenytoin 100mg',
    genericName: 'Phenytoin',
    category: 'Anticonvulsant',
    manufacturer: 'NeuroCare Pharma',
    batchNumber: 'BATCH019',
    expiryDate: '2025-11-25',
    stock: 18,
    minStock: 8,
    maxStock: 35,
    price: 15.50,
    costPrice: 10.30,
    description: 'Anticonvulsant for epilepsy and seizures',
    sideEffects: ['Drowsiness', 'Dizziness', 'Gum swelling', 'Coordination problems'],
    contraindications: ['Severe liver disease', 'Heart block'],
    dosage: '100mg',
    unit: 'capsules',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-11T00:00:00Z',
    supplier: 'NeuroSupply Co.',
    barcode: '1234567890141'
  },
  {
    id: '20',
    name: 'Contrast Agent',
    genericName: 'Iohexol',
    category: 'Diagnostic Agent',
    manufacturer: 'ImagingCare Pharma',
    batchNumber: 'BATCH020',
    expiryDate: '2025-08-15',
    stock: 8,
    minStock: 3,
    maxStock: 15,
    price: 45.00,
    costPrice: 30.00,
    description: 'Radiocontrast agent for medical imaging',
    sideEffects: ['Nausea', 'Vomiting', 'Allergic reactions', 'Kidney damage'],
    contraindications: ['Severe kidney disease', 'Allergy to contrast'],
    dosage: 'As directed',
    unit: 'vials',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-10T00:00:00Z',
    supplier: 'ImagingSupply Ltd.',
    barcode: '1234567890142'
  },
  {
    id: '21',
    name: 'Aluminum Hydroxide Gel',
    genericName: 'Aluminum Hydroxide',
    category: 'Antacid',
    manufacturer: 'Digestive Health Pharma',
    batchNumber: 'BATCH021',
    expiryDate: '2025-12-30',
    stock: 35,
    minStock: 10,
    maxStock: 60,
    price: 5.25,
    costPrice: 3.50,
    description: 'Antacid for heartburn and acid indigestion',
    sideEffects: ['Constipation', 'Chalky taste', 'White-colored stools'],
    contraindications: ['Kidney disease', 'Low phosphate levels'],
    dosage: '10-20ml',
    unit: 'ml',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-14T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890143'
  },
  {
    id: '22',
    name: 'Magnesium Hydroxide Suspension',
    genericName: 'Magnesium Hydroxide',
    category: 'Antacid',
    manufacturer: 'Digestive Care Inc.',
    batchNumber: 'BATCH022',
    expiryDate: '2025-10-15',
    stock: 28,
    minStock: 10,
    maxStock: 50,
    price: 4.80,
    costPrice: 3.20,
    description: 'Antacid and laxative',
    sideEffects: ['Diarrhea', 'Stomach cramps', 'Nausea'],
    contraindications: ['Kidney disease', 'Appendicitis', 'Bowel obstruction'],
    dosage: '10-20ml',
    unit: 'ml',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'MedSupply Co.',
    barcode: '1234567890144'
  },
  {
    id: '23',
    name: 'Ranitidine 150mg',
    genericName: 'Ranitidine',
    category: 'H2 Blocker',
    manufacturer: 'GastroHealth Pharma',
    batchNumber: 'BATCH023',
    expiryDate: '2025-11-20',
    stock: 40,
    minStock: 15,
    maxStock: 70,
    price: 6.50,
    costPrice: 4.30,
    description: 'H2 receptor antagonist for acid reduction',
    sideEffects: ['Headache', 'Dizziness', 'Constipation', 'Diarrhea'],
    contraindications: ['Liver disease', 'Kidney disease', 'Porphyria'],
    dosage: '150mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890145'
  },
  {
    id: '24',
    name: 'Famotidine 20mg',
    genericName: 'Famotidine',
    category: 'H2 Blocker',
    manufacturer: 'AcidCare Pharma',
    batchNumber: 'BATCH024',
    expiryDate: '2025-09-25',
    stock: 32,
    minStock: 12,
    maxStock: 60,
    price: 7.25,
    costPrice: 4.80,
    description: 'H2 receptor blocker for gastric acid reduction',
    sideEffects: ['Headache', 'Dizziness', 'Constipation'],
    contraindications: ['Kidney disease', 'Liver disease'],
    dosage: '20mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-11T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890146'
  },
  {
    id: '25',
    name: 'Pantoprazole 40mg',
    genericName: 'Pantoprazole',
    category: 'Proton Pump Inhibitor',
    manufacturer: 'GastroRelief Pharma',
    batchNumber: 'BATCH025',
    expiryDate: '2025-12-10',
    stock: 38,
    minStock: 15,
    maxStock: 65,
    price: 8.50,
    costPrice: 5.70,
    description: 'Proton pump inhibitor for acid reflux and ulcers',
    sideEffects: ['Headache', 'Diarrhea', 'Nausea', 'Abdominal pain'],
    contraindications: ['Severe liver disease', 'Osteoporosis'],
    dosage: '40mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890147'
  },
  // Antibiotics
  {
    id: '26',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    manufacturer: 'AntiBio Pharma',
    batchNumber: 'BATCH026',
    expiryDate: '2025-08-15',
    stock: 85,
    minStock: 30,
    maxStock: 150,
    price: 12.50,
    costPrice: 8.00,
    description: 'Broad-spectrum penicillin antibiotic',
    sideEffects: ['Nausea', 'Diarrhea', 'Rash', 'Yeast infection'],
    contraindications: ['Penicillin allergy', 'Mononucleosis'],
    dosage: '500mg',
    unit: 'capsules',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-14T00:00:00Z',
    supplier: 'MediSource Inc.',
    barcode: '1234567890148'
  },
  {
    id: '27',
    name: 'Azithromycin 250mg',
    genericName: 'Azithromycin',
    category: 'Antibiotic',
    manufacturer: 'MacroHealth Ltd.',
    batchNumber: 'BATCH027',
    expiryDate: '2025-09-20',
    stock: 60,
    minStock: 25,
    maxStock: 100,
    price: 15.75,
    costPrice: 10.50,
    description: 'Macrolide antibiotic for bacterial infections',
    sideEffects: ['Nausea', 'Vomiting', 'Abdominal pain', 'Diarrhea'],
    contraindications: ['Liver disease', 'QT prolongation', 'Myasthenia gravis'],
    dosage: '250mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890149'
  },
  {
    id: '28',
    name: 'Ciprofloxacin 500mg',
    genericName: 'Ciprofloxacin',
    category: 'Antibiotic',
    manufacturer: 'FluoroMed Pharma',
    batchNumber: 'BATCH028',
    expiryDate: '2025-07-30',
    stock: 55,
    minStock: 20,
    maxStock: 90,
    price: 18.00,
    costPrice: 12.00,
    description: 'Fluoroquinolone antibiotic for various infections',
    sideEffects: ['Nausea', 'Diarrhea', 'Tendon problems', 'Dizziness'],
    contraindications: ['Pregnancy', 'Children under 18', 'Tendon disorders'],
    dosage: '500mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-10T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890150'
  },
  // Vitamins & Supplements
  {
    id: '29',
    name: 'Vitamin D3 1000 IU',
    genericName: 'Cholecalciferol',
    category: 'Vitamin',
    manufacturer: 'VitaLife Supplements',
    batchNumber: 'BATCH029',
    expiryDate: '2026-02-15',
    stock: 120,
    minStock: 40,
    maxStock: 200,
    price: 8.99,
    costPrice: 5.50,
    description: 'Essential vitamin D supplement for bone health',
    sideEffects: ['Nausea', 'Constipation', 'Loss of appetite (rare)'],
    contraindications: ['Hypercalcemia', 'Kidney disease'],
    dosage: '1000 IU',
    unit: 'softgels',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-14T00:00:00Z',
    supplier: 'NutriHealth Co.',
    barcode: '1234567890151'
  },
  {
    id: '30',
    name: 'Multivitamin Complex',
    genericName: 'Multivitamin',
    category: 'Vitamin',
    manufacturer: 'Complete Care Vitamins',
    batchNumber: 'BATCH030',
    expiryDate: '2026-01-20',
    stock: 95,
    minStock: 35,
    maxStock: 150,
    price: 14.99,
    costPrice: 9.00,
    description: 'Complete daily multivitamin with minerals',
    sideEffects: ['Upset stomach', 'Headache (rare)'],
    contraindications: ['Iron overload disorders', 'Hypervitaminosis'],
    dosage: '1 tablet',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'VitaSource Ltd.',
    barcode: '1234567890152'
  },
  {
    id: '31',
    name: 'Calcium Citrate 500mg',
    genericName: 'Calcium Citrate',
    category: 'Supplement',
    manufacturer: 'BoneStrong Pharma',
    batchNumber: 'BATCH031',
    expiryDate: '2026-03-10',
    stock: 78,
    minStock: 30,
    maxStock: 120,
    price: 11.50,
    costPrice: 7.25,
    description: 'Calcium supplement for bone health',
    sideEffects: ['Constipation', 'Bloating', 'Gas'],
    contraindications: ['Hypercalcemia', 'Kidney stones', 'Hyperparathyroidism'],
    dosage: '500mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-11T00:00:00Z',
    supplier: 'NutriHealth Co.',
    barcode: '1234567890153'
  },
  // Diabetes Medications
  {
    id: '32',
    name: 'Metformin 500mg',
    genericName: 'Metformin HCl',
    category: 'Antidiabetic',
    manufacturer: 'DiabetCare Pharma',
    batchNumber: 'BATCH032',
    expiryDate: '2025-10-15',
    stock: 150,
    minStock: 50,
    maxStock: 250,
    price: 6.75,
    costPrice: 4.00,
    description: 'First-line medication for type 2 diabetes',
    sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset', 'Metallic taste'],
    contraindications: ['Kidney disease', 'Liver disease', 'Heart failure', 'Metabolic acidosis'],
    dosage: '500mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890154'
  },
  {
    id: '33',
    name: 'Glimepiride 2mg',
    genericName: 'Glimepiride',
    category: 'Antidiabetic',
    manufacturer: 'GlycoCare Ltd.',
    batchNumber: 'BATCH033',
    expiryDate: '2025-11-20',
    stock: 72,
    minStock: 25,
    maxStock: 120,
    price: 9.25,
    costPrice: 6.00,
    description: 'Sulfonylurea for blood sugar control',
    sideEffects: ['Hypoglycemia', 'Nausea', 'Dizziness', 'Weight gain'],
    contraindications: ['Type 1 diabetes', 'Diabetic ketoacidosis', 'Sulfa allergy'],
    dosage: '2mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'MediSource Inc.',
    barcode: '1234567890155'
  },
  // Blood Pressure Medications
  {
    id: '34',
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine Besylate',
    category: 'Antihypertensive',
    manufacturer: 'CardioHealth Pharma',
    batchNumber: 'BATCH034',
    expiryDate: '2025-12-15',
    stock: 110,
    minStock: 40,
    maxStock: 180,
    price: 7.50,
    costPrice: 4.75,
    description: 'Calcium channel blocker for hypertension',
    sideEffects: ['Swelling of ankles', 'Headache', 'Dizziness', 'Fatigue'],
    contraindications: ['Severe hypotension', 'Cardiogenic shock', 'Aortic stenosis'],
    dosage: '5mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-14T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890156'
  },
  {
    id: '35',
    name: 'Losartan 50mg',
    genericName: 'Losartan Potassium',
    category: 'Antihypertensive',
    manufacturer: 'AngioCare Pharma',
    batchNumber: 'BATCH035',
    expiryDate: '2025-09-30',
    stock: 88,
    minStock: 35,
    maxStock: 150,
    price: 10.75,
    costPrice: 7.00,
    description: 'ARB for hypertension and kidney protection',
    sideEffects: ['Dizziness', 'Fatigue', 'Upper respiratory infection'],
    contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'Hypotension'],
    dosage: '50mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-11T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890157'
  },
  {
    id: '36',
    name: 'Atenolol 50mg',
    genericName: 'Atenolol',
    category: 'Antihypertensive',
    manufacturer: 'BetaBlock Pharma',
    batchNumber: 'BATCH036',
    expiryDate: '2025-08-20',
    stock: 65,
    minStock: 25,
    maxStock: 110,
    price: 8.25,
    costPrice: 5.50,
    description: 'Beta blocker for hypertension and angina',
    sideEffects: ['Fatigue', 'Cold hands/feet', 'Slow heart rate', 'Dizziness'],
    contraindications: ['Asthma', 'Severe bradycardia', 'Heart block', 'Cardiogenic shock'],
    dosage: '50mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-10T00:00:00Z',
    supplier: 'MediSource Inc.',
    barcode: '1234567890158'
  },
  // Respiratory Medications
  {
    id: '37',
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine Hydrochloride',
    category: 'Antihistamine',
    manufacturer: 'AllergyRelief Co.',
    batchNumber: 'BATCH037',
    expiryDate: '2026-01-15',
    stock: 92,
    minStock: 30,
    maxStock: 150,
    price: 5.99,
    costPrice: 3.50,
    description: 'Non-drowsy antihistamine for allergies',
    sideEffects: ['Drowsiness', 'Dry mouth', 'Headache'],
    contraindications: ['Severe kidney disease', 'Lactation (with caution)'],
    dosage: '10mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890159'
  },
  {
    id: '38',
    name: 'Montelukast 10mg',
    genericName: 'Montelukast Sodium',
    category: 'Respiratory',
    manufacturer: 'BreathEasy Pharma',
    batchNumber: 'BATCH038',
    expiryDate: '2025-11-10',
    stock: 58,
    minStock: 20,
    maxStock: 100,
    price: 14.50,
    costPrice: 9.50,
    description: 'Leukotriene receptor antagonist for asthma',
    sideEffects: ['Headache', 'Stomach pain', 'Mood changes (rare)'],
    contraindications: ['Liver disease (severe)', 'Phenylketonuria'],
    dosage: '10mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890160'
  },
  // Antibiotics (continued)
  {
    id: '39',
    name: 'Cephalexin 500mg',
    genericName: 'Cephalexin',
    category: 'Antibiotic',
    manufacturer: 'CephaloMed Inc.',
    batchNumber: 'BATCH039',
    expiryDate: '2025-10-25',
    stock: 70,
    minStock: 25,
    maxStock: 120,
    price: 13.75,
    costPrice: 9.00,
    description: 'First-generation cephalosporin antibiotic',
    sideEffects: ['Nausea', 'Diarrhea', 'Rash', 'Stomach upset'],
    contraindications: ['Cephalosporin allergy', 'Severe penicillin allergy'],
    dosage: '500mg',
    unit: 'capsules',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-11T00:00:00Z',
    supplier: 'MediSource Inc.',
    barcode: '1234567890161'
  },
  {
    id: '40',
    name: 'Doxycycline 100mg',
    genericName: 'Doxycycline Hyclate',
    category: 'Antibiotic',
    manufacturer: 'TetracyclinePharma',
    batchNumber: 'BATCH040',
    expiryDate: '2025-09-15',
    stock: 64,
    minStock: 22,
    maxStock: 110,
    price: 11.25,
    costPrice: 7.50,
    description: 'Tetracycline antibiotic for various infections',
    sideEffects: ['Nausea', 'Photosensitivity', 'Diarrhea', 'Esophageal irritation'],
    contraindications: ['Pregnancy', 'Children under 8', 'Tetracycline allergy'],
    dosage: '100mg',
    unit: 'capsules',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-10T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890162'
  },
  // Cholesterol Medications
  {
    id: '41',
    name: 'Atorvastatin 20mg',
    genericName: 'Atorvastatin Calcium',
    category: 'Statin',
    manufacturer: 'LipidCare Pharma',
    batchNumber: 'BATCH041',
    expiryDate: '2025-12-20',
    stock: 98,
    minStock: 35,
    maxStock: 160,
    price: 9.99,
    costPrice: 6.50,
    description: 'HMG-CoA reductase inhibitor for cholesterol',
    sideEffects: ['Muscle pain', 'Headache', 'Nausea', 'Liver enzyme elevation'],
    contraindications: ['Pregnancy', 'Lactation', 'Active liver disease'],
    dosage: '20mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890163'
  },
  {
    id: '42',
    name: 'Rosuvastatin 10mg',
    genericName: 'Rosuvastatin Calcium',
    category: 'Statin',
    manufacturer: 'CardioLipid Inc.',
    batchNumber: 'BATCH042',
    expiryDate: '2025-11-30',
    stock: 76,
    minStock: 28,
    maxStock: 130,
    price: 12.50,
    costPrice: 8.25,
    description: 'Potent statin for cholesterol management',
    sideEffects: ['Muscle pain', 'Headache', 'Dizziness', 'Nausea'],
    contraindications: ['Pregnancy', 'Lactation', 'Active liver disease', 'Severe kidney disease'],
    dosage: '10mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890164'
  },
  // Thyroid Medications
  {
    id: '43',
    name: 'Levothyroxine 100mcg',
    genericName: 'Levothyroxine Sodium',
    category: 'Thyroid',
    manufacturer: 'EndocrineCare Pharma',
    batchNumber: 'BATCH043',
    expiryDate: '2026-02-28',
    stock: 85,
    minStock: 30,
    maxStock: 140,
    price: 8.75,
    costPrice: 5.75,
    description: 'Thyroid hormone replacement therapy',
    sideEffects: ['Heart palpitations (if overdosed)', 'Weight loss', 'Nervousness', 'Insomnia'],
    contraindications: ['Hyperthyroidism', 'Acute myocardial infarction', 'Uncorrected adrenal insufficiency'],
    dosage: '100mcg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-14T00:00:00Z',
    supplier: 'MediSource Inc.',
    barcode: '1234567890165'
  },
  // Antacids (more alternatives)
  {
    id: '44',
    name: 'Esomeprazole 40mg',
    genericName: 'Esomeprazole Magnesium',
    category: 'Proton Pump Inhibitor',
    manufacturer: 'AcidBlock Pharma',
    batchNumber: 'BATCH044',
    expiryDate: '2025-10-10',
    stock: 52,
    minStock: 20,
    maxStock: 90,
    price: 16.99,
    costPrice: 11.50,
    description: 'PPI for severe acid reflux and GERD',
    sideEffects: ['Headache', 'Nausea', 'Diarrhea', 'Abdominal pain'],
    contraindications: ['Severe liver disease', 'Allergy to PPIs'],
    dosage: '40mg',
    unit: 'capsules',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-11T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890166'
  },
  {
    id: '45',
    name: 'Lansoprazole 30mg',
    genericName: 'Lansoprazole',
    category: 'Proton Pump Inhibitor',
    manufacturer: 'GastroShield Inc.',
    batchNumber: 'BATCH045',
    expiryDate: '2025-09-05',
    stock: 48,
    minStock: 18,
    maxStock: 80,
    price: 13.25,
    costPrice: 8.75,
    description: 'PPI for ulcers and acid-related disorders',
    sideEffects: ['Headache', 'Diarrhea', 'Nausea', 'Stomach pain'],
    contraindications: ['Severe liver disease', 'PPI hypersensitivity'],
    dosage: '30mg',
    unit: 'capsules',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-10T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890167'
  },
  // Additional Pain Relief
  {
    id: '46',
    name: 'Diclofenac 50mg',
    genericName: 'Diclofenac Sodium',
    category: 'Pain Relief',
    manufacturer: 'PainFree Pharma',
    batchNumber: 'BATCH046',
    expiryDate: '2025-08-30',
    stock: 62,
    minStock: 23,
    maxStock: 105,
    price: 7.99,
    costPrice: 5.25,
    description: 'NSAID for pain and inflammation',
    sideEffects: ['Stomach upset', 'Ulcers', 'Cardiovascular risk', 'Kidney problems'],
    contraindications: ['Heart disease', 'Kidney disease', 'Stomach ulcers', 'Pregnancy (3rd trimester)'],
    dosage: '50mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-12T00:00:00Z',
    supplier: 'MediSource Inc.',
    barcode: '1234567890168'
  },
  {
    id: '47',
    name: 'Acetaminophen 650mg',
    genericName: 'Acetaminophen',
    category: 'Pain Relief',
    manufacturer: 'PainCare Ltd.',
    batchNumber: 'BATCH047',
    expiryDate: '2026-03-15',
    stock: 135,
    minStock: 45,
    maxStock: 220,
    price: 4.99,
    costPrice: 3.00,
    description: 'Non-NSAID pain reliever and fever reducer',
    sideEffects: ['Liver damage (overdose)', 'Rash (rare)', 'Nausea (rare)'],
    contraindications: ['Severe liver disease', 'Alcohol dependence'],
    dosage: '650mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-14T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890169'
  },
  // Anticoagulants
  {
    id: '48',
    name: 'Aspirin 81mg (Low-Dose)',
    genericName: 'Acetylsalicylic Acid',
    category: 'Anticoagulant',
    manufacturer: 'CardioProtect Inc.',
    batchNumber: 'BATCH048',
    expiryDate: '2026-01-30',
    stock: 110,
    minStock: 40,
    maxStock: 180,
    price: 3.99,
    costPrice: 2.25,
    description: 'Low-dose aspirin for cardiovascular protection',
    sideEffects: ['Stomach upset', 'Bleeding risk', 'Bruising'],
    contraindications: ['Bleeding disorders', 'Stomach ulcers', 'Aspirin allergy', 'Children (Reye syndrome)'],
    dosage: '81mg',
    unit: 'tablets',
    prescriptionRequired: false,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-13T00:00:00Z',
    supplier: 'HealthCorp Ltd.',
    barcode: '1234567890170'
  },
  // Mental Health
  {
    id: '49',
    name: 'Sertraline 50mg',
    genericName: 'Sertraline Hydrochloride',
    category: 'Antidepressant',
    manufacturer: 'MindCare Pharma',
    batchNumber: 'BATCH049',
    expiryDate: '2025-11-15',
    stock: 45,
    minStock: 18,
    maxStock: 75,
    price: 15.50,
    costPrice: 10.25,
    description: 'SSRI for depression and anxiety disorders',
    sideEffects: ['Nausea', 'Insomnia', 'Sexual dysfunction', 'Weight changes'],
    contraindications: ['MAO inhibitor use', 'Pimozide use', 'Liver disease (severe)'],
    dosage: '50mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-10T00:00:00Z',
    supplier: 'MentalHealth Pharma',
    barcode: '1234567890171'
  },
  {
    id: '50',
    name: 'Alprazolam 0.5mg',
    genericName: 'Alprazolam',
    category: 'Anxiolytic',
    manufacturer: 'AnxietyRelief Ltd.',
    batchNumber: 'BATCH050',
    expiryDate: '2025-10-20',
    stock: 32,
    minStock: 12,
    maxStock: 55,
    price: 18.75,
    costPrice: 12.50,
    description: 'Benzodiazepine for anxiety and panic disorders',
    sideEffects: ['Drowsiness', 'Memory impairment', 'Dependency risk', 'Dizziness'],
    contraindications: ['Narrow-angle glaucoma', 'Severe respiratory insufficiency', 'Sleep apnea', 'Pregnancy'],
    dosage: '0.5mg',
    unit: 'tablets',
    prescriptionRequired: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastRestocked: '2024-01-09T00:00:00Z',
    supplier: 'PharmaDirect',
    barcode: '1234567890172'
  }
]

let transactions: InventoryTransaction[] = []
let stockAlerts: StockAlert[] = []
let salesRecords: SalesRecord[] = []

// Helper functions
export const generateId = () => Math.random().toString(36).substr(2, 9)

export const getCurrentTimestamp = () => new Date().toISOString()

// Medicine CRUD operations
export const medicineService = {
  // Get all medicines
  getAll: async (filters?: {
    search?: string
    category?: string
    status?: string
    lowStock?: boolean
  }): Promise<Medicine[]> => {
    let filteredMedicines = [...medicines]

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredMedicines = filteredMedicines.filter(med => 
        med.name.toLowerCase().includes(searchLower) ||
        med.genericName.toLowerCase().includes(searchLower) ||
        med.category.toLowerCase().includes(searchLower) ||
        med.manufacturer.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.category) {
      filteredMedicines = filteredMedicines.filter(med => med.category === filters.category)
    }

    if (filters?.status) {
      filteredMedicines = filteredMedicines.filter(med => med.status === filters.status)
    }

    if (filters?.lowStock) {
      filteredMedicines = filteredMedicines.filter(med => med.stock <= med.minStock)
    }

    return filteredMedicines
  },

  // Get medicine by ID
  getById: async (id: string): Promise<Medicine | null> => {
    return medicines.find(med => med.id === id) || null
  },

  // Create new medicine
  create: async (medicineData: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> => {
    const newMedicine: Medicine = {
      ...medicineData,
      id: generateId(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    }
    
    medicines.push(newMedicine)
    
    // Create initial transaction
    const transaction: InventoryTransaction = {
      id: generateId(),
      medicineId: newMedicine.id,
      type: 'in',
      quantity: newMedicine.stock,
      reason: 'Initial stock',
      userId: 'system',
      timestamp: getCurrentTimestamp(),
      notes: 'Initial stock entry'
    }
    transactions.push(transaction)

    // Check for stock alerts
    checkStockAlerts(newMedicine)

    return newMedicine
  },

  // Update medicine
  update: async (id: string, updateData: Partial<Medicine>): Promise<Medicine | null> => {
    const index = medicines.findIndex(med => med.id === id)
    if (index === -1) return null

    const oldMedicine = medicines[index]
    const updatedMedicine = {
      ...oldMedicine,
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: getCurrentTimestamp()
    }

    medicines[index] = updatedMedicine

    // Check for stock alerts
    checkStockAlerts(updatedMedicine)

    return updatedMedicine
  },

  // Delete medicine
  delete: async (id: string): Promise<boolean> => {
    const index = medicines.findIndex(med => med.id === id)
    if (index === -1) return false

    medicines.splice(index, 1)
    
    // Remove related transactions and alerts
    transactions = transactions.filter(t => t.medicineId !== id)
    stockAlerts = stockAlerts.filter(a => a.medicineId !== id)

    return true
  },

  // Update stock
  updateStock: async (id: string, quantity: number, reason: string, userId: string, notes?: string): Promise<Medicine | null> => {
    const medicine = medicines.find(med => med.id === id)
    if (!medicine) return null

    const oldStock = medicine.stock
    const newStock = Math.max(0, oldStock + quantity) // Prevent negative stock

    // Update medicine stock
    medicine.stock = newStock
    medicine.updatedAt = getCurrentTimestamp()
    if (quantity > 0) {
      medicine.lastRestocked = getCurrentTimestamp()
    }

    // Create transaction record
    const transaction: InventoryTransaction = {
      id: generateId(),
      medicineId: id,
      type: quantity > 0 ? 'in' : 'out',
      quantity: Math.abs(quantity),
      reason,
      userId,
      timestamp: getCurrentTimestamp(),
      notes
    }
    transactions.push(transaction)

    // Check for stock alerts
    checkStockAlerts(medicine)

    return medicine
  }
}

// Transaction operations
export const transactionService = {
  getAll: async (medicineId?: string): Promise<InventoryTransaction[]> => {
    if (medicineId) {
      return transactions.filter(t => t.medicineId === medicineId)
    }
    return [...transactions]
  },

  getById: async (id: string): Promise<InventoryTransaction | null> => {
    return transactions.find(t => t.id === id) || null
  }
}

// Stock alert operations
export const alertService = {
  getAll: async (): Promise<StockAlert[]> => {
    return [...stockAlerts]
  },

  markAsRead: async (id: string): Promise<boolean> => {
    const alert = stockAlerts.find(a => a.id === id)
    if (!alert) return false

    alert.isRead = true
    return true
  },

  markAllAsRead: async (): Promise<void> => {
    stockAlerts.forEach(alert => {
      alert.isRead = true
    })
  }
}

// Sales tracking service
export const salesService = {
  // Record a new sale
  recordSale: async (saleData: Omit<SalesRecord, 'id' | 'soldAt'>): Promise<SalesRecord> => {
    const newSale: SalesRecord = {
      ...saleData,
      id: generateId(),
      soldAt: getCurrentTimestamp()
    }
    
    salesRecords.push(newSale)
    
    // Update medicine stock
    saleData.medicines.forEach(medicineSale => {
      const medicine = medicines.find(med => med.id === medicineSale.medicineId)
      if (medicine) {
        medicine.stock -= medicineSale.quantity
        medicine.updatedAt = getCurrentTimestamp()
        
        // Create inventory transaction
        const transaction: InventoryTransaction = {
          id: generateId(),
          medicineId: medicine.id,
          type: 'out',
          quantity: medicineSale.quantity,
          reason: 'Sale',
          reference: newSale.prescriptionId,
          userId: newSale.soldBy,
          timestamp: getCurrentTimestamp(),
          notes: `Sold to ${saleData.customerName}`
        }
        transactions.push(transaction)
        
        // Check for stock alerts
        checkStockAlerts(medicine)
      }
    })
    
    return newSale
  },

  // Get all sales records
  getAllSales: async (filters?: {
    startDate?: string
    endDate?: string
    customerName?: string
    status?: string
  }): Promise<SalesRecord[]> => {
    let filteredSales = [...salesRecords]

    if (filters?.startDate) {
      filteredSales = filteredSales.filter(sale => sale.soldAt >= filters.startDate!)
    }

    if (filters?.endDate) {
      filteredSales = filteredSales.filter(sale => sale.soldAt <= filters.endDate!)
    }

    if (filters?.customerName) {
      const searchLower = filters.customerName.toLowerCase()
      filteredSales = filteredSales.filter(sale => 
        sale.customerName.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.status) {
      filteredSales = filteredSales.filter(sale => sale.status === filters.status)
    }

    return filteredSales.sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime())
  },

  // Get sales summary
  getSalesSummary: async (startDate?: string, endDate?: string): Promise<SalesSummary> => {
    let filteredSales = salesRecords

    if (startDate) {
      filteredSales = filteredSales.filter(sale => sale.soldAt >= startDate)
    }

    if (endDate) {
      filteredSales = filteredSales.filter(sale => sale.soldAt <= endDate)
    }

    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalTransactions = filteredSales.length
    const totalMedicinesSold = filteredSales.reduce((sum, sale) => 
      sum + sale.medicines.reduce((medSum, med) => medSum + med.quantity, 0), 0
    )

    // Calculate top selling medicines
    const medicineSales: Record<string, { quantitySold: number; revenue: number }> = {}
    filteredSales.forEach(sale => {
      sale.medicines.forEach(med => {
        if (!medicineSales[med.medicineName]) {
          medicineSales[med.medicineName] = { quantitySold: 0, revenue: 0 }
        }
        medicineSales[med.medicineName].quantitySold += med.quantity
        medicineSales[med.medicineName].revenue += med.totalPrice
      })
    })

    const topSellingMedicines = Object.entries(medicineSales)
      .map(([name, data]) => ({ medicineName: name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Calculate daily sales
    const dailySalesMap: Record<string, { sales: number; transactions: number }> = {}
    filteredSales.forEach(sale => {
      const date = sale.soldAt.split('T')[0]
      if (!dailySalesMap[date]) {
        dailySalesMap[date] = { sales: 0, transactions: 0 }
      }
      dailySalesMap[date].sales += sale.totalAmount
      dailySalesMap[date].transactions += 1
    })

    const dailySales = Object.entries(dailySalesMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalSales,
      totalTransactions,
      totalMedicinesSold,
      averageTransactionValue: totalTransactions > 0 ? totalSales / totalTransactions : 0,
      topSellingMedicines,
      dailySales
    }
  },

  // Get sales by customer
  getCustomerSales: async (customerName: string): Promise<SalesRecord[]> => {
    return salesRecords
      .filter(sale => sale.customerName.toLowerCase().includes(customerName.toLowerCase()))
      .sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime())
  },

  // Update sale status (for refunds)
  updateSaleStatus: async (saleId: string, status: 'completed' | 'refunded' | 'partial_refund'): Promise<boolean> => {
    const saleIndex = salesRecords.findIndex(sale => sale.id === saleId)
    if (saleIndex === -1) return false

    salesRecords[saleIndex].status = status
    return true
  }
}

// Helper function to check and create stock alerts
const checkStockAlerts = (medicine: Medicine) => {
  const now = new Date()
  const expiryDate = new Date(medicine.expiryDate)
  const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Remove existing alerts for this medicine
  stockAlerts = stockAlerts.filter(a => a.medicineId !== medicine.id)

  // Check for stock alerts
  if (medicine.stock === 0) {
    stockAlerts.push({
      id: generateId(),
      medicineId: medicine.id,
      type: 'out_of_stock',
      message: `${medicine.name} is out of stock`,
      isRead: false,
      createdAt: getCurrentTimestamp(),
      priority: 'critical'
    })
  } else if (medicine.stock <= medicine.minStock) {
    stockAlerts.push({
      id: generateId(),
      medicineId: medicine.id,
      type: 'low_stock',
      message: `${medicine.name} is running low (${medicine.stock} remaining)`,
      isRead: false,
      createdAt: getCurrentTimestamp(),
      priority: 'high'
    })
  }

  // Check for expiry alerts
  if (daysToExpiry <= 0) {
    stockAlerts.push({
      id: generateId(),
      medicineId: medicine.id,
      type: 'expired',
      message: `${medicine.name} has expired on ${medicine.expiryDate}`,
      isRead: false,
      createdAt: getCurrentTimestamp(),
      priority: 'critical'
    })
  } else if (daysToExpiry <= 30) {
    stockAlerts.push({
      id: generateId(),
      medicineId: medicine.id,
      type: 'expiry_warning',
      message: `${medicine.name} expires in ${daysToExpiry} days`,
      isRead: false,
      createdAt: getCurrentTimestamp(),
      priority: 'medium'
    })
  }
}

// Get categories
export const getCategories = (): string[] => {
  const categories = new Set(medicines.map(med => med.category))
  return Array.from(categories).sort()
}

// Get suppliers
export const getSuppliers = (): string[] => {
  const suppliers = new Set(medicines.map(med => med.supplier))
  return Array.from(suppliers).sort()
}
