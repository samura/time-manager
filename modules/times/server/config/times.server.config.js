'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  config = require(path.resolve('./config/config'));

/**
 * Module init function.
 */
module.exports = function (app, db) {

  app.use(function (req, res, next) {
    // sends the configuration information to the controller
    req.itemsPerPage = app.locals.itemsPerPage;
    
    return next();
  });
};
