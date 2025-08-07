import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import transporter, { generateOTP } from '../config/nodemailer.js'; // adjust path as needed

/* ---------- POST /api/auth/reset/request ---------- */
export const requestReset = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const { email } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin)
      return res.status(404).json({ message: 'Account not found.' });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await admin.update({ resetOTP: otp, resetOTPExpires: expires });

    await transporter.sendMail({
      from: `"Elite-Restore" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: 'Your Password Reset Code - Elite Restore',
      html: generateResetEmailTemplate(admin.adminName, otp)
    });

    return res.json({ message: 'OTP sent to registered e-mail.' });
  } catch (err) {
    next(err);
  }
};

const generateResetEmailTemplate = (name, otp) => {
  return `
 <!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Password Reset</title><style>body{font-family:'Poppins',Arial,sans-serif;background:#f5f7fa;margin:0;line-height:1.6}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:#1a365d;padding:30px 20px;text-align:center;border-radius:8px 8px 0 0}.logo{color:#fff;font-size:28px;font-weight:700}.logo span{color:#4299e1}.content{background:#fff;padding:30px;border-radius:0 0 8px 8px;box-shadow:0 4px 6px rgba(0,0,0,0.1)}h1{color:#1a365d;font-size:24px;margin-top:0}.otp-container{background:#f8fafc;border:1px dashed #cbd5e0;padding:20px;text-align:center;margin:25px 0;border-radius:6px}.otp-code{font-size:32px;font-weight:700;letter-spacing:3px;color:#1a365d;margin:10px 0}.footer{text-align:center;margin-top:30px;color:#718096;font-size:14px}@media (max-width:600px){.content{padding:20px}.otp-code{font-size:28px}}</style></head><body><div class="container"><div class="header"><a href="https://elite-restore.vercel.app/" class="logo">ELITE<span>RESTORE</span></a></div><div class="content"><h1>Password Reset Request</h1><p>Hello ${name},</p><p>We received a password reset request for your Elite Restore account. Use this OTP:</p><div class="otp-container"><div class="otp-code">${otp}</div><p>Expires in 10 minutes</p></div><p>If you didn't request this, please ignore this email.</p><p>Best regards,<br>Elite Restore Team</p></div><div class="footer"><p>© ${new Date().getFullYear()} Elite Restore</p></div></div></body></html>
  `;
};

/* ---------- POST /api/auth/reset/verify ---------- */
export const verifyReset = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    const { email, otp, newPassword } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin || !admin.resetOTP)
      return res.status(400).json({ message: 'Invalid or expired OTP.' });

    if (admin.resetOTP !== otp)
      return res.status(400).json({ message: 'Incorrect OTP.' });

    if (admin.resetOTPExpires < new Date())
      return res.status(400).json({ message: 'OTP has expired.' });

    const hashed = await bcrypt.hash(newPassword, 12);

    await admin.update({
      password: hashed,
      resetOTP: null,
      resetOTPExpires: null
    });

    return res.json({ message: 'Password reset successful.' });
  } catch (err) {
    next(err);
  }
};
