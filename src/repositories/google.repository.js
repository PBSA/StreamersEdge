class GoogleRepository {

  /**
   * @param {GoogleConnection} opts.googleConnection
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.googleConnection = opts.googleConnection;
    this.config = opts.config;
  }

  async getYoutubeLink(tokens) {
    try {
      const profile = await this.googleConnection.userYoutubeInfo(tokens);

      if (profile.data.items.length === 1 && profile.data.items[0].status.privacyStatus === 'public') {
        return `https://www.youtube.com/channel/${profile.data.items[0].id}`;
      }

      return null;
    }catch(err) {
      return null;
    }

  }

}

module.exports = GoogleRepository;
