import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "mail.gmx.com", // Your email service (Gmail in this case)
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // Get email from environment variables
    pass: process.env.EMAIL_PASS, // Get password from environment variables (use app password)
  },
  tls: {
    rejectUnauthorized: false, // Prevents some certificate issues
  },
});

export default transporter;