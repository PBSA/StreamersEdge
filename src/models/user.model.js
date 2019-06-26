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
 */
class UserModel extends Model {
  /**
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
      peerplaysAccountName: this.peerplaysAccountName,
      bitcoinAddress: this.bitcoinAddress,
      notifications: this.notifications,
      invitations: this.invitations,
      userType: this.userType
    };
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
      peerplaysAccountName: {
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
        type:Sequelize.ENUM,
        values: profileConstants.userType
      },
      applicationType: {
        type:Sequelize.ENUM,
        values: profileConstants.applicationType
      },
      pushNotificationId: {
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
  },
  get model() {
    return UserModel;
  }
};
