const Sequelize = require('sequelize');
const {Model} = Sequelize;
const profileConstants = require('../constants/profile');
const invitationConstants = require('../constants/invitation');

/**
 * @typedef {Object} UserPublicObject
 * @property {Number} id
 * @property {String} username
 * @property {String} email
 * @property {String} twitchUserName
 * @property {String} googleName
 * @property {String} avatar
 * @property {String} youtube
 * @property {String} facebook
 * @property {String} peerplaysAccountName
 * @property {String} bitcoinAddress
 * @property {Boolean} notifications
 * @property {String} invitations
 * @property {String} userType
 * @property {String} pubgUsername
 */

/**
 * @typedef {Class} UserModel
 * @property {Number} id
 * @property {String} username
 * @property {String} email
 * @property {String} twitchId
 * @property {String} twitchUserName
 * @property {String} googleId
 * @property {String} facebookId
 * @property {String} googleName
 * @property {String} avatar
 * @property {String} youtube
 * @property {String} facebook
 * @property {String} peerplaysAccountName
 * @property {String} bitcoinAddress
 * @property {Boolean} notifications
 * @property {String} invitations
 * @property {String} userType
 * @property {String} applicationType
 * @property {String} pushNotificationId
 * @property {String} pubgUsername
 * @property {String} pubgId
 * @property {JSON} vapidKey
 * @property {String} challengeSubscribeData
 */
class UserModel extends Model {
  /**
   * @swagger
   *
   * definitions:
   *  UserNew:
   *    type: object
   *    properties:
   *      avatar:
   *        type: string
   *      youtube:
   *        type: string
   *      facebook:
   *        type: string
   *      twitch:
   *        type: string
   *      peerplaysAccountName:
   *        type: string
   *      bitcoinAddress:
   *        type: string
   *      pubgUsername:
   *        type: string
   *      userType:
   *        type: string
   *        enum:
   *          - gamer
   *          - viewer
   *          - sponsor
   *          - whitelist
   *          - admin
   *      email:
   *        type: string
   *
   *  User:
   *    allOf:
   *      - $ref: '#/definitions/UserNew'
   *      - type: object
   *        properties:
   *          id:
   *            type: integer
   *          username:
   *            type: string
   *          googleName:
   *            type: string
   *          notifications:
   *            type: boolean
   *          invitations:
   *            type: string
   *            enum:
   *              - allnone
   *              - users
   *              - games
   *
   * @returns {UserPublicObject}
   */
  getPublic() {
    return {
      id: this.id,
      username: this.username || '',
      email: this.email || '',
      twitchUserName: this.twitchUserName,
      googleName: this.googleName,
      youtube: this.youtube,
      facebook: this.facebook,
      twitch: this.twitch || '',
      peerplaysAccountName: this.peerplaysAccountName,
      bitcoinAddress: this.bitcoinAddress,
      userType: this.userType,
      notifications: this.notifications,
      invitations: this.invitations,
      avatar: this.avatar || '',
      pubgUsername: this.pubgUsername
    };
  }

  addTwitchLink() {
    this.dataValues.twitchLink = this.twitchId ? `https://www.twitch.tv/${this.twitchId}/videos` : null;
  }
}

module.exports = {
  init: (sequelize) => {
    UserModel.init({
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      password: {type: Sequelize.STRING},
      avatar: {type: Sequelize.STRING},
      twitchId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      twitchUserName: {
        type: Sequelize.STRING,
        unique: true
      },
      googleId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      facebookId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      googleName: {
        type: Sequelize.STRING
      },
      youtube: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      facebook: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      twitch: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      peerplaysAccountName: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      peerplaysAccountId: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      bitcoinAddress: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      notifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      invitations: {
        type: Sequelize.ENUM(...Object.keys(invitationConstants.invitationStatus)),
        defaultValue: invitationConstants.invitationStatus.all
      },
      userType: {
        type: Sequelize.ENUM(Object.keys(profileConstants.userType).map((key) => profileConstants.userType[key]))
      },
      applicationType: {
        type: Sequelize.ENUM,
        values: profileConstants.applicationType
      },
      pushNotificationId: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM(Object.keys(profileConstants.status).map((key) => profileConstants.status[key])),
        defaultValue: profileConstants.status.active
      },
      steamId: {
        type: Sequelize.STRING
      },
      pubgUsername: {
        type: Sequelize.STRING
      },
      pubgId: {
        type: Sequelize.STRING
      },
      vapidKey: {
        type: Sequelize.JSON
      },
      challengeSubscribeData: {
        type: Sequelize.JSON
      }
    }, {
      sequelize,
      modelName: 'user'
    });
  },
  associate: (models) => {
    UserModel.hasMany(models.ResetToken.model);
    UserModel.hasMany(models.Challenge.model);
    UserModel.hasMany(models.ChallengeInvitedUsers.model);
    UserModel.hasMany(models.WhitelistedUsers.model);
    UserModel.hasMany(models.WhitelistedGames.model);
    UserModel.hasMany(models.Stream.model);
    UserModel.hasMany(models.BanHistory.model);
  },
  get model() {
    return UserModel;
  }
};
