const {CronJob} = require('cron');

class CronModule {

  /**
   * @param {GamesJob} gamesJob
   * @param {PaypalPayoutsJob} paypalPayoutsJob
   */
  constructor({gamesJob, paymentsJob, paypalPayoutsJob}) {
    this.gamesJob = gamesJob;
    this.paymentsJob = paymentsJob;
    this.paypalPayoutsJob = paypalPayoutsJob;
  }

  async initModule() {
    new CronJob('0 0 * * * *', () => this.gamesJob.runJob(), null, true, 'America/Los_Angeles');
    new CronJob('0 30 * * * *', () => this.paymentsJob.runJob(), null, true, 'America/Los_Angeles');
    new CronJob('0 0 * * * *', () => this.paypalPayoutsJob.runJob(), null, true, 'America/Los_Angeles');
    this.gamesJob.runJob();  
    this.paymentsJob.runJob();
    this.paypalPayoutsJob.runJob();
  }
}

module.exports = CronModule;
