'use strict';

/**
 * Module dependencies
 */
var timesPolicy = require('../policies/times.server.policy'),
  times = require('../controllers/times.server.controller');

module.exports = function (app) {
  // Times collection routes
  app.route('/api/times').all(timesPolicy.isAllowed)
    .get(times.list)
    .post(times.create);

  // Single time routes
  app.route('/api/times/:timeId').all(timesPolicy.isAllowed)
    .get(times.read)
    .put(times.update)
    .delete(times.delete);

  // Finish by binding the time middleware
  app.param('timeId', times.timeByID);
};
