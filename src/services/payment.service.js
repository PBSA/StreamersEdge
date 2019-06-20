const {statuses} = require('../constants/payment');
const VALID_ORDER_STATUS = 'COMPLETED';

class PaymentService {

  /**
   * @param {PaypalRepository} opts.paypalRepository
   * @param {PaymentRepository} opts.paymentRepository
   * @param {CoinmarketcapRepository} opts.coinmarketcapRepository
   */
  constructor(opts) {
    this.paypalRepository = opts.paypalRepository;
    this.paymentRepository = opts.paymentRepository;
    this.coinmarketcapRepository = opts.coinmarketcapRepository;

    this.testId = '4PK82599HT872104T';
    this.processPayment({id: 1}, this.testId);
  }

  async processPayment(User, orderId) {

    const order = await this.paypalRepository.verifyPayment(orderId);

    if (order.status !== VALID_ORDER_STATUS) {
      throw new Error('Invalid order status');
    }

    return await Promise.all(order.purchase_units.map(async (unit) => this.processPurchaseUnit(User.id, orderId, unit)));
  }

  async processPurchaseUnit(userId, orderId, unit) {
    const payment = {
      userId,
      orderId,
      amountCurrency: unit.amount.currency_code,
      amountValue: unit.amount.value,
      ppyAmountValue: await this.coinmarketcapRepository.getPPYAmount(unit.amount.value),
      status: statuses.SUCCESS
    };
    console.log(payment);
    // todo process peerplays transfer and save info
    // need check if user added his peerplays account info
  }

}

module.exports = PaymentService;
