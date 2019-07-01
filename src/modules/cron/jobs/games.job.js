const challengeConstants = require('../../../constants/challenge');
const moment = require('moment');

class GamesJob {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {PubgApiRepository} opts.pubgApiRepository
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {PubgService} opts.pubgService
   * @param {DbConnection} opts.dbConnection
   */
  constructor(opts) {
    this.userRepository = opts.userRepository;
    this.pubgApiRepository = opts.pubgApiRepository;
    this.challengeRepository = opts.challengeRepository;
    this.pubgService = opts.pubgService;
    this.dbConnection = opts.dbConnection;
  }

  /**
   * Pull Games pubg for all users who have added their pubg account into profile
   * @returns {Promise<void>}
   */
  async runJob() {
    const Users = await this.userRepository.findWithGames();

    for (let i = 0; i < Users.length; i++) {
      await this.processUserPubg(Users[i]);
    }

    await this.resolveChallenges();
  }

  async processUserPubg(User) {
    const ids = await this.pubgApiRepository.getMatcheIds(User.pubgUsername);
    let matchesIds = ids.map(({id}) => id);

    for (let i = 0; i < matchesIds.length; i++) {
      await this.pubgService.addGame(matchesIds[i]);
    }
  }

  async resolveChallenges() {
    const Challenges = await this.challengeRepository.findWaitToResolve();

    for (let i = 0; i < Challenges.length; i++) {

      switch (Challenges[i].game) {
        case 'pubg':
          await this.resolvePUBGChallenge(Challenges[i]);
          break;
        default:

      }
    }
  }

  async resolvePUBGChallenge(Challenge) {
    const result = (await this.dbConnection.sequelize.query(this.prepareQuery(Challenge), {
      bind: [Challenge.id]
    }))[0];

    if (result.length) {
      Challenge.winnerUserId = result[0].userId;
    }

    Challenge.status = challengeConstants.status.resolved;

    await Challenge.save();
  }

  prepareQuery(Challenge) {
    const conditions = Challenge.toJSON()['challenge-conditions'].sort((a, b) => a.id - b.id);

    const startDate = moment(Challenge.startDate || Challenge.createdAt).format();
    const endDate = moment(Challenge.endDate).format();

    let whereString = `pubg."createdAt" between '${startDate}' and '${endDate}' AND (`;

    conditions.forEach((condition) => {
      let key;

      switch (condition.param) {

        case challengeConstants.paramTypes.winTime:
          key = 'pubg.duration';
          break;
        case challengeConstants.paramTypes.frags:
          key = 'participants.kill';
          break;

        case challengeConstants.paramTypes.resultPlace:
          key = 'participants.rank';
          break;
        default:

      }

      whereString += `(${key} ${condition.operator} ${condition.value})`;

      if (condition.join !== 'END') {
        whereString += ` ${condition.join} `;
      }
    });

    whereString += ') AND users.id IS NOT NULL';

    return `SELECT
        users.id as "userId", 
        pubg.id as "pubgId",
        pubg."createdAt" as "createdAt"
      FROM "pubgs" as pubg 
      LEFT JOIN "pubg-participants" as participants ON pubg.id = "participants"."pubgId" 
      LEFT JOIN "joined-users" AS joined ON joined."challengeId" = $1
      LEFT JOIN "users" ON users."pubgUsername" = "participants"."name" AND users.id = joined."userId"
      WHERE ${whereString}
      ORDER BY pubg."createdAt"
      LIMIT 1`;
  }
}

module.exports = GamesJob;
