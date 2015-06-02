var db = require('./index');
var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function(sequelize, DataType) {
  var User = sequelize.define('User', {
    email: { type: DataType.STRING, allowNull: false },
    name: { type: DataType.STRING, allowNull: false },
    password: { type: DataType.STRING, allowNull: false },
    meta: { type: DataType.JSON, allowNull: true }
  }, {
    indexes: [
      { unique: true, fields: [ 'email' ] },
      { fields: [ 'name' ] }
    ],
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Tweet);
      },

      addUser: function(credentials, callback) {
        var userAttrs = credentials;
        var salt = bcrypt.genSaltSync(10);
        var password = userAttrs.password;
        delete credentials.password;
        userAttrs.password = bcrypt.hashSync(password, salt);

        User.build(userAttrs).save().then(function(user) {
          callback(null, user);
        }).catch(function(err) {
          console.log("models/User.js error saving to DB :", err);
        });
      },

      authenticate: function(username, password, callback) {
        console.log("authenticating %s:%s", username, password);
        User.find({ where: {name: username} }).then(function(user) {
          if (!user) {
            return callback(new Error("Can't find user"));
          }
          if (!bcrypt.compareSync(password, user.password)) {
            return callback(null, new Error('invalid password'));
          }
          return callback(null, user);
        });
      },

      follow: function(targetName, myselfId) {
        return db.User.find({ where: {name: targetName} }).then(function(user) {
          if (user) {
            db.User.find({ where: {id: myselfId} }).then(function(myself) {
              myself.meta = myself.meta || {};
              myself.meta.following = myself.meta.following || [];
              // Deny when the user is followed
              if (_.contains(myself.meta.following, targetName)) {
                console.log('followed already');
                return;
              }
              myself.meta.following.push(user.name);
              return myself.save();
            });
          } else {
            return res.sendStatus(404);
          }
        });
      }
    }
  });
  return User;
};

