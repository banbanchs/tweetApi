var Tweet = require('../models').Tweet;
var User = require('../models').User;

/**
 * Get current user timeline.
 */
exports.getTimeline = function(req, res) {
  var uid = req.session.user;
  var username;
  if (uid) {
    User.find({ where: {id: uid} }).then(function(user) {
      username = user.name;
      return user.dataValues.meta ? user.dataValues.meta['following'] : [];
    }).then(function(followingUser) {
      //if (followingUser && followingUser.length && followingUser.length !== 0) {
      followingUser.push(username);
      console.log(followingUser);
      Tweet.findAll({
        limit: 20,
        order: 'id DESC',
        attributes: ['id', 'content', 'createdAt', 'expiredAt'],
        include: [{
          model: User,
          attributes: ['id', 'email', 'name', 'meta'],
          where: {name: {$in: followingUser}}
        }]
      }).then(function(tweets) {
        return res.send(tweets);
      });
      //}
    });
  } else {
    return res.sendStatus(401);
  }
};

/**
 * Create a new tweet by currentUser
 *
 * eg:
 * {
 *   content: 'test',
 *   expire: 60,
 * }
 */
exports.createTweet = function(req, res) {
  var uid = req.session.user;
  if (uid) {
    var content = req.body.content;
    var expire = (req.body.expire || 10) * 60 * 1000; // X minutes, 10 minutes default
    var now = new Date();
    var expireDate = new Date(now.getTime() + expire);
    User.find({ where: {id: uid} }).then(function(user) {
      console.log(now);
      Tweet.create({ content: content, createdAt: now, expiredAt: expireDate }).then(function(tweet) {
        user.addTweets(tweet);
        return tweet.dataValues;
      }).then(function(tweet) {
        return res.status(201).send({
          _id: tweet.id,
          content: tweet.content,
          createdAt: tweet.createdAt,
          userId: uid
        });
      });
    }).catch(function(err) {
      console.log(err);
    });
  } else {
    return res.sendStatus(401);
  }
};

exports.getTweet = function(req, res) {
  var tweetId = req.params.id;
  Tweet.find({
    where: {id: tweetId},
    attributes: ['id', 'content', 'createdAt', 'expiredAt'],
    include: [{
      model: User,
      attributes: ['id', 'email', 'name', 'meta']
    }]
  }).then(function(tweet) {
    if (tweet) {
      return res.json(tweet);
    } else {
      return res.sendStatus(404);
    }
  });
};

exports.deleteTweet = function(req, res) {
  var uid = req.session.user;
  if (uid) {
    var tweetId = req.params.id;
    Tweet.find({ where: {id: tweetId} }).then(function(tweet) {
      if (tweet) {
        console.log(tweet.dataValues);
        if (tweet.UserId === uid) {
          tweet.destroy().then(function() {
            return res.sendStatus(204);
          });
        } else {
          return res.status(403).send('User does not have permission');
        }
      } else {
        return res.status(404).send('Tweet ' + tweetId + ' does not exist');
      }
    });
  } else {
    return res.sendStatus(401);
  }
};