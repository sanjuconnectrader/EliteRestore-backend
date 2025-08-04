// backend/controllers/blogController.js
import fs   from 'fs';
import Blog from '../models/Blog.js';

/* helper – convert buffer → base64 data-URI */
const toBase64 = (buf, mime) => `data:${mime};base64,${buf.toString('base64')}`;

/* ───────── POST /api/blogs (protected) ───────── */
export const createBlog = async (req, res) => {
  if (!req.admin) return res.status(401).json({ message: 'Unauthorized' });
  if (!req.file)  return res.status(400).json({ message: 'Please upload an image.' });

  try {
    const { title, contents, date, readTime, category } = req.body;
    const imgBuf = fs.readFileSync(req.file.path);

    const blog = await Blog.create({
      title, contents, date, readTime, category,
      img: imgBuf,
      imgName: req.file.originalname,
      imgType: req.file.mimetype,
      adminId: req.admin.id,
    });

    fs.unlinkSync(req.file.path);
    return res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ───────── GET /api/blogs (public) ───────── */
export const getAllBlogs = async (_req, res) => {
  try {
    const blogs = await Blog.findAll({ order: [['date', 'DESC']] });
    const list  = blogs.map((b) => {
      const data = b.get({ plain: true });
      if (data.img) data.img = toBase64(data.img, b.imgType);
      return data;
    });
    return res.status(200).json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ───────── GET /api/blogs/:id (public) ───────── */
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found.' });

    const data = blog.get({ plain: true });
    if (data.img) data.img = toBase64(data.img, blog.imgType);
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ───────── PUT /api/blogs/:id (protected) ───────── */
export const updateBlog = async (req, res) => {
  if (!req.admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found.' });

    const { title, contents, date, readTime, category } = req.body;
    const updates = { title, contents, date, readTime, category };

    if (req.file) {
      const imgBuf = fs.readFileSync(req.file.path);
      Object.assign(updates, {
        img: imgBuf,
        imgName: req.file.originalname,
        imgType: req.file.mimetype,
      });
      fs.unlinkSync(req.file.path);
    }

    await blog.update(updates);

    const data = blog.get({ plain: true });
    if (data.img) data.img = toBase64(data.img, blog.imgType);
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* ───────── DELETE /api/blogs/:id (protected) ───────── */
export const deleteBlog = async (req, res) => {
  if (!req.admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog post not found.' });

    await blog.destroy();
    return res.status(200).json({ message: 'Blog post deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
