const Sequelize = require('sequelize');
const {model} = require('../db/models/stream.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

const GAME_IDS_MAP = {
  33124: 'fortnite',
  493057: 'pubg'
};

class StreamRepository extends BasePostgresRepository {

  constructor(opts) {
    super(model);
    this.twitchConnection = opts.twitchstreamConnection;
    this.userRepository = opts.userRepository;
  }

  /**
  * @param pk
  * @param options
  * @returns {Promise<StreamModel>}
  */
  async findByPk(pk, options) {
    return super.findByPk(pk, options);
  }

  async getLiveStreamForUser(userId) {
    return this.model.findOne({
      where: {
        userId,
        isLive: true
      }
    });
  }

  async populateTwitchStreams() {
    const twitchIds = (await this.userRepository.model.findAll({
      attributes: ['twitchId'],
      where: {
        twitchId: {
          [Sequelize.Op.ne]: null
        }
      },
      raw: true
    })).map((user) => user.twitchId);

    const liveStreams = await this.model.findAll({
      where: {
        isLive: true
      },
      attributes: ['id', 'channelId']
    }, {raw: true});

    // list of all streams we believe are currently live
    const liveByChannelId = liveStreams.reduce((acc, stream) => {
      stream = stream.toJSON();
      stream.isLive = false;
      acc[stream.channelId] = stream;
      return acc;
    }, {});

    for (let i = 0; i <= twitchIds.length; i += 100) {
      const streams = await this.twitchConnection.getStreams(twitchIds.slice(i, i + 100));

      for (const stream of streams) {
        const user = await this.userRepository.getByTwitchId(stream.user_id);

        if (!user) {
          continue;
        }

        const game = GAME_IDS_MAP[stream.game_id];

        if (!game) {
          continue;
        }

        // live stream still exists, mark it as such
        if (liveByChannelId[stream.id]) {
          liveByChannelId[stream.id].isLive = true;
        }
        
        this.model.upsert({
          userId: user.id,
          name: stream.title,
          game,
          sourceName: 'twitch',
          embedUrl: '',
          channelId: stream.id,
          views: stream.viewer_count,
          isLive: stream.type === 'live',
          startTime: stream.started_at,
          thumbnailUrl: stream.thumbnail_url
        });
      }
    }

    // any stream we didn't find in the API must have ended
    await Promise.all(Object.values(liveByChannelId).map(async (stream) => {
      if (stream.isLive) {
        return;
      }

      return this.model.update({
        isLive: false
      }, {
        where: {
          id: stream.id
        }
      });
    }));
  }

  async searchStreams(search, limit, offset, sortBy, isAscending, searchActiveStreams, options) {
    const filter = search ? {
      [Sequelize.Op.and]:[
        {[Sequelize.Op.or]: [
          {name: {[Sequelize.Op.like]: `%${search}%`}},
          {game: {[Sequelize.Op.like]: `%${search}%`}},
          {userId: {[Sequelize.Op.like]: `%${search}%`}},
          {'$users.username$': {[Sequelize.Op.like]: `%${search}%`}},
          {'$users.twitchUserName$': {[Sequelize.Op.like]: `%${search}%`}},
          {sourceName: {[Sequelize.Op.like]: `%${search}%`}}
        ]},
        {isActive: {searchActiveStreams}}
      ]
    } : null;

    const sortOrder = isAscending?'ASC':'DESC';
    return this.model.findAll({
      where: filter,
      options,
      order: [
        [`${sortBy}`,`${sortOrder}`]
      ],
      offset,
      limit
    });
  }

  async getUserStream(user, limit, offset, options) {
    return this.model.findAll({
      where: {userId: `%${user}%`},
      options,
      offset,
      limit
    });
  }
}

module.exports = StreamRepository;
