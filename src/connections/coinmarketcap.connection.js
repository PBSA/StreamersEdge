const rp = require('request-promise');

class CoinmarketcapConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.config = opts.config;
  }

  connect() {}

  async makeRequest(path, data) {
    const requestOptions = {
      method: 'GET',
      uri: `https://pro-api.coinmarketcap.com/v1/${path}`,
      qs: data,
      headers: {
        'X-CMC_PRO_API_KEY': this.config.coinmarketcap.apiKey
      },
      json: true,
      gzip: true
    };
    return rp(requestOptions);
  }

  async getPPYAmount(usdAmount) {

    const result = await this.makeRequest('tools/price-conversion', {
      symbol: 'USD',
      amount: usdAmount,
      convert: 'PPY'
    });

    return result.data.quote.PPY.price;

  }

  disconnect() {}
}

module.exports = CoinmarketcapConnection;
