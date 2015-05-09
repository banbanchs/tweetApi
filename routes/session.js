var User = require('../models').User;

// Create new session
exports.new = function(req, res) {
  if (!req.body.name || !req.body.password) {
    return res.status(400).send('Please input username and password');
  }

  User.authenticate(req.body.name, req.body.password, function(err, user) {
    if (user) {
      // Regenerate session when signing in to prevent fixation
      req.session.regenerate(function() {
        // Store the user's _id in the session store to be retrieved
        req.session.user = user.id;
        console.log('User ' + user.name + 'logged in');
        req.session.success = 'Authenticated as ' + user.name;
        return res.json({
          'email': user.email,
          'name': user.name,
          '_id': user.id
        });
      });
    } else {
      console.log('Unauthanticated access');
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.';
      return res.status(422).send('Wrong Credentials');
    }
  });
};

// Destroy session
exports.destroy = function(req, res) {
  req.session.destroy();
  console.log('User logged out');
  return res.sendStatus(200);
};

// Current session information

exports.ping = function(req, res) {
  if (req.session.user) {
    User.find({where: {id: req.session.user}}).then(function(user) {
      return res.json({
        "email": user.email,
        "name": user.name,
        "_id": user.id
      });
    }); // User logged in.
  } else {
    // User not logged in. Client logic (Showing login page) handled by Angularjs.
    return res.sendStatus(401);
  }
};
