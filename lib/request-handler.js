var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  db.Link.find(function(err, results) {
    if (err) {
      console.log('error fetching links:', err);
      return res.send(404);
    } else {
      res.send(200, results);
    }
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }


  db.Link.findOne({ 'url': uri }, function(err, result) {
    if (err) return console.error(err);
    if (result) {
      res.send(200, result);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new db.Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.shortenUrl();
        link.save(function(err, success) {
          if (err) {
            console.log('error saving link:', err);
            res.send(404);
          } else {
            console.log('link successfully saved');
            res.send(200, success);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({ 'username': username }, function(err, user) {
    if (err) return console.error(err);
    if(!user) {
      console.log('User not found');
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({ 'username': username }, function(err, found) {
    console.log('found user:', found);
    if (err) return console.error(err);
    if (!found) {
      var user = new db.User({
        username: username
      });
      user.hashPassword(password).then(function() {
        user.save(function(err, success) {
          if (err) console.error(err);
          console.log('user saved:', success);
        });
      });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  db.Link.findOne({ 'code': req.params[0] }, function(err, found) {
    if (!found) {
      res.redirect('/');
    } else {
      found.visits = found.visits + 1;
      found.save(function(err, success) {
        if (err) {
          console.log('error saving link:', err);
          res.send(404);
        } else {
          res.redirect(success.url);
        }
      });
    }
  });
};
