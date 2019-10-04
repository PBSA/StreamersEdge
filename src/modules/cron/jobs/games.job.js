const challengeConstants = require('../../../constants/challenge');
const moment = require('moment');
const eachLimit = require('async/eachLimit');

function flatten(array) {
  return [].concat.apply([], array);
}

class GamesJob {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {PubgApiRepository} opts.pubgApiRepository
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {JoinedUsersRepository} opts.joinedUsersRepository
   * @param {ChallengeWinnersRepository} opts.challengeWinnersRepository
   * @param {PubgService} opts.pubgService
   * @param {DbConnection} opts.dbConnection
   * @param {WebPushConnection} opts.webPushConnection
   */
  constructor(opts) {
    this.userRepository = opts.userRepository;
    this.pubgApiRepository = opts.pubgApiRepository;
    this.challengeRepository = opts.challengeRepository;
    this.joinedUsersRepository = opts.joinedUsersRepository;
    this.challengeWinnersRepository = opts.challengeWinnersRepository;
    this.pubgService = opts.pubgService;
    this.dbConnection = opts.dbConnection;
    this.webPushConnection = opts.webPushConnection;

    this.resolvePubgChallenge = this.resolvePubgChallenge.bind(this);
    this.getPubgMatchesForUser = this.getPubgMatchesForUser.bind(this);

    this.asyncLimit = 8;
  }

  /**
   * Pull Games pubg for all users who have added their pubg account into profile
   * @returns {Promise<void>}
   */
  async runJob() {
    // get all unresolved challenges
    let challenges = await this.challengeRepository.findWaitToResolve();

    // resolve pubg challenges
    await this.resolvePubgChallenges(challenges.filter(({game}) => game === 'pubg'));
  }

  async getPubgMatchesForUser(pubgUsername) {
    try {
      return await this.pubgApiRepository.getMatchesForUser(pubgUsername);
    } catch (err) {
      if (err.status && err.status === 404) {
        return [];
      }

      throw err;
    }
  }

  async resolvePubgChallenges(challenges) {
    // get all joined users
    let users = flatten(await Promise.all(challenges.map(({id}) => this.joinedUsersRepository.getForChallenge(id))));

    // filter out users without a pubg username and remove duplicates
    let pubgUsers = [...new Set(users.map(({pubgUsername}) => pubgUsername).filter((x) => x))];
    
    // get all pubg matches
    const matches = flatten(await Promise.all(pubgUsers.map(this.getPubgMatchesForUser)));

    // add the matches to the pubg service
    await eachLimit(matches, this.asyncLimit, ({id}, cb) => this.pubgService.addGame(id).then(cb));

    // resolve each challenge
    await Promise.all(challenges.map(this.resolvePubgChallenge));
  }

  async resolvePubgChallenge(challenge) {
    const query = this.prepareQuery(challenge);

    const [winners] = (await this.dbConnection.sequelize.query(query, {
      bind: [challenge.id]
    }));

    if ((!challenge.endDate || challenge.endDate > new Date()) && winners.length === 0) {
      return;
    }

    challenge.status = challengeConstants.status.resolved;
    await challenge.save();

    await Promise.all(winners.map(({userId}) => this.addAndNotifyWinner(userId, challenge)));
  }

  async addAndNotifyWinner(userId, challenge) {
    await this.challengeWinnersRepository.addWinner(userId, challenge.id);

    const user = await this.userRepository.findByPk(userId);
    const notification = {title: 'You have won a challenge.'};

    if (user.vapidKey) {
      try {
        return await this.webPushConnection.sendNotification(user.challengeSubscribeData, user.vapidKey, notification);
      // eslint-disable-next-line no-empty
      } catch (err) {} // ignore any errors
    }
  }

  prepareWhereString(challenge) {
    const conditions = challenge.toJSON()['challenge-conditions'].sort((a, b) => a.id - b.id);
    const startDate = moment(challenge.startDate || challenge.createdAt).format();
    const endDate = moment(challenge.endDate || new Date()).format();
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

    whereString += ') AND users.id IS NOT NULL AND users."peerplaysAccountId" IS NOT NULL';
    return whereString;
  }

  prepareQuery(challenge) {
    const whereString = this.prepareWhereString(challenge);

    return `SELECT
        DISTINCT users.id as "userId", 
        pubg.id as "pubgId",
        pubg."createdAt" as "createdAt"
      FROM "pubgs" as pubg 
      LEFT JOIN "pubg-participants" as participants ON pubg.id = "participants"."pubgId" 
      LEFT JOIN "joined-users" AS joinedUsers ON joinedUsers."challengeId" = $1
      LEFT JOIN "users" ON users."pubgUsername" = "participants"."name" AND users.id = joinedUsers."userId"
      WHERE ${whereString}
      ORDER BY pubg."createdAt"`;
  }
}

module.exports = GamesJob;
