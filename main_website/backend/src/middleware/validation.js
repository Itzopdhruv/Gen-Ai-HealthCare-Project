import { body } from 'express-validator';

export const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('hospitalName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Hospital Name cannot be empty if provided'),
  
  body('hospitalCode')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Hospital Code cannot be empty if provided')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateProfileUpdate = [
  body('profile.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  
  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('profile.address.pincode')
    .optional()
    .isPostalCode('IN')
    .withMessage('Please provide a valid Indian postal code'),
  
  body('profile.emergencyContact.phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian mobile number for emergency contact')
];

export const validateVerifyOTP = [
  body('accessId')
    .notEmpty()
    .withMessage('Access ID is required'),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

export const validateCreateMedicalHistory = [
  // Very lenient validation - only check if required fields exist
  body('abhaId')
    .custom((value) => {
      return value && value.toString().trim().length > 0;
    })
    .withMessage('ABHA ID is required'),
  
  body('entryType')
    .custom((value) => {
      return value && value.toString().trim().length > 0;
    })
    .withMessage('Entry type is required'),
  
  body('date')
    .custom((value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .withMessage('Please provide a valid date'),
  
  body('summary')
    .custom((value) => {
      return value && value.toString().trim().length > 0;
    })
    .withMessage('Summary is required'),
  
  body('consultingDoctor')
    .custom((value) => {
      return value && value.toString().trim().length > 0;
    })
    .withMessage('Consulting doctor name is required'),
  
  body('hospitalClinicName')
    .custom((value) => {
      return value && value.toString().trim().length > 0;
    })
    .withMessage('Hospital/Clinic name is required')
];

export const validateCreatePrescription = [
  body('abhaId')
    .notEmpty()
    .withMessage('ABHA ID is required'),
  
  body('issuedDate')
    .isISO8601()
    .withMessage('Please provide a valid issued date'),
  
  body('doctor.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Doctor name must be between 2 and 100 characters'),
  
  body('hospitalClinic.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hospital/Clinic name must be between 2 and 100 characters'),
  
  body('diagnosis.primary')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Primary diagnosis must be between 2 and 200 characters'),
  
  // Accept either an array of medications or a non-empty string (textarea) to be parsed server-side
  body('medications')
    .custom((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return false;
    })
    .withMessage('Please provide medications as a list or textarea')
];
