import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Your email service (Gmail in this case)
  auth: {
    user: process.env.EMAIL_USER, // Get email from environment variables
    pass: process.env.EMAIL_PASS, // Get password from environment variables (use app password)
  },
});

export default transporter;