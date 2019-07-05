const {CronJob} = require('cron');

class CronModule {

  /**
   * @param {GamesJob} gamesJob
   */
  constructor({gamesJob}) {
    this.gamesJob = gamesJob;
  }

  async initModule() {
    new CronJob('0 0 * * * *', () => this.gamesJob.runJob(), null, true, 'America/Los_Angeles');
    this.gamesJob.runJob();
  }
}

module.exports = CronModule;
