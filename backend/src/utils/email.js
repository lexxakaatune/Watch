const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER) {
    console.log('Email not configured. Would send:', { to, subject });
    return { messageId: 'mock-email-id' };
  }
  try {
    const info = await transporter.sendMail({
      from: `"Watch Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    return info;
  } catch (err) {
    console.error('Email send failed:', err.message);
    throw err;
  }
};

module.exports = { sendEmail };
