const RestError = require('../../../errors/rest.error');
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
       * @api {post} /api/v1/report/video-proof Upload report video
       * @apiName ReportUploadVideo
       * @apiGroup Report
       * @apiVersion 0.1.0
       * @apiExample {form-data} Request-Example:
       * "file": ...file...
       * @apiUse AccountObjectResponse
       */
      [
        'post', '/api/v1/report/video-proof',
        this.authValidator.loggedOnly,    
        this.uploadReportVideo.bind(this)
      ],
      /**
       * @api {post} /api/v1/report Report user
       * @apiName ReportUser
       * @apiGroup Report
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       *   {
       *     "reportedUserId": 2,
       *     "reason": "vulgarity-on-stream",
       *     "description": "bad, very bad",
       *     "videoUrl": "url"
       *   }
       * 
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       *   {
       *   "result": {
       *       "id": 2,
       *       "reportedUserId": 2,
       *       "reportedByUserId": 1,
       *       "reason": "vulgarity-on-stream",
       *       "description": "bad, very bad",
       *       "videoUrl": "url",
       *       "updatedAt": "2019-07-01T14:16:05.933Z",
       *       "createdAt": "2019-07-01T14:16:05.933Z"
       *     },
       *     "status": 200
       *   }
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
