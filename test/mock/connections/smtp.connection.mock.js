class SmtpConnectionMock {

  constructor() {
    this.tokens = [];
  }

  connect() {
  }

  async sendMail(options) {
    const token = options.html.match(/confirm-email\/([a-z0-9]+)/) || options.html.match(/change-email\/([a-z0-9]+)/);
    this.tokens.push(token[1]);
  }

  disconnect() {}

}

module.exports = SmtpConnectionMock;
