const challengeConstants = require('../../../constants/challenge');
const moment = require('moment');
const eachLimit = require('async/eachLimit');

class GamesJob {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {PubgApiRepository} opts.pubgApiRepository
   * @param {LeagueOfLegendsApiRepository} opts.leagueOfLegendsApiRepository
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {JoinedUsersRepository} opts.joinedUsersRepository
   * @param {StreamRepository} opts.streamRepository
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
    this.streamRepository = opts.streamRepository;
    this.challengeWinnersRepository = opts.challengeWinnersRepository;
    this.pubgService = opts.pubgService;
    this.leagueOfLegendsService = opts.leagueOfLegendsService;
    this.dbConnection = opts.dbConnection;
    this.webPushConnection = opts.webPushConnection;

    this.resolveChallenge = this.resolveChallenge.bind(this);
    this.getPubgMatchesForUser = this.getPubgMatchesForUser.bind(this);

    this.asyncLimit = 8;
  }

  async runJob() {
    // update list of twitch streams
    await this.streamRepository.populateTwitchStreams();
    
    // get all unresolved challenges
    let challenges = await this.challengeRepository.findWaitToResolve();

    for (const challenge of challenges) {
      const stream = await this.streamRepository.getStreamForUser(challenge.userId);

      if (!stream || !stream.isLive) {
        if (moment(challenge.timeToStart).add(5, 'minutes').diff(moment()) < 0) {
          await this.challengeRepository.refundChallenge(challenge);
        }

        continue;
      }

      challenge.status = challengeConstants.status.live;
      challenge.streamLink = stream.embedUrl;
      await challenge.save();
    }

    // get all live challenges
    challenges = await this.challengeRepository.findLive();

    for (const challenge of challenges) {
      const stream = await this.streamRepository.getStreamForUser(challenge.userId);

      if ((!stream || !stream.isLive) && moment(challenge.timeToStart).add(1, 'hour').diff(moment()) < 0) {
        await this.challengeRepository.refundChallenge(challenge);
        continue;
      }

      const user = await this.userRepository.model.findOne({
        where: {
          id: challenge.userId
        },
        attributes: ['id', 'pubgUsername', 'leagueOfLegendsRealm', 'leagueOfLegendsAccountId']
      });

      if (!user) {
        console.error(`failed to find user ${challenge.userId} for challenge ${challenge.id}`);
        continue;
      }

      // query the game apis for any new matches for this user
      await this.updateMatchesForUser(user, challenge.game);

      // try to resolve the challenge
      await this.resolveChallenge(challenge, stream);
    }
  }

  async updateMatchesForUser(user, game) {
    if (game === 'pubg') {
      const matchIds = (await this.getPubgMatchesForUser(user.pubgUsername))
        .map(({id}) => id);
      await eachLimit(matchIds, this.asyncLimit, (id, cb) => this.pubgService.addGame(id).then(cb));
    } else if (game === 'leagueOfLegends') {
      const realm = user.leagueOfLegendsRealm;
      const matchIds = (await this.this.leagueOfLegendsApiRepository.getMatchesForAccount(realm, user.leagueOfLegendsAccountId))
        .map(({id}) => id);
      await eachLimit(matchIds, this.asyncLimit, (id, cb) => this.leagueOfLegendsService.addGame(realm, id).then(cb));
    }
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

  async resolveChallenge(challenge, stream) {
    const isWon = await this.checkChallengeConditions(challenge, stream);

    if (!isWon) {
      return;
    }

    await this.addAndNotifyWinner(challenge.userId, challenge);
    challenge.status = challengeConstants.status.resolved;
    await challenge.save();
  }

  async checkChallengeConditions(challenge, stream) {
    const conditions = challenge.toJSON()['challenge-conditions'].sort((a, b) => a.id - b.id);
    let timeToStart = moment(challenge.timeToStart);
    const streamStart = moment(stream.startTime);

    if (timeToStart.diff(streamStart) < 0) {
      timeToStart = streamStart;
    }

    let query;
    
    switch (challenge.game) {
      case 'pubg':
        query = this.createPubgQuery(challenge.userId, conditions, timeToStart);
        break;
      case 'leagueOfLegends':
        query = this.createLeagueOfLegendsQuery(challenge.userId, conditions, timeToStart);
        break;
      default:
        throw new Error('unsupported game');
    }

    const [winner] = (await this.dbConnection.sequelize.query(query));
    
    return winner.length !== 0;
  }

  createConditionsQuery(conditions, mapping) {
    return conditions.reduce((query, condition) => {
      let _query = query;
      _query += `(${mapping[condition.param]} ${condition.operator} ${condition.value})`;
      _query += condition.join !== 'END' ? ` ${condition.join} ` : '';
      return _query;
    }, '');
  }

  createLeagueOfLegendsQuery(userId, conditions, timeToStart) {
    let whereString = `match."createdAt" > '${timeToStart.format()}' AND (`;

    whereString += this.createConditionsQuery(conditions, {
      [challengeConstants.paramTypes.winTime]: 'match."gameDuration"',
      [challengeConstants.paramTypes.frags]: 'participants.kills',
      [challengeConstants.paramTypes.resultPlace]: 'participants."isWin"::int'
    });

    whereString += ') AND users.id IS NOT NULL';

    return `SELECT
        match.id as "matchId",
        match."createdAt" as "createdAt"
      FROM "leagueoflegends-matches" as match
      LEFT JOIN "leagueoflegends-participants" as participants ON match.id = participants."leagueOfLegendsMatchId" 
      LEFT JOIN "users" ON users."leagueOfLegendsAccountId" = "participants"."accountId" AND users.id = '${userId}'
      WHERE ${whereString}
      ORDER BY match."createdAt"
      LIMIT 1`;
  }

  createPubgQuery(userId, conditions, timeToStart) {
    let whereString = `pubg."createdAt" > '${timeToStart.format()}' AND (`;

    whereString += this.createConditionsQuery(conditions, {
      [challengeConstants.paramTypes.winTime]: 'pubg.duration',
      [challengeConstants.paramTypes.frags]: 'participants.kill',
      [challengeConstants.paramTypes.resultPlace]: 'participants.rank'
    });

    whereString += ') AND users.id IS NOT NULL';

    return `SELECT
        DISTINCT users.id as "userId", 
        pubg.id as "pubgId",
        pubg."createdAt" as "createdAt"
      FROM "pubgs" as pubg 
      LEFT JOIN "pubg-participants" as participants ON pubg.id = "participants"."pubgId" 
      LEFT JOIN "users" ON users."pubgUsername" = "participants"."name" AND users.id = '${userId}'
      WHERE ${whereString}
      ORDER BY pubg."createdAt"
      LIMIT 1`;
  }

  async addAndNotifyWinner(userId, challenge) {
    await this.challengeWinnersRepository.addWinner(userId, challenge.id);

    const user = await this.userRepository.findByPk(userId);
    const notification = {title: 'You have won a challenge.'};

    if (user.challengeSubscribeData && user.notifications) {
      try {
        return await this.webPushConnection.sendNotification(user.challengeSubscribeData, notification);
      // eslint-disable-next-line no-empty
      } catch (err) {} // ignore any errors
    }
  }
}

module.exports = GamesJob;
