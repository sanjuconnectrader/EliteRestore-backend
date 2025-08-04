// config/mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/* ──────────────────────────────────────────
   Transporter (Gmail OAuth or App-Password)
────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // e.g. "youraddress@gmail.com"
    pass: process.env.EMAIL_PASS      // app password or OAuth token
  },
  tls: {
    rejectUnauthorized: false         // allow self-signed certs (optional)
  }
});

/* ──────────────────────────────────────────
   Generate a 6-digit numeric OTP
────────────────────────────────────────── */
export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // => "123456"

/* ──────────────────────────────────────────
   Exports
────────────────────────────────────────── */
export default transporter;
