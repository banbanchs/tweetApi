var Sequelize = require('sequelize');
var sequelize = Sequelize.LOCAL = new Sequelize('postgres://memory@127.0.0.1:5432/memory');
var db = {};

var Tweet = module.exports.Tweet = sequelize.import(__dirname + '/Tweet');
var User = module.exports.User = sequelize.import(__dirname + '/User');
db[Tweet.name] = Tweet;
db[User.name] = User;

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

module.exports.sequelize = sequelize;