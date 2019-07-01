class S3Repository {

  /**
   * @param {AwsConnection} opts.awsConnection
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.awsConnection = opts.awsConnection;
    this.config = opts.config;
  }

  async deployFile(file, key) {
    return new Promise((success, fail) => {
      this.awsConnection.s3.upload({
        Bucket: this.config.s3.bucket,
        Key: key,
        Body: file
      }, (err, data) => {

        if (err) {
          fail(err);
          return;
        }

        success(data.Location);
      });
    });
  }

}

module.exports = S3Repository;
