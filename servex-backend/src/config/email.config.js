// src/config/email.config.js
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Function to send OTP email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"ServeX Digital" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - ServeX',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Serve<span style="color: #fbbf24;">X</span></h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #0f172a; margin-top: 0;">Hello ${name}! 👋</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
            Thank you for registering with ServeX. To complete your registration, please use the OTP code below:
          </p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your OTP Code</p>
            <h1 style="color: #0ea5e9; margin: 0; font-size: 48px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            ⏰ This code will expire in <strong>10 minutes</strong>.<br>
            🔒 For security reasons, please do not share this code with anyone.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            If you didn't request this code, please ignore this email.<br>
            © 2026 ServeX Digital. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTPEmail };