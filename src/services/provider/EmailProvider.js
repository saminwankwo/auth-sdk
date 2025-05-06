const nodemailer = require('nodemailer');

class EmailProvider {
  constructor(config) {
    this.transporter = nodemailer.createTransport(config);
    this.from = config.auth.user;
  }

  async send({ to, subject, text, html }) {
    const mailOptions = { from: this.from, to, subject, text, html };
    const info = await this.transporter.sendMail(mailOptions);
    return info;
  }
}

module.exports = EmailProvider;
