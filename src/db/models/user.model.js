const Sequelize = require('sequelize');
const {Model} = Sequelize;
const profileConstants = require('../../constants/profile');

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
 * @property {Enum} userType
 * @property {String} pubgUsername
 * @property {String} facebookLink
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
 * @property {Enum} userType
 * @property {Enum} applicationType
 * @property {String} pushNotificationId
 * @property {String} pubgUsername
 * @property {String} pubgId
 * @property {String} challengeSubscribeData
 * @property {String} timeFormat
 * @property {String} facebookLink
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
   *      timeFormat:
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
   *          facebookLink:
   *            type: string
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
      avatar: this.avatar || '',
      pubgUsername: this.pubgUsername,
      leagueOfLegendsAccountId: this.leagueOfLegendsAccountId,
      leagueOfLegendsRealm: this.leagueOfLegendsRealm,
      timeFormat: this.timeFormat,
      paypalEmail: this.paypalEmail,
      facebookLink: this.facebookLink
    };
  }

  getPublicMinimal() {
    return {
      id: this.id,
      username: this.username || '',
      peerplaysAccountName: this.peerplaysAccountName
    };
  }

  addTwitchLink() {
    this.dataValues.twitchLink = this.twitchId ? `https://www.twitch.tv/${this.twitchId}/videos` : null;
  }
}
const attributes = {
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
    unique: true,
    allowNull:true
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
  peerplaysMasterPassword: {
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
  userType: {
    type: Sequelize.ENUM(Object.keys(profileConstants.userType).map((key) => profileConstants.userType[key])),
    defaultValue: profileConstants.userType.viewer
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
  leagueOfLegendsAccountId: {
    type: Sequelize.STRING
  },
  leagueOfLegendsRealm: {
    type: Sequelize.STRING
  },
  challengeSubscribeData: {
    type: Sequelize.JSON
  },
  paypalEmail: {
    type: Sequelize.STRING
  },
  paypalAccountId: {
    type: Sequelize.STRING
  },
  timeFormat: {
    type: Sequelize.ENUM(Object.values(profileConstants.timeFormat)),
    defaultValue: profileConstants.timeFormat.time12h
  },
  facebookLink: {
    type: Sequelize.STRING
  }
};

module.exports = {
  init: (sequelize) => {
    UserModel.init(attributes, {
      sequelize,
      modelName: 'users'
    });
  },
  associate: (models) => {
    UserModel.hasMany(models.ResetToken.model);
    UserModel.hasMany(models.Challenge.model);
    UserModel.hasMany(models.Stream.model);
    UserModel.hasMany(models.BanHistory.model);
  },
  get model() {
    return UserModel;
  }
};
