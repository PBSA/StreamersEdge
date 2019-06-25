const pify = require('pify');
const multer = require('multer');
const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const randomString = require('randomstring');
const Jimp = require('jimp');
const mkdirp = require('mkdirp');

class FileService {

  /**
   * @param {AppConfig} config
   * @param {S3Repository} s3Repository
   */
  constructor({config, s3Repository}) {
    this.s3Repository = s3Repository;
    this.basePath = `${config.basePath}/public`;
    this.config = config;

    this.IMAGE_FORMATS = ['jpeg', 'png', 'gif'];

    this.IMAGES_SIZE = {
      x: 100,
      y: 100
    };

    this.storage = multer.diskStorage({
      destination: this._destination.bind(this),
      filename: this._filename.bind(this)
    });

    this.errors = {
      INVALID_IMAGE_FORMAT: 'Invalid image format',
      NOT_FOUND: 'File not found'
    };
  }

  /**
   * Get image by filename and key
   * @param {String} filename
   * @param {String} key
   * @returns {string}
   */
  getImage(filename, key) {
    return `${this.config.backendUrl}/api/images/`
      + `${key}/${this.IMAGES_SIZE.x}x${this.IMAGES_SIZE.y}/${filename}`;
  }

  /**
   * Cuts an image on a key of the specified sizes
   * @param {String} filename
   * @param {String} key
   * @returns {*}
   */
  async sliceImageSize(filename, key) {
    const dirPath = `${this.basePath}/images/${key}/${this.IMAGES_SIZE.x}x${this.IMAGES_SIZE.y}`;
    await this.checkPath(dirPath);
    const image = await Jimp.read(`${this.basePath}/images/${key}/original/${filename}`);
    const {w, h} = this.getImageSize(image);

    image.resize(w, h)
      .crop(
        (image.bitmap.width / 2) - (this.IMAGES_SIZE.x / 2),
        (image.bitmap.height / 2) - (this.IMAGES_SIZE.y / 2),
        this.IMAGES_SIZE.x,
        this.IMAGES_SIZE.y,
      ).write(path.join(dirPath, filename));
  }

  getImageSize(image) {
    let w = this.IMAGES_SIZE.x;
    let h = this.IMAGES_SIZE.y;

    if (w === h) {
      if (image.bitmap.width >= image.bitmap.height) {
        w = Jimp.AUTO;
      } else {
        h = Jimp.AUTO;
      }
    } else {
      w = w > h ? w : Jimp.AUTO;
      h = h > w ? h : Jimp.AUTO;
    }

    return {w, h};
  }

  /**
   *
   * @param {Object} req
   * @param {String} key
   * @return {*}
   */
  async saveImage(req, key = 'avatar') {
    const upload = pify(multer({
      storage: this.storage,
      fileFilter: this._imageFilter.bind(this)
    }).single('file'));
    await upload(req, null);
    const {file} = req;

    if (!file) {
      throw new Error(this.errors.NOT_FOUND);
    }

    await this.sliceImageSize(file.filename, key);
    const url = await this.deployToS3(file.filename, key);
    await this.deleteImage(file.filename, key);
    return url;
  }

  checkPath(pathFile) {
    return new Promise((resolve, reject) => {
      if (fse.existsSync(pathFile)) {
        resolve(pathFile);
        return;
      }

      mkdirp(pathFile, (err) => {

        if (err) {
          reject(err);
        }

        resolve(pathFile);
      });
    });

  }

  async deleteImage(filename, key) {
    const pathFile = `${this.basePath}/images/${key}`;
    await fse.remove(`${pathFile}/original/${filename}`);
    await fse.remove(`${pathFile}/${this.IMAGES_SIZE.x}x${this.IMAGES_SIZE.y}/${filename}`);
  }

  async deployToS3(filename, key) {
    const pathFile = `${this.basePath}/images/${key}`;
    const originalFile = await new Promise((success, fail) => {
      fs.readFile(`${pathFile}/original/${filename}`, (err, file) => err ? fail(err) : success(file));
    });
    await this.s3Repository.deployFile(originalFile, `${key}/original/${filename}`);
    const finishFile = await new Promise((success, fail) => {
      fs.readFile(`${pathFile}/${this.IMAGES_SIZE.x}x${this.IMAGES_SIZE.y}/${filename}`, (err, file) => err ? fail(err) : success(file));
    });
    return await this.s3Repository.deployFile(finishFile, `${key}/${this.IMAGES_SIZE.x}x${this.IMAGES_SIZE.y}/${filename}`);
  }

  _destination(req, file, done) {
    const pathFile = `${this.basePath}/images/avatar/original`;
    this.checkPath(pathFile)
      .then((dest) => done(null, dest))
      .catch((error) => done(error));
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
