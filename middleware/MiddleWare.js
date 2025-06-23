import { body, validationResult } from 'express-validator';

const validateSignup = [
  body('username')
    .notEmpty().withMessage('User Name is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('User password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits'),
  // Middleware function to check validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }   
    next();
  }
];

export default validateSignup;