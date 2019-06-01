const Sequelize = require('sequelize');

/**
 * @typedef {Object} UserObject
 * @property {String} username
 * @property {String} email
 * @property {String} twitchId
 * @property {String} googleId
 * @property {String} avatar
 * @property {String} youtube
 * @property {String} facebook
 * @property {String} peerplaysAccountName
 * @property {String} bitcoinAddress
 */

/**
 * @typedef {UserObject} UserDocument
 */
const User = (sequelize) => {
  return sequelize.define('user', {
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    avatar: {
      type: Sequelize.STRING
    },
    twitchId: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    },
    googleId: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
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
    }
  }, {});
};

module.exports = User;
