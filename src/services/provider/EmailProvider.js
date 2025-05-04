const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

class EmailProvider {
  constructor(config) {
    this.transporter = nodemailer.createTransport(config);
  }

  async send({ to, subject, text, html }) {
    const mailOptions = { from: this.transporter.options.auth.user, to, subject, text, html };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (err) {
      logger.error('Email send error', err);
      throw err;
    }
  }
}

module.exports = EmailProvider;
