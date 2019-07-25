class CoinmarketcapConnectionMock {

  connect() {}

  async getPPYAmount() {
    const price = 0.03138242200360808;
    return price;
  }

  disconnect() {}
}

module.exports = CoinmarketcapConnectionMock;
