const twilio = require('twilio');

class SmsProvider {
  constructor({ accountSid, authToken, from }) {
    this.client = twilio(accountSid, authToken);
    this.from = from;
  }

  async send({ to, body }) {
    const message = await this.client.messages.create({
      from: this.from,
      to,
      body,
    });
    return message;
  }
}

module.exports = SmsProvider;


