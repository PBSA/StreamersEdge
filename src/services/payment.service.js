const {randomBytes} = require('crypto');
const {Op} = require('sequelize');
const {statuses} = require('../constants/payment');
const VALID_ORDER_STATUS = 'COMPLETED';

class PaymentService {

  /**
   * @param {PaymentRepository} opts.paymentRepository
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {UserRepository} opts.userRepository
   * @param {PaypalRepository} opts.paypalRepository
   * @param {PaypalPayoutRepository} opts.paypalPayoutRepository
   * @param {PaypalRedemptionRepository} opts.paypalRedemptionRepository
   * @param {PaypalConnection} opts.paypalConnection
   * @param {DbConnection} opts.dbConnection
   */
  constructor(opts) {
    this.paymentRepository = opts.paymentRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.userRepository = opts.userRepository;
    this.paypalRepository = opts.paypalRepository;
    this.paypalPayoutRepository = opts.paypalPayoutRepository;
    this.paypalRedemptionRepository = opts.paypalRedemptionRepository;
    this.paypalConnection = opts.paypalConnection;
    this.dbConnection = opts.dbConnection;
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

    await this.userRepository.setPaypalDetails(User.id, {
      paypalEmail: order.payer.email_address,
      paypalAccountId: order.payer.payer_id
    });

    if (!User.peerplaysAccountId && User.peerplaysAccountName) {
      User.peerplaysAccountId = await this.peerplaysRepository.getAccountId(User.peerplaysAccountName);
      await this.userRepository.setAccountId(User.id, User.peerplaysAccountId);
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
        ppyAmountValue: unit.amount.value,
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

      const result = await this.peerplaysRepository.sendPPY(peerplaysAccountId, payment.amountValue);
      payment.txId = result.id;
      payment.blockNumber = result.block_num;
      payment.ppyAmountValue = result.amount;
    } catch (e) {
      payment.status = statuses.ERROR;
      payment.error = e.message.length > 255 ? e.message.substr(0, 254) : e.message;
    }

    return payment.save();
  }

  async processPendingRedemptions() {
    const PaypalRedemption = this.paypalRedemptionRepository.model;
    const PaypalPayout = this.paypalPayoutRepository.model;

    const sequelize = this.dbConnection.getConnection();

    const result = await sequelize.transaction(async (transaction) => {
      const redemptions = await PaypalRedemption.findAll({
        where: {paypalPayoutId: {[Op.eq]: null}}
      }, {transaction, raw: true});

      if (redemptions.length === 0) {
        return;
      }

      const senderBatchId = randomBytes(16).toString('hex');
      const payout = await PaypalPayout.create({senderBatchId}, {transaction});

      await PaypalRedemption.update({
        paypalPayoutId: payout.id
      }, {
        where: {paypalPayoutId: {[Op.eq]: null}}
      }, {transaction});

      return {redemptions, payout};
    });

    if (!result) {
      return;
    }

    const {redemptions, payout} = result;
    const items = await Promise.all(redemptions.map(async ({userId, amountCurrency, amountValue}) => {
      const {paypalAccountId} = await this.userRepository.findByPk(userId);
      return {paypalAccountId, amountCurrency, amountValue};
    }));

    const {payoutBatchId} = await this.paypalConnection.createBatchPayout(payout.senderBatchId, items);
    payout.payoutBatchId = payoutBatchId;
    await payout.save();
  }

}

module.exports = PaymentService;
