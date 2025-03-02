import nodemailer from "nodemailer";

export const getuserenv=()=>{
  return {user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS};
}
export const transporter = nodemailer.createTransport({
 
  service:"Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Get email from environment variables
    pass: process.env.EMAIL_PASS, // Get password from environment variables (use app password)
  },
  
});



