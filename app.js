/**
 * Module
 *
 */
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var api = {
  user: require('./routes/user'),
  session: require('./routes/session'),
  tweet: require('./routes/tweet')
};

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('test'));
app.use(session({
  store: new RedisStore({host: '127.0.0.1', port: 6379}),
  secret: 'test'
}));

/*
 * Function for Restricting access to logged in users
 */

var restrict = function (req, res, next) {
  var exeptions = ['login', 'logout', 'home']; // define exceptions to the restriction
  var name = req.params.name;

  if (exeptions.indexOf(name) != -1) { // check for exception to the restriction
    next();
  } else {
    if (req.session.user) {
      console.log(('User with id ' + req.session.user+ ' authorized to view this page').green);
      next();
    } else {
      req.session.error = 'Access denied!';
      console.log(('Unauthorized access from ip adress: ' + req.ip).red);
      res.send(401);
    }
  }
};



/**
 * Routes
 *
 */

/**
 * Session
 *
 */

app.get('/session/ping', api.session.ping);
app.post('/session/new', api.session.new);
app.delete('/session/destroy', api.session.destroy);


/**
 * User
 *
 */

app.get('/api/users/:id', api.user.findUserById);
app.get('/api/currentuser', api.user.currentUser);
app.post('/api/users', api.user.create);
app.post('/api/users/follow', api.user.follow);
app.put('/api/users/:id', api.user.update);

/**
 * Tweet
 *
 */

app.get('/api/timeline', api.tweet.getTimeline);
app.get('/api/tweets', api.tweet.getTimeline);
app.get('/api/tweets/:id', api.tweet.getTweet);
app.post('/api/tweets', api.tweet.createTweet);
app.delete('/api/tweets/:id', api.tweet.deleteTweet);

app.listen(5010, function() {
  console.log('Server listening at %s:%s', this.address().address, this.address().port);
});
