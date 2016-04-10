var mongoose = require('mongoose');
var schemas = require('./../models/User');
var user = schemas.user;
var file = schemas.file;

var exports = module.exports = {};

exports.connect = function() {
    mongoose.connect(process.env.MONGODB || process.env.MONGOLAB_URI);
    mongoose.connection.on('error', function() {
        console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
        process.exit(1);
    });
};

exports.saveFile = function(name, location) {
    var upload = new file({
        filename: name,
        location: location
    });

    upload.save(function(err, saved) {
        if(err) {
            console.error(err);
        }

    });
};

exports.addFileUrl = function(id, url) {
    file.findById(id, function(err, found) {
        if(err) {
            console.error(err);
        }
        found.url = url;
        found.save(function (err, result) {
            if(err) {
              console.error(err);
            }
        })
    });
};

exports.findFile = function(name, loc, found) {
    file.find({filename: name, location: loc}, function (err, result) {
        if(err) {
            console.error(err);
        }
        found(result);
    });
};
