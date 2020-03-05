const challengeConstants = require('../constants/challenge');
const txConstants = require('../constants/transaction');
const moment = require('moment');
const eachLimit = require('async/eachLimit');

class JobsService {

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
   * @param {PaymentService} opts.paymentService
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {TransactionRepository} opts.transactionRepository
   * @param {Config} opts.config
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
    this.paymentService = opts.paymentService;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.transactionRepository = opts.transactionRepository;
    this.mailService = opts.mailService;
    this.config = opts.config;

    this.asyncLimit = 8;

    this.resolveChallenge = this.resolveChallenge.bind(this);
    this.getPubgMatchesForUser = this.getPubgMatchesForUser.bind(this);
    this.processChallenge = this.processChallenge.bind(this);
  }

  async runGamesJob() {
    // update list of twitch streams
    try{
      await this.streamRepository.populateTwitchStreams();
    }catch(e) {
      console.error(e);
    }
    
    // get all unresolved challenges
    let challenges = await this.challengeRepository.findWaitToResolve();

    for (const challenge of challenges) {
      const stream = await this.streamRepository.getStreamForUser(challenge.userId);

      if (!stream || !stream.isLive) {
        if (moment(challenge.timeToStart).add(5, 'minutes').diff(moment()) < 0) {
          try{
            await this.challengeRepository.refundChallenge(challenge);
          }catch(e) {
            console.error(e);
          }
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

      if ((!stream || !stream.isLive)) {
        if(moment(challenge.timeToStart).add(1, 'hour').diff(moment()) < 0) {
          try{
            await this.challengeRepository.refundChallenge(challenge);
          }catch(e) {
            console.error(e);
          }
          
          continue;
        }
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
      console.error(err);

      if (err.status && err.status === 404) {
        return [];
      }

      return [];
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
        await this.webPushConnection.sendNotification(user.challengeSubscribeData, notification);

        return await this.mailService.sendWinnerMail(user.username, user.email, challenge.id, challenge.name);
      // eslint-disable-next-line no-empty
      } catch (err) {} // ignore any errors
    }
  }

  async runPaymentsJob() {
    const challenges = await this.challengeRepository.model.findAll({
      where: {
        status: challengeConstants.status.resolved
      }
    });

    await Promise.all(challenges.map(this.processChallenge));
  }

  async processChallenge(challenge) {
    const winners = await this.challengeWinnersRepository.getForChallenge(challenge.id);

    if (winners.length !== 0) {
      await this.payToWinners(challenge, winners[0]);
    } else {
      await this.challengeRepository.refundChallenge(challenge);
    }
  }

  async payToWinners(challenge, winner) {
    const user = await this.userRepository.findByPk(winner.userId);
    
    const joined = await this.joinedUsersRepository.model.findAll({
      where: {challengeId: challenge.id}
    });

    const totalReward = joined.reduce((acc, {ppyAmount}) => acc + ppyAmount, 0.0);

    if(totalReward > 0) {
      await this.sendPPY('challengeReward', challenge, user, totalReward);
    }

    challenge.status = challengeConstants.status.paid;
    await challenge.save();
  }

  async sendPPY(txType, challenge, user, ppyAmount) {
    const tx = await this.peerplaysRepository.sendPPYFromReceiverAccount(user.peerplaysAccountId, ppyAmount);

    await this.transactionRepository.create({
      txId: tx.id,
      blockNum: tx.block_num,
      trxNum: tx.trx_num,
      ppyAmountValue: ppyAmount,
      type: txConstants.types[txType],
      userId: user.id,
      challengeId: challenge.id,
      peerplaysFromId: this.config.peerplays.paymentReceiver,
      peerplaysToId: user.peerplaysAccountId
    });
  }

  async runPayoutsJob() {
    await this.paymentService.processPendingRedemptions();
  }
}

module.exports = JobsService;
