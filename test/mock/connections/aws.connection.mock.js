const events = require('events');
const concat = require('concat-stream');

const {S3UploadLocation} = require('../../constants.json');

class AwsConnectionMock {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.config = opts.config;

    this.s3 = {
      upload: (opts) => {
        const ee = new events.EventEmitter();

        ee.send = (cb) => {
          opts['Body'].pipe(concat((body) => {
            ee.emit('httpUploadProgress', {total: body.length});
            cb(null, {
              'Location': S3UploadLocation,
              'ETag': 'mock-etag'
            });
          }));
        };

        return ee;
      }
    };

  }

  connect() {}

  disconnect() {}

}

module.exports = AwsConnectionMock;
