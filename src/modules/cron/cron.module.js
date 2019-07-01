const {CronJob} = require('cron');

class CronModule {

  /**
   * @param {GamesJob} gamesJob
   * @param {PaymentsJob} paymentsJob
   */
  constructor({gamesJob, paymentsJob}) {
    this.gamesJob = gamesJob;
    this.paymentsJob = paymentsJob;
  }

  async initModule() {
    new CronJob('0 0 * * * *', () => this.gamesJob.runJob(), null, true, 'America/Los_Angeles');
    new CronJob('0 30 * * * *', () => this.paymentsJob.runJob(), null, true, 'America/Los_Angeles');
    this.paymentsJob.runJob();
  }
}

module.exports = CronModule;
