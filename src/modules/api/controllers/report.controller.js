const RestError = require('../../../errors/rest.error');

/**
 * @swagger
 *
 * definitions:
 *  ReportVideoResponse:
 *    type: object
 *    required:
 *      - video
 *    properties:
 *      status:
 *        type: number
 *        example: 200
 *      result:
 *        type: string
 *        example: /profile_images/UsmhsMzlzx-HwFX6wsQiLrjN-RZqP0WNz.mp4
 *
 *  ReportUser:
 *    type: object
 *    required:
 *      - reportedUserId
 *      - reason
 *      - description
 *    properties:
 *      reportedUserId:
 *        type: number
 *      reason:
 *        type: string
 *      description:
 *        type: string
 *      videoUrl:
 *        type: string
 *
 *  ReportUserResponse:
 *    type: object
 *    properties:
 *      status:
 *        type: number
 *        example: 200
 *      result:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *            example: 1
 *          reportedUserId:
 *            type: number
 *            example: 2
 *          reportedByUserId:
 *            type: number
 *            example: 1
 *          reason:
 *            type: string
 *            example: vulgarity-on-stream
 *          description:
 *            type: string
 *          videoUrl:
 *            type: string
 *            example: /profile_images/UsmhsMzlzx-HwFX6wsQiLrjN-RZqP0WNz.mp4
 *
 */

class ReportController {
  /**
   * @param {AuthValidator} opts.authValidator
   * @param {ProfileValidator} opts.profileValidator
   * @param {UserService} opts.userService
   * @param {FileService} opts.fileService
   * @param {ReportService} opts.reportService
   * @param {ReportValidator} opts.reportValidator
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.fileService = opts.fileService;
    this.reportService = opts.reportService;
    this.reportValidator = opts.reportValidator;
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
       * /report/video-proof:
       *  post:
       *    description: Report upload video
       *    summary: Report video
       *    produces:
       *      - application/json
       *    tags:
       *      - Report
       *    parameters:
       *      - in: formData
       *        name: file
       *        type: file
       *        description: The file to upload.
       *    consumes:
       *      - multipart/form-data
       *    responses:
       *      200:
       *        description: Report Video response
       *        schema:
       *         $ref: '#/definitions/ReportVideoResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'post', '/api/v1/report/video-proof',
        this.authValidator.loggedOnly,
        this.uploadReportVideo.bind(this)
      ],
      /**
       * @swagger
       *
       * /report:
       *  post:
       *   description: ReportUser
       *   summary: Report User
       *   produces:
       *     - application/json
       *   tags:
       *     - Report
       *   parameters:
       *      - name: report
       *        description: Report object
       *        in:  body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/ReportUser'
       *   responses:
       *      200:
       *        description: Report User response
       *        schema:
       *         $ref: '#/definitions/ReportUserResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'post', '/api/v1/report',
        this.authValidator.loggedOnly,
        this.reportValidator.createReportValidation,
        this.createReport.bind(this)
      ]
    ];
  }

  async createReport(user, {reportedUserId, reason, description, videoUrl}) {
    return this.reportService.createReport(reportedUserId, user.id, reason, description, videoUrl);
  }

  async uploadReportVideo(user, data, req) {
    try {
      return await this.fileService.saveVideo(req, 'report');
    } catch (e) {
      throw new RestError(e.message, 400);
    }
  }

}

module.exports = ReportController;
