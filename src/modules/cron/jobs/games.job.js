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
   * @param {LeagueOfLegendsApiRepository} opts.leagueOfLegendsApiRepository
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {JoinedUsersRepository} opts.joinedUsersRepository
   * @param {ChallengeWinnersRepository} opts.challengeWinnersRepository
   * @param {PubgService} opts.pubgService
   * @param {LeagueOfLegendsService} opts.leagueOfLegendsService
   * @param {DbConnection} opts.dbConnection
   * @param {WebPushConnection} opts.webPushConnection
   */
  constructor(opts) {
    this.userRepository = opts.userRepository;
    this.pubgApiRepository = opts.pubgApiRepository;
    this.leagueOfLegendsApiRepository = opts.leagueOfLegendsApiRepository;
    this.challengeRepository = opts.challengeRepository;
    this.joinedUsersRepository = opts.joinedUsersRepository;
    this.challengeWinnersRepository = opts.challengeWinnersRepository;
    this.pubgService = opts.pubgService;
    this.leagueOfLegendsService = opts.leagueOfLegendsService;
    this.dbConnection = opts.dbConnection;
    this.webPushConnection = opts.webPushConnection;

    this.resolveChallenge = this.resolveChallenge.bind(this);
    this.getLeagueOfLegendsMatchesForUser = this.getLeagueOfLegendsMatchesForUser.bind(this);
    this.getPubgMatchesForUser = this.getPubgMatchesForUser.bind(this);

    this.asyncLimit = 8;
  }

  async runJob() {
    // get all unresolved challenges
    let challenges = await this.challengeRepository.findWaitToResolve();

    // resolve pubg challenges
    await this.resolvePubgChallenges(challenges.filter(({game}) => game === 'pubg'));
    
    // resolve league of legends challenges
    await this.resolveLeagueOfLegendsChallenges(challenges.filter(({game}) => game === 'leagueOfLegends'));
  }

  async getLeagueOfLegendsMatchesForUser(realm, accountId) {
    return await this.leagueOfLegendsApiRepository.getMatchesForAccount(realm, accountId);
  }

  async resolveLeagueOfLegendsChallenges(challenges) {
    let users = flatten(await Promise.all(challenges.map(({id}) => this.joinedUsersRepository.getForChallenge(id))));

    const usersByRealm = users.reduce((realms, {user: {leagueOfLegendsRealm, leagueOfLegendsAccountId}}) => {
      if (!leagueOfLegendsAccountId || !leagueOfLegendsRealm) {
        return realms;
      }

      if (!realms[leagueOfLegendsRealm]) {
        realms[leagueOfLegendsRealm] = [];
      }

      realms[leagueOfLegendsRealm].push(leagueOfLegendsAccountId);
      return realms;
    }, {});
  
    for (const realm of Object.keys(usersByRealm)) {
      const accountIds = [...new Set(usersByRealm[realm])];

      const matches = flatten(await Promise.all(accountIds.map((accountId) => this.getLeagueOfLegendsMatchesForUser(realm, accountId))));

      try {
        await eachLimit(matches, this.asyncLimit, ({gameId}, cb) => this.leagueOfLegendsService.addGame(realm, gameId).then(cb));
      } catch (err) {
        console.error(err);
      }
    }

    await Promise.all(challenges.map(this.resolveChallenge));
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
    await Promise.all(challenges.map(this.resolveChallenge));
  }

  async resolveChallenge(challenge) {
    const winners = await this.determineWinners(challenge);

    if ((!challenge.endDate || challenge.endDate > new Date()) && winners.length === 0) {
      return;
    }

    challenge.status = challengeConstants.status.resolved;
    await challenge.save();

    await Promise.all(winners.map(({userId}) => this.addAndNotifyWinner(userId, challenge)));
  }

  async determineWinners(challenge) {
    const conditions = challenge.toJSON()['challenge-conditions'].sort((a, b) => a.id - b.id);
    const startDate = moment(challenge.startDate || challenge.createdAt).format();
    const endDate = moment(challenge.endDate || new Date()).format();

    let query;
    
    switch (challenge.game) {
      case 'pubg':
        query = this.createPubgQuery(conditions, startDate, endDate);
        break;
      case 'leagueOfLegends':
        query = this.createLeagueOfLegendsQuery(conditions, startDate, endDate);
        break;
      default:
        throw new Error('unsupported game');
    }

    const [winners] = (await this.dbConnection.sequelize.query(query, {
      bind: [challenge.id]
    }));

    return winners;
  }

  createConditionsQuery(conditions, mapping) {
    return conditions.reduce((query, condition) => {
      let _query = query;
      _query += `(${mapping[condition.param]} ${condition.operator} ${condition.value})`;
      _query += condition.join !== 'END' ? ` ${condition.join} ` : '';
      return _query;
    }, '');
  }

  createLeagueOfLegendsQuery(conditions, startDate, endDate) {
    let whereString = `match."createdAt" between '${startDate}' and '${endDate}' AND (`;

    whereString += this.createConditionsQuery(conditions, {
      [challengeConstants.paramTypes.winTime]: 'match."gameDuration"',
      [challengeConstants.paramTypes.frags]: 'participants.kills',
      [challengeConstants.paramTypes.resultPlace]: 'participants."isWin"::int'
    });

    whereString += ') AND users.id IS NOT NULL AND users."peerplaysAccountId" IS NOT NULL';

    return `SELECT
        DISTINCT users.id as "userId",
        match.id as "matchId",
        match."createdAt" as "createdAt"
      FROM "leagueoflegends-matches" as match
      LEFT JOIN "leagueoflegends-participants" as participants ON match.id = participants."leagueOfLegendsMatchId" 
      LEFT JOIN "joined-users" AS joinedUsers ON joinedUsers."challengeId" = $1
      LEFT JOIN "users" ON users."leagueOfLegendsAccountId" = "participants"."accountId" AND users.id = joinedUsers."userId"
      WHERE ${whereString}
      ORDER BY match."createdAt"`;
  }

  createPubgQuery(conditions, startDate, endDate) {
    let whereString = `pubg."createdAt" between '${startDate}' and '${endDate}' AND (`;

    whereString += this.createConditionsQuery(conditions, {
      [challengeConstants.paramTypes.winTime]: 'pubg.duration',
      [challengeConstants.paramTypes.frags]: 'participants.kill',
      [challengeConstants.paramTypes.resultPlace]: 'participants.rank'
    });

    whereString += ') AND users.id IS NOT NULL AND users."peerplaysAccountId" IS NOT NULL';

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

  async addAndNotifyWinner(userId, challenge) {
    await this.challengeWinnersRepository.addWinner(userId, challenge.id);

    const user = await this.userRepository.findByPk(userId);
    const notification = {title: 'You have won a challenge.'};

    if (user.challengeSubscribeData) {
      try {
        return await this.webPushConnection.sendNotification(user.challengeSubscribeData, notification);
      // eslint-disable-next-line no-empty
      } catch (err) {} // ignore any errors
    }
  }
}

module.exports = GamesJob;
