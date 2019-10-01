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

    this.processUserPubg = this.processUserPubg.bind(this);
    this.resolvePubgChallenge = this.resolvePubgChallenge.bind(this);
  }

  /**
   * Pull Games pubg for all users who have added their pubg account into profile
   * @returns {Promise<void>}
   */
  async runJob() {
    const users = await this.userRepository.findWithGames();
    await Promise.all(users.map(this.processPubgUser));

    await this.resolveChallenges();
  }

  async processPubgUser(User) {
    const matchIds = await this.pubgApiRepository.getMatchIds(User.pubgUsername);
    await Promise.all(matchIds.map(({id}) => this.pubgService.addGame(id)));
  }

  async resolveChallenges() {
    const challenges = await this.challengeRepository.findWaitToResolve();
    
    const pubgChallenges = challenges.filter(challenge => challenge.game === 'pubg');
    await Promise.all(pubgChallenges.map(this.resolvePubgChallenge));
  }

  async resolvePubgChallenge(Challenge) {
    Challenge.winnerUserId = await this.determinePubgWinner(Challenge);
    Challenge.status = challengeConstants.status.resolved;
    await Challenge.save();
  }

  async determinePubgWinner(Challenge) {
    const userId = null;

    

    return userId;
  }

  async prepareWhereString(Challenge){
    const conditions = Challenge.toJSON()['challenge-conditions'].sort((a, b) => a.id - b.id);
    const startDate = moment(Challenge.startDate || Challenge.createdAt).format();
    const endDate = moment(Challenge.endDate).format();
    let whereString = `pubg."createdAt" between '${startDate}' and '${endDate}' AND (`;

    conditions.forEach((condition) => {
      let key;

      switch (condition.param) {
        case challengeConstants.paramTypes.winTime:
          key = 'pubg.duration'; break;
        case challengeConstants.paramTypes.frags:
          key = 'participants.kill'; break;
        case challengeConstants.paramTypes.resultPlace:
          key = 'participants.rank'; break;
        default:
      }

      whereString += `(${key} ${condition.operator} ${condition.value})`;

      if (condition.join !== 'END') {
        whereString += ` ${condition.join} `;
      }
    });

    whereString += ') AND users.id IS NOT NULL';
    return whereString;
  }

  async prepareQuery(Challenge) {
    const whereString = await this.prepareWhereString(Challenge);

    return `SELECT
        users.id as "userId", 
        pubg.id as "pubgId",
        pubg."createdAt" as "createdAt"
      FROM "pubgs" as pubg 
      LEFT JOIN "pubg-participants" as participants ON pubg.id = "participants"."pubgId" 
      LEFT JOIN "challenge-invited-users" AS challengeInvitedUsers ON challengeInvitedUsers."challengeId" = $1
      LEFT JOIN "users" ON users."pubgUsername" = "participants"."name" AND users.id = challenge-invited-users."userId"
      WHERE ${whereString}
      ORDER BY pubg."createdAt"
      LIMIT 1`;
  }
}

module.exports = GamesJob;

