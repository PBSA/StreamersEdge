class TransactionController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {TransactionValidator} opts.transactionValidator
   * @param {UserService} opts.userService
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.transactionValidator = opts.transactionValidator;
    this.userService = opts.userService;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes() {
    return [
      /**
       * @api {get} /api/v1/transactions Get user transactions
       * @apiName TransactionsGet
       * @apiGroup Transactions
       * @apiVersion 0.1.0
       * @apiParam {String} limit
       * @apiParam {String} [skip]
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *  "status": 200
       *  "result": [{
       *    "id": 1,
       *    "txId": "8ed2756c1b26883585f6259eca90ad0e44be04a2",
       *    "blockNum": 901602,
       *    "trxNum": 0,
       *    "ppyAmountValue": 100,
       *    "type": "challengeCreation",
       *    "createdAt": "2019-07-01T07:25:33.100Z",
       *    "updatedAt": "2019-07-01T07:25:33.100Z",
       *    "userId": 1,
       *    "challengeId": 3
       *  }]
       * }
       */
      [
        'get', '/api/v1/transactions',
        this.authValidator.loggedOnly,
        this.transactionValidator.getTransactions,
        this.getTransactions.bind(this)
      ]
    ];
  }

  async getTransactions(user, {limit, skip}) {
    skip = skip || 0;
    return await this.userService.getUserTransactions(user.id, skip, limit);
  }

}

module.exports = TransactionController;
