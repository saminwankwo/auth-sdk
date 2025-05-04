const Otp = require('../models/Otp');
const crypto = require('crypto');
const moment = require('moment');
const EmailProvider = require('./provider/EmailProvider');
const SmsProvider = require('./provider/SmsProvider');

class OtpService {
  constructor(config) {
    this.emailProvider = new EmailProvider(config.providers.email);
    this.smsProvider = new SmsProvider(config.providers.sms);
    this.ttl = config.providers.otpTtl || 300000; // in ms
  }

  async generateAndSend(userId, destination, type = 'email') {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = moment().add(this.ttl, 'milliseconds').toDate();
    await Otp.create({ userId, code, type, expiresAt });

    if (type === 'sms') {
      return this.smsProvider.send({ to: destination, body: `Your OTP is ${code}` });
    } else {
      return this.emailProvider.send({ to: destination, subject: 'Your OTP Code', text: `Your OTP is ${code}` });
    }
  }

  async verify(userId, code, type = 'email') {
    const record = await Otp.findOne({ userId, code, type, consumed: false });
    if (!record || record.expiresAt < new Date()) {
      throw new Error('Invalid or expired OTP');
    }
    record.consumed = true;
    await record.save();
    return true;
  }
}

module.exports = OtpService;