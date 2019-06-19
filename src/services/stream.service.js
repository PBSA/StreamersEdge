
class StreamService {

  /**
   * @param {StreamRepository} opts.streamRepository
   * @param {UserRepository} opts.userRepository
   */
  constructor(opts) {
    this.streamRepository = opts.streamRepository;
    this.userRepository = opts.userRepository;
  }

  /**
   *
   * @param creatorId
   * @param streamObject
   * @returns {Promise<StreamPublicObject>}
   */
  async createStream(creatorId, streamObject) {
    const StreamAdded = await this.streamRepository.create({
      userId: creatorId,
      name: streamObject.name,
      game: streamObject.game,
      sourceName: streamObject.sourceName,
      embedUrl: streamObject.embedUrl,
      channelId:streamObject.channelId,
      views:streamObject.views,
      isLive:streamObject.isLive,
      startTime:streamObject.startTime,
      endTime:streamObject.startTime
    });

    return this.getCleanObject(StreamAdded.id);
  }

  /**
   * @param streamId
   * @returns {Promise<StreamPublicObject>}
   */
  async getCleanStream(streamId) {
    const StreamObject = await this.streamRepository.findByPk(streamId, {
      include: [{
        model: this.userRepository.model,
        required: true
      }]
    });

    if (!StreamObject) {
      return null;
    }

    return StreamObject.getPublic();
  }

  /**
   * Get a list of Active Streams corresponding to the specified parameters
   *
   * @param search
   * @param limit
   * @param skip
   * @param sortBy
   * @param sortOrder
   * @param isActive
   * @returns {Promise<[StreamPublicObject]>}
   */
  async searchStreams(search, limit, skip, sortBy, sortOrder, isActive) {
    const streams = await this.streamRepository.searchStreams(search, limit, skip, sortBy, sortOrder, isActive, {
      include: [{
        model: this.userRepository.model,
        required: true
      }]
    });
    return Promise.all(streams.map(async (StreamFound) => this.getCleanStream(StreamFound.id)));
  }

}

module.exports = StreamService;
