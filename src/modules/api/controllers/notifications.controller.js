/**
 * @swagger
 *
 * definitions:
 *  NotificationsSubscribe:
 *    type: object
 *    required:
 *      - endpoint
 *      - keys
 *    properties:
 *      endpoint:
 *        type: string
 *      expirationTime:
 *        type: number
 *      keys:
 *        type: object
 *        properties:
 *          p256dh:
 *            type: string
 *          auth:
 *            type: string
 *  NotificationsSubscribeResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            type: boolean
 */

class NotificationsController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {NotificationsValidator} opts.notificationsValidator
   * @param {ChallengeService} opts.challengeService
   * @param {WebPushConnection} opts.webPushConnection
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.notificationsValidator = opts.notificationsValidator;
    this.challengeService = opts.challengeService;
    this.webPushConnection = opts.webPushConnection;
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
       * /notifications/publicKey:
       *  get:
       *    description: Returns the application's VAPID key
       *    produces:
       *      - application/json
       *    tags:
       *      - Notifications
       *    responses:
       *      200:
       *        description: VAPID key
       *        schema:
       *          type: object
       *          properties:
       *            publicKey:
       *              type: string
       */
      [
        'get', '/api/v1/notifications/publicKey',
        this.getNotificationsKey.bind(this)
      ],
      /**
       * @swagger
       *
       * /notifications/subscribe:
       *  post:
       *    description: Sets the PushSubscription data for the current user
       *    produces:
       *      - application/json
       *    tags:
       *      - Notifications
       *    parameters:
       *      - name: NotificationsSubscribe
       *        in: body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/NotificationsSubscribe'
       *    responses:
       *      200:
       *        description: Subscribe response
       *        schema:
       *         $ref: '#/definitions/NotificationsSubscribeResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'post', '/api/v1/notifications/subscribe',
        this.authValidator.loggedOnly,
        this.notificationsValidator.subscribe,
        this.subscribe.bind(this)
      ]
    ];
  }

  async getNotificationsKey() {
    const publicKey = this.webPushConnection.getPublicKey();
    return {publicKey};
  }

  subscribe(user, data) {
    return this.challengeService.checkUserSubscribe(user, data);
  }

}

module.exports = NotificationsController;
