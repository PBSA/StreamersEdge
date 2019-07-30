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

    this.IMAGE_FORMATS = ['jpeg', 'png'];
    this.FILE_SIZE_LIMIT = 1048576;

    this.errors = {
      INVALID_IMAGE_FORMAT: 'Invalid image format',
      FILE_NOT_FOUND: 'File not found',
      FILE_TOO_LARGE: 'File too large'
    };
  }

  /**
   *
   * @param {Object} req
   * @param {Object} res
   * @return Promise<>
   */
  async saveImage(req, res) {

    const upload = multer({
      storage: multerS3({
        s3: this.awsConnection.s3,
        bucket: this.config.s3.bucket,
        key: this._filename
      }),
      fileFilter: this._imageFilter.bind(this)
    }).single('file');

    await new Promise((success, fail) => {
      upload(req, res, (err, res) => err ? fail(err) : success(res));
    });

    if (!req.file) {
      throw new Error(this.errors.FILE_NOT_FOUND);
    }

    if (req.file.size > this.FILE_SIZE_LIMIT) {
      throw new Error(this.errors.FILE_TOO_LARGE);
    }

    return this.config.cdnUrl + new URL(req.file.location).pathname;
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

  /**
   *
   * @param {Object} req
   * @param {Object} file
   * @param {Function} done
   * @private
   */
  _imageFilter(req, file, done) {
    const mimeMatch = file.mimetype.match(new RegExp(`(${this.IMAGE_FORMATS.join('|')})$`));

    if (!mimeMatch) {
      done(new Error(this.errors.INVALID_IMAGE_FORMAT));
    }

    done(null, mimeMatch);
  }

}

module.exports = FileService;
