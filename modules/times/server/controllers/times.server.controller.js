'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Time = mongoose.model('Time'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an time
 */
exports.create = function (req, res) {
  var time = new Time(req.body);
  time.user = req.user;

  time.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(time);
    }
  });
};

/**
 * Show the current time
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var time = req.time ? req.time.toJSON() : {};

  // Add a custom field to the Time, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Time model.
  time.isCurrentUserOwner = req.user && time.user && time.user._id.toString() === req.user._id.toString() ? true : false;

  res.json(time);
};

/**
 * Update an time
 */
exports.update = function (req, res) {
  var time = req.time;

  time.title = req.body.title;
  time.content = req.body.content;

  time.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(time);
    }
  });
};

/**
 * Delete an time
 */
exports.delete = function (req, res) {
  var time = req.time;

  time.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(time);
    }
  });
};

/**
 * List of Times
 */
exports.list = function (req, res) {
  Time.find().sort('-created').populate('user', 'displayName').exec(function (err, times) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(times);
    }
  });
};

/**
 * Time middleware
 */
exports.timeByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Time is invalid'
    });
  }

  Time.findById(id).populate('user', 'displayName').exec(function (err, time) {
    if (err) {
      return next(err);
    } else if (!time) {
      return res.status(404).send({
        message: 'No time with that identifier has been found'
      });
    }
    req.time = time;
    next();
  });
};
