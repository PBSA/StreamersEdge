class TransactionController {

  /**
   * @swagger
   *
   * definitions:
   *  TransactionResponse:
   *    allOf:
   *      - $ref: '#/definitions/TransactionResponse'
   *      - type: object
   *        properties:
   *          result:
   *            $ref: '#/definitions/Transaction'
   *
   *  Transaction:
   *    type: object
   *    properties:
   *      id:
   *        type: number
   *      txId:
   *        type: string
   *      blockNum:
   *        type: number
   *      trxNum:
   *        type: number
   *      ppyAmountValue:
   *        type: number
   *      type:
   *        type: string
   *      createdAt:
   *        type: string
   *      updatedAt:
   *        type: string
   *      userId:
   *        type: number
   *      challengeId:
   *        type: number
   * 
   *  Donation:
   *    type: object
   *    required:
   *      - receiverId
   *      - donateOp
   *    properties:
   *      receiverId: 
   *        type: string
   *      donateOp:
   *        $ref: '#/definitions/TransactionObject'
   */

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
       * @swagger
       *
       * /transactions:
       *  get:
       *    description: Get user transactions
       *    produces:
       *      - application/json
       *    tags:
       *      - Transactions
       *    parameters:
       *      - name: limit
       *        description: Limit of rows
       *        in: query
       *        required: true
       *        type: integer
       *      - name: skip
       *        description: Number of rows to skip
       *        in: query
       *        required: false
       *        type: integer
       *    responses:
       *      200:
       *        description: getUsersWithStatus response
       *        schema:
       *          $ref: '#/definitions/TransactionResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       */
      [
        'get', '/api/v1/transactions',
        this.authValidator.loggedOnly,
        this.transactionValidator.getTransactions,
        this.getTransactions.bind(this)
      ],
      /**
       * @swagger
       *
       * /donate:
       *  post:
       *    description: Create a Donate Transaction
       *    produces:
       *      - application/json
       *    tags:
       *      - Transactions
       *    parameters:
       *      - name: donate
       *        description: donate transaction created in frontend and the receiverId
       *        in: body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/Donation'
       *    responses:
       *      200:
       *        description: Payment response
       *        schema:
       *          $ref: '#/definitions/PaymentResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
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
