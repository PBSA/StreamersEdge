const challengeConstants = require('../constants/challenge');

class GameService {

  async getGameParamData(){
    return challengeConstants.paramTypes;
  }

}

module.exports = GameService;
