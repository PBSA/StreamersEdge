const Sequelize = require('sequelize');
const {model} = require('../db/models/stream.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

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

  async populateTwitchStreams() {
    const twitchIds = await this.userRepository.model.findAll({
      attributes: ['twitchId'],
      where: {
        twitchId: {
          [Sequelize.Op.ne]:null
        }
      },
      raw: true
    });

    while(Array.isArray(twitchIds) && twitchIds.length) {
      const data = JSON.parse(await this.twitchConnection.request(twitchIds.splice(0,100).map((user)=>'&user_id='+user.twitchId)));

      for(let i = 0; i < data.data.length; i++) {
        const streamObj = data.data[i];
        let user = await this.userRepository.getByTwitchId(streamObj.user_id);
        let streamGame = '';

        if(streamObj.game_id == 33214) {
          streamGame = 'fortnite';
        }else {
          streamGame = 'pubg';
        }

        let isStreamLive = streamObj.type == 'live' ? true : false;
        await this.createOrUpdateStream(streamObj, user, streamGame, isStreamLive);
      }
    }
  }

  async createOrUpdateStream(streamObj, user, streamGame, isStreamLive) {
    this.model.findOne({where:{channelId:streamObj.id}}).then((obj)=>{
      if(!obj) {
        this.create({
          userId: user.id,
          name: streamObj.title,
          game: streamGame,
          sourceName: 'twitch',
          embedUrl: '',
          channelId:streamObj.id,
          views:streamObj.viewer_count,
          isLive:isStreamLive,
          startTime:streamObj.started_at,
          thumbnailUrl:streamObj.thumbnail_url
        });
      }else {
        obj.update({
          name: streamObj.title,
          game: streamGame,
          sourceName: 'twitch',
          embedUrl: '',
          channelId:streamObj.id,
          views:streamObj.viewer_count,
          isLive:isStreamLive,
          startTime:streamObj.started_at,
          thumbnailUrl:streamObj.thumbnail_url
        });
      }
    });
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
