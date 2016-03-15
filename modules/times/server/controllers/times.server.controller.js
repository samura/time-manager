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
  
  Time.paginate(req.filters, { limit: req.itemsPerPage, page: req.page, sort: '-date', populate: [{path: 'user', select: 'displayName workingHoursPerDay'}] }, function (err, result) {
    
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
      
    if(!result.docs.length) {
      return res.json(result);
    }
      
    // get the sums for each day, only for the results on .paginate()
    // the high needs to be cloned to work if length == 1
    var dateLow = result.docs[result.docs.length-1].date,
      dateHigh = new Date(result.docs[0].date.getTime());

    dateLow.setMilliseconds(0);
    dateLow.setSeconds(0);
    dateLow.setMinutes(0);
    dateLow.setHours(0);

    dateHigh.setMilliseconds(99);
    dateHigh.setSeconds(59);
    dateHigh.setMinutes(59);
    dateHigh.setHours(23);

    req.filters.date = {
      $gte: dateLow,
      $lte: dateHigh
    };

    // adds the sums for each day for each selected user
    Time.aggregate([
      { $match: req.filters },
      { $group: {
        _id: { date: { $dateToString: { format: '%d/%m/%Y', date: '$date' } }, user: '$user' },
        time: { $sum: '$hours' },
      } }
    ], function (err, timeSums) {

      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      var dayTotals = {};
      timeSums.forEach(function (timeSum) {
        if(typeof dayTotals[timeSum._id.user] === 'undefined') {
          dayTotals[timeSum._id.user] = {};
        }

        dayTotals[timeSum._id.user][timeSum._id.date] = timeSum.time;

      });
      result.dayTotals = dayTotals;
      
      // adds a flag to know if a user can be edited/removed
      result.docs = result.docs.map(function(time) {
        time.canChange = req.user.roles.indexOf('admin') !== -1 || req.user._id.equals(time.user._id);

        return time;
      });
      
      res.json(result);
    });
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
      hours: { $sum: '$hours' },
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
      
      // move properties outside the _id
      times.forEach(function (time) {
        time.date = time._id.date;
        time.user = time._id.user;
        delete time._id;
      });
      
      res.json(times);
    });
  });
};

/**
 * sets the query filters based on the request
 */
exports.filters = function(req, res, next) {
  var filters = {};
  
  if(typeof req.query.filters !== 'undefined') {
    var reqFilters = JSON.parse(req.query.filters);
    
    // makes sures that at least one of the filters is not undefined
    // this way we dont create an emptu date: {} which returns no result
    if(typeof reqFilters.date !== 'undefined' && (typeof reqFilters.date.from !== 'undefined' || typeof reqFilters.date.to !== 'undefined')) {
      filters.date = {};

      if(typeof reqFilters.date.from !== 'undefined') {
        filters.date.$gte = new Date(reqFilters.date.from);
        filters.date.$gte.setMilliseconds(0);
        filters.date.$gte.setSeconds(0);
        filters.date.$gte.setMinutes(0);
        filters.date.$gte.setHours(0);
      }
      if(typeof reqFilters.date.to !== 'undefined') {
        filters.date.$lte = new Date(reqFilters.date.to);
        filters.date.$lte.setMilliseconds(99);
        filters.date.$lte.setSeconds(59);
        filters.date.$lte.setMinutes(59);
        filters.date.$lte.setHours(23);
      }
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