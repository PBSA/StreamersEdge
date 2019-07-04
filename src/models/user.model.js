const Sequelize = require('sequelize');
const {Model} = Sequelize;
const profileConstants = require('../constants/profile');

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
 * @property {Enum} userType
 * @property {Enum} applicationType
 * @property {String} pushNotificationId
 * @property {String} pubgUsername
 * @property {String} pubgId
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
      twitch: this.twitch || '',
      peerplaysAccountName: this.peerplaysAccountName,
      bitcoinAddress: this.bitcoinAddress,
      userType: this.userType,
      avatar: this.avatar || '',
      pubgUsername: this.pubgUsername
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
      twitch: {
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
      userType: {
        type: Sequelize.ENUM(Object.keys(profileConstants.userType).map((key) => profileConstants.userType[key]))
      },
      applicationType: {
        type:Sequelize.ENUM,
        values: profileConstants.applicationType
      },
      pushNotificationId: {
        type: Sequelize.STRING
      },
      steamId: {
        type: Sequelize.STRING
      },
      pubgUsername: {
        type: Sequelize.STRING
      },
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
    UserModel.hasMany(models.Stream.model);
  },
  get model() {
    return UserModel;
  }
};
