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
 * @property {Enum} userType
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
 * @property {Enum} userType
 * @property {Enum} applicationType
 * @property {String} pushNotificationId
 * @property {String} pubgUsername
 * @property {String} pubgId
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
   *          facebookUserName:
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
      facebookUserName: this.facebookUserName,
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
      // user username
      // set during registration by soc. network or manual registration. Cannot be changed
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      // should be set by user during registration and can be changed later
      // also set upon authorization by soc. network
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      // system flag
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      password: {type: Sequelize.STRING},
      // URL to avatars file. Updated during registration through soc. network.
      // Can be manually updated by the user.
      avatar: {type: Sequelize.STRING},
      // set only when linking a twitch account
      twitchId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      // set only when linking a twitch account
      twitchUserName: {
        type: Sequelize.STRING,
        unique: true
      },
      // set only when linking a google account
      googleId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      // set only when linking a google account
      googleName: {
        type: Sequelize.STRING
      },
      // set only when linking a facebook account
      facebookId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      // set only when linking a facebook account
      facebookUserName: {
        type: Sequelize.STRING,
        unique: true
      },
      // URL to user youtube channel. Updated during registration through Google Account.
      // Can be manually updated by the user.
      youtube: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      // URL to user facebook profile. Update only manually
      facebook: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      // URL to user twitch profile. Update only manually
      twitch: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      // Peerplays account name. Update manually only after registration peerplays account method calling
      peerplaysAccountName: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      // Peerplays account ID. Set automatically after peerplaysAccountName updating
      peerplaysAccountId: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      // Update only manually
      bitcoinAddress: {
        type: Sequelize.STRING,
        defaultValue: ''
      },
      // are notifications on. Update only manually
      notifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // invitations settings. Update only manually
      invitations: {
        type: Sequelize.ENUM(...Object.keys(invitationConstants.invitationStatus)),
        defaultValue: invitationConstants.invitationStatus.all
      },
      // user type. Update only manually
      userType: {
        type: Sequelize.ENUM(Object.keys(profileConstants.userType).map((key) => profileConstants.userType[key]))
      },
      // not updated
      applicationType: {
        type: Sequelize.ENUM,
        values: profileConstants.applicationType
      },
      // not updated
      pushNotificationId: {
        type: Sequelize.STRING
      },
      // User status. Can be changed only by admin
      status: {
        type: Sequelize.ENUM(Object.keys(profileConstants.status).map((key) => profileConstants.status[key])),
        defaultValue: profileConstants.status.active
      },
      // set only when linking a steam account
      steamId: {
        type: Sequelize.STRING
      },
      // updated by user manually
      pubgUsername: {
        type: Sequelize.STRING
      },
      // set automatically after pubgUsername updating
      pubgId: {
        type: Sequelize.STRING
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
