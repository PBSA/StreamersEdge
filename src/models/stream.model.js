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
 * @property {Date} endTime
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
 * @property {Date} endTime
 */

class StreamModel extends Model {
  /**
   * @returns {StreamPublicObject}
   */
  getPublic() {
    const result = {
      id: this.id,
      name: this.name,
      game: this.game,
      sourceName: this.sourceName,
      embedUrl: this.embedUrl,
      channelId:this.channelId,
      views:this.views,
      isLive:this.isLive,
      startTime:this.startTime,
      endTime:this.startTime
    };

    if (this.user) {
      result.user = this.user.getPublic();
    }

    return result;
  }
}

module.exports = {
  init: (sequelize) => {
    StreamModel.init({
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
      endTime: {
        type: Sequelize.DATE
      }
    }, {
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
