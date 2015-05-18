var db = require('../models');

// Send current user information to the client

exports.currentUser = function(req, res) {
  if (req.session.user) {
    console.log(req.session.user);
    db.User.find({ where: {id: req.session.user} }).then(function(user) {
      return res.json({
        'email': user.email,
        'name': user.name,
        '_id': user.id
      });
    }, function(err) {
      return res.send(400, err);
    });
  } else {
    return res.sendStatus(401);
  }
};

/**
 * RESTful API, create, find and update a user
 *
 */
exports.create = function(req, res) {
  db.User.addUser(req.body, function(err, user) {
    if (user) {
      return res.json({
        '_id': user.id,
        'name': user.name,
        'email': user.email
      });
    } else {
      return res.status(400).send(err);
    }
  });
};


exports.findUserByName = function(req, res) {
  var p = req.query.p || 0;
  db.User.find({
    where: {name: req.params.name},
    attributes: ['id', 'email', 'name', 'meta'],
    include: [{
      model: db.Tweet,
      limit: 20,
      offset: p,
      order: 'id DESC',
      attributes: ['id', 'content', 'createdAt', 'expiredAt']
    }]
  }).then(function(user) {
    if (user) {
      return res.json(user);
    } else {
      return res.sendStatus(404);
    }
  }).catch(function(err) {
    return res.status(400).send(err);
  });
};

exports.update = function(req, res) {
  // TODO
};

/**
 * Follow a user by posting the username.
 *
 * eg:
 * {
 *   follow: 'username'
 * }
 *
 */
exports.follow = function(req, res) {
  var uid = req.session.user;

  if (!req.body.follow) {
    return res.sendStatus(403);
  }

  if (uid) {
    console.log(req.body);
    db.User.follow(req.body.follow, uid).then(function(user) {
      return res.send(201, 'followed');
    }, function(err) {
      return res.status(500).send(err);
    });
  } else {
    return res.sendStatus(401);
  }
};
