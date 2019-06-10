const fs = require('fs-extra');
const Handlebars = require('handlebars');

class MailService {

  /**
   * @param {Object} opts
   * @param {AppConfig} opts.config
   * @param {SmtpConnection} opts.smtpConnection
   */
  constructor(opts) {
    this.config = opts.config;
    this.smtpConnection = opts.smtpConnection;
  }

  async sendMailAfterRegistration(email, uniqueLink) {
    const sourceHTML = fs.readFileSync(`${__dirname}/templates/welcome.handlebars`).toString();
    const templateHTML = Handlebars.compile(sourceHTML);
    const url = `${this.config.frontUrl}/confirm-email/${uniqueLink}`;
    const resultHtml = templateHTML({url});

    const options = {
      to: email,
      from: this.config.mailer.sender,
      subject: 'Streamers Edge Account Registration',
      html: resultHtml
    };
    await this.smtpConnection.sendMail(options);
  }

}

module.exports = MailService;
