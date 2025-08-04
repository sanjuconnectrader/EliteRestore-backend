import express from 'express';
import { approveAdmin } from '../controllers/approvalController.js';

const router = express.Router();
router.get('/:token', approveAdmin); // /api/admin/approval/:token

export default router;
