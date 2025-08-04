import { Router } from 'express';
import { body } from 'express-validator';
import { requestReset, verifyReset } from '../controllers/passwordController.js';

const router = Router();

router.post(
  '/reset/request',
  [body('email').isEmail().normalizeEmail()],
  requestReset
);

router.post(
  '/reset/verify',
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }),
    body('newPassword').isLength({ min: 6 })
  ],
  verifyReset
);

export default router;
