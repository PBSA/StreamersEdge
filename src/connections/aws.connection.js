const AWS = require('aws-sdk');


class AwsConnection {

  constructor(opts) {
    this.config = opts.config;
  }

  connect() {
    this.s3 = new AWS.S3();
  }

  disconnect() {}

}

module.exports = AwsConnection;
