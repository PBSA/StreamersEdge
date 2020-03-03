'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  username: {type: DataTypes.STRING, unique: true, allowNull: true,},
  email: {type: DataTypes.STRING, unique: true, allowNull: true,},
  isEmailVerified: {type: DataTypes.BOOLEAN, defaultValue: false,},
  password: {type: DataTypes.STRING},
  avatar: {type: DataTypes.STRING},
  twitchId: {type: DataTypes.STRING, unique: true, allowNull: true,},
  twitchUserName: {type: DataTypes.STRING, unique: true, allowNull: true, defaultValue: null,},
  googleId: {type: DataTypes.STRING, unique: true, allowNull: true,},
  facebookId: {type: DataTypes.STRING, unique: true, allowNull: true,},
  googleName: {type: DataTypes.STRING,},
  youtube: {type: DataTypes.STRING, defaultValue: '',},
  facebook: {type: DataTypes.STRING, defaultValue: '',},
  facebookLink: {type: DataTypes.STRING, allowNull: true},
  twitch: {type: DataTypes.STRING, defaultValue: '',},
  peerplaysAccountName: {type: DataTypes.STRING, defaultValue: '',},
  peerplaysAccountId: {type: DataTypes.STRING, defaultValue: '',},
  peerplaysMasterPassword: {type: DataTypes.STRING, defaultValue: '',},
  bitcoinAddress: {type: DataTypes.STRING, defaultValue: '',},
  notifications: {type: DataTypes.BOOLEAN, defaultValue: true,},
  userType: {type: DataTypes.ENUM(['gamer', 'viewer', 'sponsor', 'whitelist', 'admin']), allowNull: false, defaultValue: 'viewer',},
  applicationType: {type: DataTypes.ENUM(['mac', 'windows', 'web', 'electron', 'mobile', 'ios'])},
  pushNotificationId: {type: DataTypes.STRING,},
  status: {
    type: DataTypes.ENUM(['banned', 'active']),
    defaultValue: 'active'
  },
  steamId: {type: DataTypes.STRING,},
  timeFormat: {type: DataTypes.ENUM(['12h', '24h']), allowNull: false, defaultValue: '12h',},
  pubgUsername: {type: DataTypes.STRING,},
  pubgId: {type: DataTypes.STRING,},
  leagueOfLegendsAccountId: {type: DataTypes.STRING, allowNull: true,},
  leagueOfLegendsRealm: {type: DataTypes.STRING, allowNull: true,},
  paypalEmail: {type: DataTypes.STRING, defaultValue: '',},
  paypalAccountId: {type: DataTypes.STRING, defaultValue: '',},
  challengeSubscribeData: {type: DataTypes.JSON,},
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('users', fields);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('users');
  },
};
