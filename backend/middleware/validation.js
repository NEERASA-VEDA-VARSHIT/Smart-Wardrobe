import { body, param, query, validationResult } from 'express-validator';
import { AppError, ErrorTypes } from './errorHandler.js';

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    throw new AppError(
      `Validation failed: ${errorMessages.map(e => e.message).join(', ')}`,
      400,
      ErrorTypes.VALIDATION_ERROR
    );
  }
  next();
};

// Common validation rules
export const commonValidations = {
  // MongoDB ObjectId validation
  objectId: (field) => param(field)
    .isMongoId()
    .withMessage(`${field} must be a valid MongoDB ObjectId`),

  // Email validation
  email: (field = 'email') => body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  // Password validation
  password: (field = 'password') => body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Name validation
  name: (field = 'name') => body(field)
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(`${field} must be between 1 and 100 characters`)
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage(`${field} can only contain letters, numbers, spaces, hyphens, and underscores`),

  // Color validation
  color: (field = 'color') => body(field)
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Color must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Color can only contain letters and spaces'),

  // Type validation
  type: (field = 'type') => body(field)
    .isIn(['shirt', 'pants', 'jacket', 'shoes', 'dress', 'accessory'])
    .withMessage('Type must be one of: shirt, pants, jacket, shoes, dress, accessory'),

  // Occasion validation
  occasion: (field = 'occasion') => body(field)
    .isIn(['casual', 'formal', 'party', 'workout', 'business', 'date', 'travel', 'beach', 'winter', 'summer'])
    .withMessage('Occasion must be one of the predefined options'),

  // Pagination validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  // Search validation
  search: () => query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters')
    .escape(),

  // Sort validation
  sort: (allowedFields = []) => query('sort')
    .optional()
    .isIn(allowedFields)
    .withMessage(`Sort field must be one of: ${allowedFields.join(', ')}`),

  // Status validation
  status: (field = 'status') => body(field)
    .optional()
    .isIn(['pending', 'accepted', 'rejected'])
    .withMessage('Status must be one of: pending, accepted, rejected')
};

// Specific validation chains
export const clothValidations = [
  commonValidations.name('name'),
  commonValidations.type('type'),
  commonValidations.color('color'),
  commonValidations.occasion('occasion'),
  body('image')
    .custom((value, { req }) => {
      if (!req.file && !value) {
        throw new Error('Image is required');
      }
      return true;
    }),
  body('image')
    .custom((value, { req }) => {
      if (req.file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Image must be JPEG, PNG, or WebP format');
        }
        if (req.file.size > 5 * 1024 * 1024) { // 5MB
          throw new Error('Image size must be less than 5MB');
        }
      }
      return true;
    })
];

export const outfitValidations = [
  commonValidations.name('name'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Outfit must contain at least one item'),
  body('items.*')
    .isMongoId()
    .withMessage('Each item must be a valid MongoDB ObjectId'),
  body('occasion')
    .optional()
    .isIn(['casual', 'formal', 'party', 'workout', 'business', 'date', 'travel', 'beach', 'winter', 'summer'])
    .withMessage('Occasion must be one of the predefined options')
];

export const suggestionValidations = [
  commonValidations.name('name'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Suggestion must contain at least one item'),
  body('items.*')
    .isMongoId()
    .withMessage('Each item must be a valid MongoDB ObjectId'),
  body('ownerId')
    .isMongoId()
    .withMessage('Owner ID must be a valid MongoDB ObjectId'),
  body('stylistId')
    .optional()
    .isMongoId()
    .withMessage('Stylist ID must be a valid MongoDB ObjectId'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
    .escape()
];

export const collectionValidations = [
  commonValidations.name('name'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .escape(),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Collection must contain at least one item'),
  body('items.*')
    .isMongoId()
    .withMessage('Each item must be a valid MongoDB ObjectId')
];

export const commentValidations = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
    .escape()
];

export const userValidations = [
  commonValidations.name('name'),
  commonValidations.email('email'),
  commonValidations.password('password')
];

// Sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body, query, and params (only if they exist and are objects)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  // Note: req.query and req.params are read-only in Express, so we skip them
  // The sanitization will happen at the controller level when needed

  next();
};
