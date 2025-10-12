import express from 'express';
import { chatWithAIAssistant, getPatientContext } from '../controllers/aiAssistantController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// AI Assistant routes (OTP flow handles access control)
router.post('/chat', chatWithAIAssistant);
router.get('/patient-context/:patientId', getPatientContext);

export default router;







