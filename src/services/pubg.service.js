const logger = require('log4js').getLogger('pubg.service');
logger.level = 'trace';

class PubgService {

  /**
   * @param {PubgRepository} opts.pubgRepository
   * @param {PubgApiRepository} opts.pubgApiRepository
   * @param {PubgParticipantRepository} opts.pubgParticipantRepository
   */
  constructor(opts) {
    this.pubgRepository = opts.pubgRepository;
    this.pubgApiRepository = opts.pubgApiRepository;
    this.pubgParticipantRepository = opts.pubgParticipantRepository;

    this.processedMatches = {};

  }

  async addGame(pubgMatchId) {
    if (this.processedMatches[pubgMatchId]) {
      return;
    }

    const exists = await this.pubgRepository.model.findOne({
      where: {
        pubgId: pubgMatchId
      }
    });

    if (exists) {
      this.processedMatches[pubgMatchId] = true;
      return;
    }

    const match = await this.pubgApiRepository.getMatch(pubgMatchId);
    const stat = await this.pubgApiRepository.getTelemetry(match.relationships.assets[0]);

    const Match = await this.pubgRepository.model.create({
      pubgId: pubgMatchId,
      createdAt: match.attributes.createdAt,
      duration: match.attributes.duration,
      gameMode: match.attributes.gameMode,
      mapName: match.attributes.mapName,
      isCustomMatch: match.attributes.isCustomMatch,
      shardId: match.attributes.shardId,
      titleId: match.attributes.titleId
    });

    const participants = Object.keys(stat).map((key) => {
      stat[key].pubgId = Match.id;
      return stat[key];
    });

    logger.trace(`Create match ${pubgMatchId} with ${participants.length} participants`);

    await this.pubgParticipantRepository.model.bulkCreate(participants);

    this.processedMatches[pubgMatchId] = true;
  }

}

module.exports = PubgService;
