const DataTypes = require('sequelize/lib/data-types');

class MigrationUtil {
  static genericRows() {
    return {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    };
  }
  static createForeignFields(fieldsArr = []){
    const obj = {};

    for (const field of fieldsArr){
      obj[field] = {
        type: DataTypes.INTEGER
      };
    }

    return obj;
  }
}
module.exports = MigrationUtil;
