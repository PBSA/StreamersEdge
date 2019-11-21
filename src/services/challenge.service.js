const logger = require('log4js').getLogger('challenge.service');
const BigNumber = require('bignumber.js');
const challengeConstants = require('../constants/challenge');
const invitationConstants = require('../constants/invitation');
const {userType} = require('../constants/profile');
const RestError = require('../errors/rest.error');

class ChallengeService {

  /**
     * @param {AppConfig} opts.config
     * @param {ChallengeRepository} opts.challengeRepository
     * @param {ChallengeConditionRepository} opts.challengeConditionRepository
     * @param {ChallengeInvitedUsersRepository} opts.challengeInvitedUsersRepository
     * @param {UserRepository} opts.userRepository
     * @param {JoinedUsersRepository} opts.joinedUsersRepository
     * @param {WebPushConnection} opts.webPushConnection
     * @param {PeerplaysRepository} opts.peerplaysRepository
     * @param {PeerplaysConnection} opts.peerplaysConnection
     * @param {DbConnection} opts.dbConnection
     */
  constructor(opts) {
    this.config = opts.config;
    this.challengeRepository = opts.challengeRepository;
    this.challengeConditionRepository = opts.challengeConditionRepository;
    this.userRepository = opts.userRepository;
    this.challengeInvitedUsersRepository = opts.challengeInvitedUsersRepository;
    this.webPushConnection = opts.webPushConnection;
    this.dbConnection = opts.dbConnection;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.transactionRepository = opts.transactionRepository;
    this.peerplaysConnection = opts.peerplaysConnection;
    this.userService = opts.userService;
    this.errors = {
      DO_NOT_RECEIVE_INVITATIONS: 'THIS_IS_PRIVATE_CHALLENGE',
      CHALLENGE_NOT_FOUND: 'CLASSIC_GAME_NOT_FOUND',
      CHALLENGE_NOT_OPEN: 'CHALLENGE_NOT_OPEN',
      TRANSACTION_ERROR: 'TRANSACTION_ERROR',
      INVALID_TRANSACTION_SENDER: 'INVALID_TRANSACTION_SENDER',
      INVALID_TRANSACTION_RECEIVER: 'INVALID_TRANSACTION_RECEIVER',
      INVALID_TRANSACTION_AMOUNT: 'INVALID_TRANSACTION_AMOUNT',
      UNABLE_TO_INVITE: 'UNABLE_TO_INVITE',
      INVITED_USER_NOT_FOUND: 'INVITED_USER_NOT_FOUND'
    };
    this.joinedUsersRepository = opts.joinedUsersRepository;
  }

  /**
     *
     * @param creator
     * @param challengeObject
     * @returns {Promise<ChallengePublicObject>}
     */
  async createChallenge(creator, challengeObject) {

    if(creator.userType !== userType.gamer) {
      throw new RestError('User is not a streamer',400);
    }

    const Challenge = await this.challengeRepository.create({
      userId: creator.id,
      name: challengeObject.name,
      timeToStart: challengeObject.timeToStart,
      game: challengeObject.game,
      conditionsText: challengeObject.conditionsText
    });

    await Promise.all(challengeObject.conditions.map(async (criteria) => {
      return await this.challengeConditionRepository.create({
        ...criteria,
        challengeId: Challenge.id
      });
    }));

    return this.getCleanObject(Challenge.id);
  }

  /**
     * @param challengeId
     * @param userId
     * @returns {Promise<ChallengePublicObject>}
     */
  async getCleanObject(challengeId) {
    const Challenge = await this.challengeRepository.findByPk(challengeId, {
      include: [{
        model: this.userRepository.model,
        attributes: ['username','avatar']
      }, {
        model: this.challengeConditionRepository.model
      }]
    });

    if (!Challenge) {
      throw this.errors.CHALLENGE_NOT_FOUND;
    }

    return Challenge.getPublic();
  }


  async checkUserSubscribe(user, data) {
    user.challengeSubscribeData = data;
    user.save();
    return true;
  }

  /**
     * @param fromUser
     * @param toUserWithId
     * @param challengeId
     * @returns {Promise<Object>}
     */
  async sendInvite(fromUser, toUserWithId, challengeId) {

    const challenge = await this.challengeRepository.findByPk(challengeId);

    if (!challenge) {
      throw this.errors.CHALLENGE_NOT_FOUND;
    }

    const toUser = await this.userRepository.findByPk(toUserWithId);

    if(!toUser) {
      throw this.errors.INVITED_USER_NOT_FOUND;
    }

    const invitation = {title: `You invited to ${challenge.name}`};

    const isInvited = await this.challengeInvitedUsersRepository.isUserInvited(challengeId, toUserWithId);

    if (challenge.accessRule !== challengeConstants.accessRules.anyone && !isInvited) {
      throw this.errors.DO_NOT_RECEIVE_INVITATIONS;
    }

    switch (toUser.invitations) {
      case invitationConstants.invitationStatus.users: {
        const isAllowedForUser = await this.whitelistedUsersRepository.isWhitelistedFor(toUserWithId, fromUser.id);

        if (isAllowedForUser) {
          try{
            return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, invitation);
          } catch(err) {
            throw this.errors.UNABLE_TO_INVITE;
          }
        }
      }

        break;
      case invitationConstants.invitationStatus.games: {

        const isAllowedForGame = await this.whitelistedGamesRepository.isWhitelistedFor(toUserWithId, challenge.game);

        if (isAllowedForGame) {
          try{
            return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, invitation);
          } catch(err) {
            throw this.errors.UNABLE_TO_INVITE;
          }
        }
      }

        break;

      case invitationConstants.invitationStatus.all:
        try{
          return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, invitation);
        } catch(err) {
          throw this.errors.UNABLE_TO_INVITE;
        }

      default:
        return;
    }
  }

  async getAllChallenges(userId, fetchingParams) {
    return await this.challengeRepository.findAllChallenges(userId, fetchingParams);
  }

  async getWonChallenges(userId) {
    return await this.challengeRepository.findWonChallenges(userId);
  }

  async joinToChallenge(userId, challengeId, joinOp) {
    const user = await this.userRepository.findByPk(userId);
    const challenge = await this.challengeRepository.findByPk(challengeId);

    if (!challenge) {
      throw new Error(this.errors.CHALLENGE_NOT_FOUND);
    }

    if (challenge.status !== challengeConstants.status.open) {
      throw new Error(this.errors.CHALLENGE_NOT_OPEN);
    }

    if (challenge.accessRule === challengeConstants.accessRules.invite) {
      if (!await this.challengeInvitedUsersRepository.isAllowFor(challengeId, userId)) {
        throw new Error(this.errors.DO_NOT_RECEIVE_INVITATIONS);
      }
    }

    try {
      if (joinOp) {
        const operation = joinOp.operations[0][1];

        if (operation.to !== this.config.peerplays.feeReceiver) {
          throw new Error(this.errors.INVALID_TRANSACTION_RECEIVER);
        }

        if (user.peerplaysAccountId === '') {
          await this.userRepository.setPeerplaysAccountId(userId, operation.from);
        } else if (operation.from !== user.peerplaysAccountId) {
          throw new Error(this.errors.INVALID_TRANSACTION_SENDER);
        }

        if (!new BigNumber(operation.amount.amount).eq(this.config.challenge.joinFee)) {
          throw new Error(this.errors.INVALID_TRANSACTION_AMOUNT);
        }

        await this.peerplaysRepository.broadcastSerializedTx(joinOp);
      } else {
        await this.userService.signAndBroadcastTx(userId, this.config.peerplays.feeReceiver, this.config.challenge.joinFee);
      }
    }catch(ex) {
      logger.error(ex);

      if(ex.message.includes('insufficient')) {
        throw new RestError('Insufficient Balance', 400);
      }

      throw ex;
    }

    return await this.joinedUsersRepository.joinToChallenge(userId, challengeId);
  }

}

module.exports = ChallengeService;
