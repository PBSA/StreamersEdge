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
      return this.processPurchaseUnit(User.id, User.peerplaysAccountId, orderId, unit);
    }));
  }

  async processPurchaseUnit(userId, peerplaysAccountId, orderId, unit) {
    let payment = await this.paymentRepository.model.findOne({where: {orderId, status: statuses.ERROR}});

    if (!payment) {
      payment = this.paymentRepository.model.build({
        userId,
        orderId,
        amountCurrency: unit.amount.currency_code,
        amountValue: unit.amount.value,
        ppyAmountValue: await this.coinmarketcapRepository.getPPYAmount(unit.amount.value),
        status: statuses.SUCCESS,
        error: '',
        txId: '',
        blockNumber: 0
      });
    } else {
      payment.error = '';
      payment.status = statuses.SUCCESS;
    }

    try {
      if (!peerplaysAccountId) {
        throw new Error('User does not have peerplays account');
      }

      const result = await this.peerplaysRepository.sendPPY(peerplaysAccountId, payment.ppyAmountValue);
      payment.txId = result.id;
      payment.blockNumber = result.block_num;
      payment.ppyAmountValue = result.amount;
    } catch (e) {
      payment.status = statuses.ERROR;
      payment.error = e.message.length > 255 ? e.message.substr(0, 254) : e.message;
    }

    return payment.save();
  }

}

module.exports = PaymentService;
