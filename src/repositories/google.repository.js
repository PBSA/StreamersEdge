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
    const profile = await this.googleConnection.userYoutubeInfo(tokens);

    if (profile.data.items.length === 1) {
      return `https://www.youtube.com/channel/${profile.data.items[0].id}`;
    }

    return '';
  }

}

module.exports = GoogleRepository;
