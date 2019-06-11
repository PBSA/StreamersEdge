/* istanbul ignore file */
const nodemailer = require('nodemailer');
const BaseConnection = require('./abstracts/base.connection');

class SmtpConnection extends BaseConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    super();

    this.config = opts.config;
  }

  connect() {
    console.log(this.config.mailer);
    this.transporter = nodemailer.createTransport(this.config.mailer);
  }

  async sendMail(options) {
    await this.transporter.sendMail(options);
    return true;
  }

  disconnect() {
  }

}

module.exports = SmtpConnection;
