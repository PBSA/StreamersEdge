const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const randomString = require('randomstring');

class FileService {

  /**
   * @param {AppConfig} config
   * @param {AwsConnection} awsConnection
   */
  constructor({config, awsConnection}) {
    this.awsConnection = awsConnection;
    this.config = config;

    this.IMAGE_FORMATS = ['jpeg', 'png', 'gif'];
    this.VIDEO_FORMATS = ['avi', 'mp4'];

    this.errors = {
      INVALID_FILE_FORMAT: 'Invalid file format'
    };
  }

  /**
   *
   * @param {Object} req
   * @param {Object} res
   * @return Promise<>
   */
  async saveImage(req, res) {
    return this.saveFile(req, res, this.IMAGE_FORMATS);
  }

  /**
   *
   * @param {Object} req
   * @param {Object} res
   * @return Promise<>
   */
  async saveVideo(req, res) {
    return this.saveFile(req, res, this.VIDEO_FORMATS);
  }

  async saveFile(req, res, formats) {
    const upload = multer({
      storage: multerS3({
        s3: this.awsConnection.s3,
        bucket: this.config.s3.bucket,
        key: this._filename
      }),
      fileFilter: (req, file, done) => {
        const mimeMatch = file.mimetype.match(new RegExp(`(${formats.join('|')})$`));

        if (!mimeMatch) {
          done(new Error(this.errors.INVALID_FILE_FORMAT));
        }

        done(null, mimeMatch);
      }
    }).single('file');

    await new Promise((success, fail) => {
      upload(req, res, (err, res) => err ? fail(err) : success(res));
    });
    return req.file.location;

  }

  /**
   *
   * @param {Object} req
   * @param {Object} file
   * @param {Function} done
   * @private
   */
  _filename(req, file, done) {
    const ext = path.extname(file.originalname);
    const name = `${randomString.generate(10)}-${randomString.generate(13)}-${randomString.generate(8)}${ext}`;
    done(null, name);
  }

}

module.exports = FileService;
