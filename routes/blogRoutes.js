// backend/routes/blogRoutes.js
import { Router } from 'express';
import multer from 'multer';
import * as blog from '../controllers/blogController.js';
import { authenticate } from '../middleware/auth.js';

const router  = Router();
const upload  = multer({ dest: 'uploads/' });

/* ─── Public ─── */
router.get('/',      blog.getAllBlogs);
router.get('/:id',   blog.getBlogById);

/* ─── Protected ─── */
router.post('/',      authenticate, upload.single('image'), blog.createBlog);
router.put('/:id',    authenticate, upload.single('image'), blog.updateBlog);
router.delete('/:id', authenticate,                         blog.deleteBlog);

export default router;
