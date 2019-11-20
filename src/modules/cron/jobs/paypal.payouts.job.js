class PaypalPayoutsJob {

  /**
   * @param {PaymentService} opts.paymentService
   */
  constructor(opts) {
    this.paymentService = opts.paymentService;
  }

  /**
   * Creates a PayPal payout for any pending redemptions
   * @returns {Promise<void>}
   */
  async runJob() {
    await this.paymentService.processPendingRedemptions();
  }
}

module.exports = PaypalPayoutsJob;
