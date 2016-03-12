'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Time = mongoose.model('Time'),
  User = mongoose.model('User'),
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
  
  Time.paginate(req.filters, { page: req.page, sort: '-created', populate: ['user', 'displayName'] }, function (err, result) {
    
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
      
    // adds a flag to know if a user can be edited/removed
    result.docs = result.docs.map(function(time) {
      time.canChange = req.user.roles.indexOf('admin') !== -1 || req.user._id.equals(time.user._id);
      
      return time;
    });
    
    res.json(result);
  });
};

/**
 * Export each date information
 */
exports.export = function(req, res) {
  Time.aggregate([
    { $match: req.filters },
    { $group: {
      _id: { date: { $dateToString: { format: '%d/%m/%Y', date: '$date' } }, user: '$user' },
      time: { $sum: '$hours' },
      notes: { $push: '$notes' } } }
  ], function (err, times) {
    
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    
    // populate the results with the user's name
    User.populate(times, { path: '_id.user', select: 'displayName' }, function(err, times) {
    
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      
      res.json(times);
    });
  });
};

/**
 * sets the query filters based on the request
 */
exports.filters = function(req, res, next) {
  var filters = {};
  
  if(typeof req.query.date !== 'undefined') {
    filters.date = {};
    if(typeof req.query.date.before !== 'undefined') {
      filters.date.$lte = (new Date(req.query.date.before)).toISOString();
    }
    if(typeof req.query.date.after !== 'undefined') {
      filters.date.$gte = (new Date(req.query.date.after)).toISOString();
    }
  }
  
  // if not admin or manager, you can only get what is yours
  if(req.user.roles.indexOf('admin') === -1 && req.user.roles.indexOf('manager') === -1) {
    filters.user = mongoose.Types.ObjectId(req.user.id);
  }
  
  req.filters = filters;
  next();
};

/**
 * Sets the default page number
 */
exports.page = function(req, res, next) {
  req.page = typeof req.query.p !== 'undefined' ? req.query.p : 1;
  next();
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
