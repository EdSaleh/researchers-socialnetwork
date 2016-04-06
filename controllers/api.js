var _ = require('lodash');
var async = require('async');
var s3 = require('./../config/s3');
var db = require('./../config/db');

/**
* Split into declaration and initialization for better startup performance.
*/
var validator;
var cheerio;
var graph;
var Github;
var Linkedin;
var request;

/**
* GET /api/facebook
* Facebook API example.
*/
exports.getFacebook = function(req, res, next) {
  graph = require('fbgraph');

  var token = _.find(req.user.tokens, { kind: 'facebook' });
  graph.setAccessToken(token.accessToken);
  async.parallel({
    getMe: function(done) {
      graph.get(req.user.facebook + "?fields=id,name,email,first_name,last_name,gender,link,locale,timezone", function(err, me) {
        done(err, me);
      });
    },
    getMyFriends: function(done) {
      graph.get(req.user.facebook + '/friends', function(err, friends) {
        done(err, friends.data);
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/facebook', {
      title: 'Facebook API',
      me: results.getMe,
      friends: results.getMyFriends
    });
  });
};


/**
* GET /api/github
* GitHub API Example.
*/
exports.getGithub = function(req, res, next) {
  Github = require('github-api');

  var token = _.find(req.user.tokens, { kind: 'github' });
  var github = new Github({ token: token.accessToken });
  var repo = github.getRepo('sahat', 'requirejs-library');
  repo.show(function(err, repo) {
    if (err) {
      return next(err);
    }
    res.render('api/github', {
      title: 'GitHub API',
      repo: repo
    });
  });

};


/**
* GET /api/linkedin
* LinkedIn API example.
*/
exports.getLinkedin = function(req, res, next) {
  Linkedin = require('node-linkedin')(process.env.LINKEDIN_ID, process.env.LINKEDIN_SECRET, process.env.LINKEDIN_CALLBACK_URL);

  var token = _.find(req.user.tokens, { kind: 'linkedin' });
  var linkedin = Linkedin.init(token.accessToken);
  linkedin.people.me(function(err, $in) {
    if (err) {
      return next(err);
    }
    res.render('api/linkedin', {
      title: 'LinkedIn API',
      profile: $in
    });
  });
};



exports.getFileUpload = function(req, res, next) {
  res.render('upload', {});
};

exports.postFileUpload = function(req, res, next) {
  db.saveFile(req.body.fileName, JSON.stringify(req.files[0].path));
  db.findFile(req.body.fileName, JSON.stringify(req.files[0].path), function(result) {
    s3.upload(JSON.stringify(result[0]._id), "uploads/" + req.files[0].filename, function(url) {
      db.addFileUrl(result[0]._id, url);
      req.flash('success', { msg: 'File was uploaded successfully.' });
      res.render("uploaded", {
        file: url
      });
    });
  });
};
