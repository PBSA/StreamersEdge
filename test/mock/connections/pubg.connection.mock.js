class PubgClient {
  getPlayer(username) {
    return `account.${username}`;
  }

}

class PubgConnectionMock {

  constructor() {
    this.client = new PubgClient();
  }

  connect() {}

  disconnect() {}
}

module.exports = PubgConnectionMock;