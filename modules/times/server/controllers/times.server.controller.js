'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Time = mongoose.model('Time'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a time
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

  res.json(time);
};

/**
 * Update a time
 */
exports.update = function (req, res) {
  var time = req.time;

  time.hours = req.body.hours;
  time.notes = req.body.notes;
  time.date = req.body.date;

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
 * Delete a time
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
  
  var filter = {};
  
  // if not admin or manager, you can only get what is yours
  if(req.user.roles.indexOf('admin') === -1 && req.user.roles.indexOf('manager') === -1) {
    filter.user = mongoose.Types.ObjectId(req.user.id);
  }
  
  Time.find(filter).sort('-created').populate('user', 'displayName').exec(function (err, times) {
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
