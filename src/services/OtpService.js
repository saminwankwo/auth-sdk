const Otp = require('../models/Otp');
const crypto = require('crypto');
const moment = require('moment');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Configure Nodemailer transporter
const mailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class OtpService {
  static async generateOtp(userId, type = 'sms') {
    // Create 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = moment().add(5, 'minutes').toDate();

    // Persist OTP
    const otp = await Otp.create({ userId, code, type, expiresAt });
    return otp;
  }

  static async sendOtp(otp, destination) {
    if (otp.type === 'sms') {
      await twilioClient.messages.create({
        body: `Your verification code is ${otp.code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: destination,
      });
    } else if (otp.type === 'email') {
      await mailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: destination,
        subject: 'Your Verification Code',
        text: `Your verification code is ${otp.code}`,
      });
    }
  }

  static async verifyOtp(userId, code, type = 'sms') {
    const otp = await Otp.findOne({ userId, code, type, consumed: false });
    if (!otp) throw new Error('Invalid or expired OTP');

    // Check expiration
    if (otp.expiresAt < new Date()) throw new Error('OTP has expired');

    // Mark consumed
    otp.consumed = true;
    await otp.save();

    return true;
  }
}

module.exports = OtpService;