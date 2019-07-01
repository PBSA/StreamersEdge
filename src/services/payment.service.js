const {statuses} = require('../constants/payment');
const VALID_ORDER_STATUS = 'COMPLETED';

class PaymentService {

  /**
   * @param {PaypalRepository} opts.paypalRepository
   * @param {PaymentRepository} opts.paymentRepository
   * @param {CoinmarketcapRepository} opts.coinmarketcapRepository
   * @param {PeerplaysRepository} opts.peerplaysRepository
   */
  constructor(opts) {
    this.paypalRepository = opts.paypalRepository;
    this.paymentRepository = opts.paymentRepository;
    this.coinmarketcapRepository = opts.coinmarketcapRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
  }

  async processPayment(User, orderId) {
    let order;

    try {
      order = await this.paypalRepository.verifyPayment(orderId);
    } catch (e) {
      throw new Error('Verify payment error');
    }

    if (order.status !== VALID_ORDER_STATUS) {
      throw new Error('Invalid order status');
    }

    return await Promise.all(order.purchase_units.map(async (unit) => {
      const paymentObject = await this.processPurchaseUnit(User.id, User.peerplaysAccountId, orderId, unit);
      return await this.paymentRepository.model.create(paymentObject);
    }));
  }

  async processPurchaseUnit(userId, peerplaysAccountId, orderId, unit) {
    const payment = {
      userId,
      orderId,
      amountCurrency: unit.amount.currency_code,
      amountValue: unit.amount.value,
      ppyAmountValue: await this.coinmarketcapRepository.getPPYAmount(unit.amount.value),
      status: statuses.SUCCESS,
      error: '',
      txId: '',
      blockNumber: ''
    };

    if (!peerplaysAccountId) {
      payment.status = statuses.ERROR;
      payment.error = 'User does not have peerplays account';
      return payment;
    }

    try {
      const result = await this.peerplaysRepository.sendPPY(peerplaysAccountId, payment.ppyAmountValue);
      payment.txId = result.id;
      payment.blockNumber = result.block_num;
      payment.ppyAmountValue = result.amount;
    } catch (e) {
      payment.status = statuses.ERROR;
      payment.error = e.message;
      return payment;
    }

    return payment;
  }

}

module.exports = PaymentService;
