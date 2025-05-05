const twilio = require('twilio');
const logger = require('../../utils/logger');

class SmsProvider {
  constructor(config) {
    this.client = twilio(config.accountSid, config.authToken);
    this.from = config.from;
  }

  async send({ to, body }) {
    try {
      const msg = await this.client.messages.create({ from: this.from, to, body });
      logger.info(`SMS sent: ${msg.sid}`);
      return msg;
    } catch (err) {
      logger.error('SMS send error', err);
      throw err;
    }
  }
}

module.exports = SmsProvider;