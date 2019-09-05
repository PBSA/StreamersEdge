class TestDbHelper {

  static async truncateAll(apiModule){
    const models = apiModule.dbConnection.sequelize.models;

    for (const key in models){
      try {
        await apiModule.dbConnection.sequelize.models[key].destroy({where:{}});
      }catch (err) {
        console.log(err);
      }

    }
  }
}


module.exports = TestDbHelper;
