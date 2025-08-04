// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

/* ─────────────────────────────────────────────
   1. authenticate — verifies & decodes JWT
───────────────────────────────────────────── */
export const authenticate = async (req, res, next) => {
  try {
    /* Expect: Authorization: Bearer <token> */
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) return res.status(401).json({ message: 'No token provided.' });

    /* Verify signature + expiry */
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    /* { id, email } because that’s what login() signed */

    /* Make sure the admin still exists */
    const admin = await Admin.findByPk(payload.id);
    if (!admin)
      return res.status(401).json({ message: 'Account no longer exists.' });

    /* Attach to request for downstream handlers */
    req.admin = admin;     // full Sequelize instance
    req.jwtPayload = payload;

    next();
  } catch (err) {
    console.error('JWT auth error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

/* ─────────────────────────────────────────────
   2. authorizeAdmin — admin-only gatekeeper
───────────────────────────────────────────── */
export const authorizeAdmin = async (req, res, next) => {
  /* Run the basic auth first */
  await authenticate(req, res, async () => {
    /* If you added a “role” column (defaultValue: 'admin') */
    if (req.admin.role && req.admin.role !== 'admin')
      return res.status(403).json({ message: 'Admins only.' });

    /* Otherwise every record in the Admin table IS an admin by definition */
    next();
  });
};
