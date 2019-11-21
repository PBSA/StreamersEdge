const Faker = require('faker');
const profileConstants = require('../../constants/profile');
const Lodash = require('lodash');
const Bcrypt = require('bcrypt');

class UserFactory {
  static async generateObject({
    username = Faker.internet.userName(),
    email = Faker.internet.email(),
    twitchUserName = Faker.internet.userName(),
    googleName = Faker.internet.userName(),
    youtube = Faker.internet.url(),
    facebook = Faker.internet.url(),
    twitch = Faker.internet.url(),
    peerplaysAccountName = Faker.internet.userName(),
    bitcoinAddress = Faker.finance.bitcoinAddress(),
    userType = Lodash.sample(
      Object.values(profileConstants.userType)),
    notifications = true,
    avatar = Faker.image.avatar(),
    pubgUsername = Faker.internet.userName(),
    createdAt = new Date(),
    updatedAt = new Date(),
    password = 'pass1234',
    isEmailVerified = true
  }) {
    return {
      username,
      email,
      twitchUserName,
      googleName,
      youtube,
      facebook,
      twitch,
      peerplaysAccountName,
      bitcoinAddress,
      userType,
      notifications,
      avatar,
      pubgUsername,
      createdAt, updatedAt,
      isEmailVerified,
      password: Bcrypt.hashSync(password, 10)
    };
  }

}

module.exports = UserFactory;
