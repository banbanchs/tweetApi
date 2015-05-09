var db = require('./index');

/*
{
  id: 1,
  content: "Hello world",
  createdAt: SomeTime,
  expiredAt: SomeTime plus date,
}
*/

module.exports = function(sequelize, DataType) {
  var Tweet = sequelize.define('Tweet', {
    content: { type: DataType.STRING(140), allowNull: false },
    createdAt: { type: DataType.DATE, allowNull: false },
    expiredAt: { type: DataType.DATE, allowNull: false }
      // user: { type: DataType.JSON, allowNull: false },
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        Tweet.belongsTo(models.User);
      }
    }
  });
  return Tweet;
};
