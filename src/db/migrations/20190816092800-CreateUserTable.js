'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const profileConstants = require('../../constants/profile');
const invitationConstants = require('../../constants/invitation');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  username: {type: DataTypes.STRING, unique: true, allowNull: true,},
  email: {type: DataTypes.STRING, unique: true, allowNull: true,},
  isEmailVerified: {type: DataTypes.BOOLEAN, defaultValue: false,},
  password: {type: DataTypes.STRING},
  avatar: {type: DataTypes.STRING},
  twitchId: {type: DataTypes.STRING, unique: true, allowNull: true,},
  twitchUserName: {type: DataTypes.STRING, unique: true,},
  googleId: {type: DataTypes.STRING, unique: true, allowNull: true,},
  facebookId: {type: DataTypes.STRING, unique: true, allowNull: true,},
  googleName: {type: DataTypes.STRING,},
  youtube: {type: DataTypes.STRING, defaultValue: '',},
  facebook: {type: DataTypes.STRING, defaultValue: '',},
  twitch: {type: DataTypes.STRING, defaultValue: '',},
  peerplaysAccountName: {type: DataTypes.STRING, defaultValue: '',},
  peerplaysAccountId: {type: DataTypes.STRING, defaultValue: '',},
  bitcoinAddress: {type: DataTypes.STRING, defaultValue: '',},
  notifications: {type: DataTypes.BOOLEAN, defaultValue: true,},
  invitations: {type: DataTypes.ENUM(...Object.keys(invitationConstants.invitationStatus)),
    defaultValue: invitationConstants.invitationStatus.all,
  },
  userType: {type: DataTypes.ENUM(Object.keys(profileConstants.userType).
    map((key) => profileConstants.userType[key])),
  },
  applicationType: {type: DataTypes.ENUM, values: profileConstants.applicationType,},
  pushNotificationId: {type: DataTypes.STRING,},
  status: {
    type: DataTypes.ENUM(Object.keys(profileConstants.status).
    map((key) => profileConstants.status[key])),
    defaultValue: profileConstants.status.active,
  },
  steamId: {type: DataTypes.STRING,},
  pubgUsername: {type: DataTypes.STRING,},
  pubgId: {type: DataTypes.STRING,}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('users', fields);
  },

  down: (queryInterface) => {

    return queryInterface.dropTable('users');
  },
};
