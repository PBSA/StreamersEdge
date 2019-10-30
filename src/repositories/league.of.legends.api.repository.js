class LeagueOfLegendsApiRepository {

  /**
   * @param {LeagueOfLegendsConnection} opts.leagueOfLegendsConnection
   */
  constructor(opts) {
    this.leagueOfLegendsConnection = opts.leagueOfLegendsConnection;
  }

  async getAccountId(realm, summonerName) {
    const {accountId} = await this.leagueOfLegendsConnection.request(realm, 'summoner', `/lol/summoner/v4/summoners/by-name/${summonerName}`);
    return accountId;
  }

  async getMatchesForAccount(realm, accountId) {
    const {matches} = await this.leagueOfLegendsConnection.request(realm, 'match', `/lol/match/v4/matchlists/by-account/${accountId}`);
    return matches;
  }

  async getMatch(realm, gameId) {
    return await this.leagueOfLegendsConnection.request(realm, 'match', `/lol/match/v4/matches/${gameId}`);
  }

  async getMatchTimeline(realm, gameId) {
    return await this.leagueOfLegendsConnection.request(realm, 'match', `/lol/match/v4/timelines/by-match/${gameId}`);
  }

  getRealms() {
    return this.leagueOfLegendsConnection.getRealms();
  }

}

module.exports = LeagueOfLegendsApiRepository;
