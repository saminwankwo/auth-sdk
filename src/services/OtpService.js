
const crypto = require('crypto');
const moment = require('moment');
const OtpModel = require('../models/Otp');
const EmailProvider = require('./provider/EmailProvider');
const SmsProvider = require('./provider/SmsProvider');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

class OtpService {
  constructor(config) {
    this.ttl = config.otpTtl || 5 * 60 * 1000; // default 5 mins
    this.emailProvider = new EmailProvider(config.providers.email);
    this.smsProvider = new SmsProvider(config.providers.sms);
  }

  // Generate numeric OTP
  _generateCode(length = 6) {
    return crypto.randomInt(0, 10 ** length).toString().padStart(length, '0');
  }

  // Create and send OTP
  async generateAndSend(userId, destination, type = 'email') {
    const code = this._generateCode();
    const expiresAt = moment().add(this.ttl, 'ms').toDate();
    // persist
    await OtpModel.create({ userId, code, type, expiresAt });

    const message = type === 'sms'
      ? { to: destination, body: `Your OTP is ${code}` }
      : { to: destination, subject: 'Your OTP Code', text: `Your OTP is ${code}`, html: `<p>Your OTP is <strong>${code}</strong></p>` };

    try {
      const info = (type === 'sms')
        ? await this.smsProvider.send(message)
        : await this.emailProvider.send(message);
      logger.info(`OTP sent via ${type} to ${destination}`);
      return info;
    } catch (err) {
      logger.error(`Failed to send OTP via ${type}: ${err.message}`);
      throw new AppError('Failed to send OTP', 500);
    }
  }

  // Verify code and consume
  async verify(userId, code, type = 'email') {
    const record = await OtpModel.findOne({ userId, code, type, consumed: false });
    if (!record) throw new AppError('Invalid or expired OTP', 400);
    if (record.expiresAt < new Date()) {
      throw new AppError('OTP has expired', 400);
    }
    record.consumed = true;
    await record.save();
    return true;
  }
}

module.exports = OtpService;
