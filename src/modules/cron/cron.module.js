const {CronJob} = require('cron');

class CronModule {

  /**
   * @param {GamesJob} gamesJob
   * @param {PaypalPayoutsJob} paypalPayoutsJob
   */
  constructor({gamesJob, paypalPayoutsJob}) {
    this.gamesJob = gamesJob;
    this.paypalPayoutsJob = paypalPayoutsJob;
  }

  async initModule() {
    new CronJob('0 0 * * * *', () => this.gamesJob.runJob(), null, true, 'America/Los_Angeles');
    new CronJob('0 0 * * * *', () => this.paypalPayoutsJob.runJob(), null, true, 'America/Los_Angeles');
    this.gamesJob.runJob();
    this.paypalPayoutsJob.runJob();
  }
}

module.exports = CronModule;
