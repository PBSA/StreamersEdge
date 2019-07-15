class CoinmarketcapRepository {

  /**
   * @param {CoinmarketcapConnection} opts.coinmarketcapConnection
   */
  constructor(opts) {
    this.coinmarketcapConnection = opts.coinmarketcapConnection;
  }

  async getPPYAmount(usdAmount) {
    return this.coinmarketcapConnection.getPPYAmount(usdAmount);
  }

}

module.exports = CoinmarketcapRepository;
