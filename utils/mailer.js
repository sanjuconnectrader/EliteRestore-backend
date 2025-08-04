import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();                // ← must run before you read process.env

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,  // smtp.gmail.com
  port: Number(process.env.SMTP_PORT), // 587
  secure: process.env.SMTP_PORT === '465', // false for 587
  auth: {
    user: process.env.EMAIL_USER, // financeplanner.ct@gmail.com
    pass: process.env.EMAIL_PASS, // vqmmnmzctfqxeyqj
  },
});

// optional sanity check
transporter.verify()
  .then(() => console.log('✅  SMTP ready'))
  .catch(console.error);

export default transporter;
