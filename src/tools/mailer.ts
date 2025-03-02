import nodemailer from "nodemailer";
import dotenv from "dotenv";
// dotenv.config();
const name = () => {
  console.log("email:", process.env.EMAIL_USER);
  return process.env.EMAIL_USER;
};

const transporter = nodemailer.createTransport({
  // host: "mail.gmx.com", // Your email service (Gmail in this case)
  // port: 587,
  // secure: false,
  service:"Gmail",
  auth: {
    user: "***", // Get email from environment variables
    pass: "***", // Get password from environment variables (use app password)
  },
  // tls: {
  //   ciphers: "SSLv3",
  //   rejectUnauthorized: false,
  // },
  // debug: true,
});

module.exports = transporter;

