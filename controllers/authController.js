import { validationResult } from 'express-validator';
import Admin from '../models/Admin.js';
import {
  hashPassword,
  comparePassword,
  generateToken,          // JWT
} from '../utils/authUtils.js';
import { generateApprovalToken } from '../utils/generateToken.js';
import transporter from '../utils/mailer.js';

/* ---------- POST /api/auth/register ---------- */
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const { adminName, email, password } = req.body;
    const existing = await Admin.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ message: 'Email already registered.' });

    const hashed        = await hashPassword(password);
    const approvalToken = generateApprovalToken();

    await Admin.create({
      adminName,
      email,
      password: hashed,
      approvalToken,
      isApproved: false,
    });

    /* ------------- Send approval request ------------- */
    const supportMail = {
      from: '"Connectrader" <no-reply@connectrader.com>',
      to:   'sanjiths513@gmail.com',
      subject: `Manual approval needed: ${email}`,
      html: `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Admin Approval</title>
<style>body{font-family:sans-serif;margin:0;background:#f7f9fc}.email-container{max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)}.header{background:linear-gradient(135deg,#4361ee,#3a0ca3);padding:30px 20px;text-align:center;color:#fff}.content{padding:30px}.detail-row{display:flex;margin-bottom:10px}.actions{display:flex;justify-content:center;gap:15px;margin-top:30px}.action-btn{padding:12px 25px;border-radius:6px;font-weight:600;text-decoration:none;color:#fff}.approve-btn{background:#2ecc71}.deny-btn{background:#e74c3c}.footer{padding:20px;text-align:center;color:#6c757d;font-size:12px}</style>
</head>
<body>
<div class="email-container"><div class="header"><h1>Admin Approval Request</h1></div>
<div class="content"><p>New admin registration pending approval:</p>
<div><div class="detail-row"><span>Name:</span><span>${adminName}</span></div>
<div class="detail-row"><span>Email:</span><span>${email}</span></div></div>
<div class="actions"><a href="${process.env.BACKEND_URL}/api/admin/approval/${approvalToken}?action=approve" class="action-btn approve-btn">✓ Approve</a>
<a href="${process.env.BACKEND_URL}/api/admin/approval/${approvalToken}?action=deny" class="action-btn deny-btn">✗ Deny</a></div>
</div><div class="footer"><p>© ${new Date().getFullYear()} Connectrader</p></div>
</div></body></html>`,
    };
    transporter.sendMail(supportMail).catch(console.error);
    /* -------------------------------------------------- */

    return res.status(201).json({
      message:
        'Registration received. An administrator must approve your account before you can log in.',
    });
  } catch (err) {
    next(err);
  }
};

/* ---------- POST /api/auth/login ---------- */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials.' });

    if (!admin.isApproved)
      return res
        .status(403)
        .json({ message: 'Account pending manual approval.' });

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateToken({ id: admin.id, email: admin.email });

    return res.status(200).json({
      token,
      expiresIn: '7d',
      admin: {
        id: admin.id,
        adminName: admin.adminName,
        email: admin.email,
      },
    });
  } catch (err) {
    next(err);
  }
};
