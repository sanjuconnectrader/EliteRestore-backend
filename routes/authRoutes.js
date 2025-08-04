import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';

const router = Router();

/* ---- Validation chains ---- */
const registerValidation = [
  body('adminName').trim().isLength({ min: 2, max: 60 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

/* ---- Routes ---- */
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

export default router;
