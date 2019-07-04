
class GamesJob {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {PubgApiRepository} opts.pubgApiRepository
   * @param {PubgService} opts.pubgService
   */
  constructor(opts) {
    this.userRepository = opts.userRepository;
    this.pubgApiRepository = opts.pubgApiRepository;
    this.pubgService = opts.pubgService;
  }

  /**
   * Pull Games pubg for all users who have added their pubg account into profile
   * @returns {Promise<void>}
   */
  async runJob() {
    const Users = await this.userRepository.findWithGames();

    for (let i = 0; i < Users.length; i++) {
      await this.processUserPubg(Users[i]);
    }
  }

  async processUserPubg(User) {
    const ids = await this.pubgApiRepository.getMatcheIds(User.pubgUsername);
    let matchesIds = ids.map(({id}) => id);

    for (let i = 0; i < matchesIds.length; i++) {
      await this.pubgService.addGame(matchesIds[i]);
    }
  }

}

module.exports = GamesJob;

