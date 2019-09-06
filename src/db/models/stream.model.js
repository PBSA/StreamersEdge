const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Object} StreamPublicObject
 * @property {Number} id
 * @property {String} name
 * @property {Enum} game
 * @property {Enum} sourceName
 * @property {String} embedUrl
 * @property {String} channelId
 * @property {Number} views
 * @property {Boolean} isLive
 * @property {Date} startTime
 * @property {String} thumbnailUrl
 * @property {UserPublicObject} user
 */

/**
 * @typedef {Class} StreamModel
 * @property {Number} id
 * @property {String} name
 * @property {Enum} game
 * @property {Enum} sourceName
 * @property {String} embedUrl
 * @property {String} channelId
 * @property {Number} views
 * @property {Boolean} isLive
 * @property {Date} startTime
 * @property {String} thumbnailUrl
 */

class StreamModel extends Model {
  /**
   * @swagger
   *
   * definitions:
   *
   *  Stream:
   *    type: object
   *    properties:
   *      id:
   *        type: integer
   *      name:
   *        type: string
   *      game:
   *        type: string
   *        enum:
   *          - pubg
   *          - fortnite
   *      sourceName:
   *        type: boolean
   *        enum:
   *          - twitch
   *          - youtube
   *      embedUrl:
   *        type: string
   *      channelId:
   *        type: integer
   *      views:
   *        type: integer
   *      isLive:
   *        type: boolean
   *      startTime:
   *        type: string
   *      thumbnailUrl:
   *        type: string
   *      user:
   *        $ref: '#/definitions/User'
   *
   * @returns {StreamPublicObject}
   */
  getPublic() {
    const result = {
      id: this.id,
      name: this.name,
      game: this.game,
      sourceName: this.sourceName,
      embedUrl: this.embedUrl,
      channelId: this.channelId,
      views: this.views,
      isLive: this.isLive,
      startTime: this.startTime,
      thumbnailUrl: this.thumbnailUrl
    };

    if (this.user) {
      result.user = this.user.getPublic();
    }

    return result;
  }
}

const attributes = {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  game: {
    type: Sequelize.ENUM,
    values: ['pubg','fortnite']
  },
  sourceName: {
    type: Sequelize.ENUM,
    values: ['twitch','youtube']
  },
  embedUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  channelId: {type: Sequelize.STRING},
  views: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  isLive: {
    type: Sequelize.BOOLEAN
  },
  startTime: {
    type: Sequelize.DATE
  },
  thumbnailUrl: {
    type: Sequelize.STRING
  }
};

module.exports = {
  init: (sequelize) => {
    StreamModel.init(attributes, {
      sequelize,
      modelName: 'streams'
    });
  },
  associate: (models) => {
    StreamModel.belongsTo(models.User.model);
  },
  get model() {
    return StreamModel;
  }
};
