import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  updatePrescriptionStatus,
  getPrescriptionById
} from '../controllers/prescriptionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCreatePrescription } from '../middleware/validation.js';

const router = express.Router();

// Public routes for prescription management (OTP flow handles access control)
router.post('/create', validateCreatePrescription, createPrescription);
router.get('/:abhaId', getPrescriptions);
router.get('/details/:prescriptionId', authenticateToken, getPrescriptionById);
router.put('/:prescriptionId/status', authenticateToken, updatePrescriptionStatus);

export default router;
