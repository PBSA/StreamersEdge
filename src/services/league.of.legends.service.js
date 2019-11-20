const logger = require('log4js').getLogger('league.of.legends.service');
logger.level = 'trace';

class LeagueOfLegendsService {

  /**
   * @param {LeagueOfLegendsMatchRepository} opts.leagueOfLegendsMatchRepository
   * @param {LeagueOfLegendsApiRepository} opts.leagueOfLegendsApiRepository
   * @param {LeagueOfLegendsParticipantRepository} opts.leagueOfLegendsParticipantRepository
   */
  constructor(opts) {
    this.leagueOfLegendsMatchRepository = opts.leagueOfLegendsMatchRepository;
    this.leagueOfLegendsApiRepository = opts.leagueOfLegendsApiRepository;
    this.leagueOfLegendsParticipantRepository = opts.leagueOfLegendsParticipantRepository;

    this.processedMatches = {};
  }

  async addGame(realm, gameId) {
    const uid = `${realm}:${gameId}`;

    if (this.processedMatches[uid]) {
      return;
    }

    const exists = await this.leagueOfLegendsMatchRepository.model.findOne({
      where: {
        gameId: gameId.toString(),
        realm
      }
    });

    if (exists) {
      this.processedMatches[uid] = true;
      return;
    }

    let matchData;

    try {
      matchData = await this.leagueOfLegendsApiRepository.getMatch(realm, gameId);
    } catch (err) {
      return;
    }

    const {
      gameDuration,
      gameMode,
      gameType,
      mapId,
      seasonId,
      queueId,
      platformId,
      participants,
      participantIdentities
    } = matchData;

    const match = await this.leagueOfLegendsMatchRepository.model.create({
      gameId,
      realm,
      gameDuration,
      gameMode,
      gameType,
      mapId,
      seasonId,
      queueId,
      platformId
    });

    const seParticipants = participants.map((participant) => {
      const participantDto = participantIdentities.find(({participantId}) => participantId === participant.participantId);
      const {accountId, summonerName, summonerId} = participantDto.player;
      const {kills, win} = participant.stats;

      return {
        leagueOfLegendsMatchId: match.id,
        accountId,
        summonerName,
        summonerId,
        kills,
        isWin: win
      };
    });

    logger.trace(`Create match ${gameId} with ${seParticipants.length} participants`);

    await this.leagueOfLegendsParticipantRepository.model.bulkCreate(seParticipants);
  
    this.processedMatches[uid] = true;
  }

}

module.exports = LeagueOfLegendsService;
