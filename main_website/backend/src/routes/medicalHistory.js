import express from 'express';
import {
  createMedicalHistoryEntry,
  getMedicalHistory,
  updateMedicalHistoryEntry,
  deleteMedicalHistoryEntry
} from '../controllers/medicalHistoryController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCreateMedicalHistory } from '../middleware/validation.js';

const router = express.Router();

// Public routes for medical history management (OTP flow handles access control)
router.post('/create', validateCreateMedicalHistory, createMedicalHistoryEntry);
router.get('/:abhaId', getMedicalHistory);
router.put('/:entryId', authenticateToken, updateMedicalHistoryEntry);
router.delete('/:entryId', authenticateToken, deleteMedicalHistoryEntry);

export default router;
