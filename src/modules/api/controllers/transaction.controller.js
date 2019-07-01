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
      ],
      /**
       * @api {get} /api/v1/donate Watch for donate transaction
       * @apiName Donate
       * @apiGroup Transactions
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       * {
       *   "receiverId": "testaccount",
       *   "donateOp": {
       *      "ref_block_num": 52650,
       *      "ref_block_prefix": 4002977493,
       *	    "expiration": "2019-07-01T09:59:32",
       *      "operations": [
       *        [ 0,
       *          {
       *           "fee": {
       *              "amount": "2000000",
       *              "asset_id": "1.3.0"
       *           },
       *           "from": "1.2.33",
       *           "to": "1.2.22",
       *           "amount": {
       *             "amount": "100",
       *             "asset_id": "1.3.0"
       *             },
       *             }
       *           ]
       *        ],
       *   "extensions": [],
       *   "signatures": [
       *       "1f034e960ec8a809f26923748a32bdd6e2fc2ebe4e8051ec3b1e53409f37eff3cc24063f37539814dc05206794fbe6562d5db51cffa662357e3ca7de0710a0d187"
       *     ]
       *    ]
       *  },
       * }
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *  "status": 200
       *  "result": true
       * }
       */
      [
        'post', '/api/v1/donate',
        this.authValidator.loggedOnly,
        this.transactionValidator.donate,
        this.createDonateTransaction.bind(this)
      ]
    ];
  }

  async getTransactions(user, {limit, skip}) {
    skip = skip || 0;
    return await this.userService.getUserTransactions(user.id, skip, limit);
  }

  async createDonateTransaction(user, {receiverId, donateOp}) {
    return await this.userService.donate(user.id, receiverId, donateOp);
  }

}

module.exports = TransactionController;
