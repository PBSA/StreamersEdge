class PubgApiRepository {

  /**
   * @param {PubgConnection} opts.pubgConnection
   */
  constructor(opts) {
    this.pubgConnection = opts.pubgConnection;
  }

  async getProfile(username) {
    return this.pubgConnection.client.getPlayer({name: username});
  }

  async getMatcheIds(pubgUsername) {
    const profile = await this.getProfile(pubgUsername);
    return profile.relationships.matches;
  }

  async getMatch(id) {
    return this.pubgConnection.client.getMatch(id);
  }

  async getTelemetry(asset) {
    const data = await this.pubgConnection.client.getTelemetry(asset.attributes.URL);

    const resultByUser = {};
    const PlayerKillLogs = data.filter((r) => r._T == 'LogPlayerKill');

    const LogMatchEnd = data.filter((r) => r._T == 'LogMatchEnd')[0];
    LogMatchEnd.characters.forEach((character) => {
      resultByUser[character.accountId] = {
        accountId: character.accountId,
        name: character.name,
        rank: character.ranking,
        kill: 0,
        health: character.health,
        teamId: character.teamId,
        isWin: character.health > 0
      };
    });
    PlayerKillLogs.forEach((killLog) => {
      if (killLog.killer && killLog.killer.accountId) {
        resultByUser[killLog.killer.accountId].kill++;
      }
    });

    return resultByUser;
  }

}

module.exports = PubgApiRepository;
