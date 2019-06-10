const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Class} ProfileModel
 * @property {Number} id
 * @property {String} userid
 * @property {String} email
 * @property {String} profilePic
 * @property {Enum} applicationType
 * @property {String} pushNotificationId
 * @property {String} userType
 * @property {Array} linkedStreamingAccounts
 * @property {Array} linkedCryptoAccounts
 * @property {Array} linkedGameAccounts
 */
class ProfileModel extends Model {}

module.exports = {
  init: (sequelize) => {
    ProfileModel.init({
      email: {type: Sequelize.STRING},
      profilePic: {
        type: Sequelize.STRING,
        allowNull: true
      },
      applicationType:{
        type: Sequelize.ENUM,
        values:['windows','mac','web','extension','android','ios']
      },
      pushNotificationId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userType: {
        type: Sequelize.ENUM,
        values: ['gamer','viewer','sponsor','whitelist','admin']
      },
      linkedStreamingAccounts: {
        type: Sequelize.STRING,
        get: function() {
          return JSON.parse(this.getDataValue('linkedStreamingAccounts'));
        },
        set: function(val) {
          return this.setDataValue('linkedStreamingAccounts', JSON.stringify(val));
        }
      },
      linkedCryptoAccounts: {
        type: Sequelize.STRING,
        get: function() {
          return JSON.parse(this.getDataValue('linkedCryptoAccounts'));
        },
        set: function(val) {
          return this.setDataValue('linkedCryptoAccounts', JSON.stringify(val));
        }
      },
      linkedGameAccounts: {
        type: Sequelize.STRING,
        get: function() {
          return JSON.parse(this.getDataValue('linkedGameAccounts'));
        },
        set: function(val) {
          return this.setDataValue('linkedGameAccounts', JSON.stringify(val));
        }
      }
    },{
      sequelize,
      modelName: 'profile'
    });
  },
  associate: () => {},
  get Model(){
    return ProfileModel;
  }
};
