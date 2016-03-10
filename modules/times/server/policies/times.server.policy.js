'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Times Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/times',
      permissions: '*'
    }, {
      resources: '/api/times/:timeId',
      permissions: '*'
    }]
  }, {
    roles: ['manager'],
    allows: [{
      resources: '/api/times',
      permissions: '*'
    }, {
      resources: '/api/times/:timeId',
      permissions: ['get']
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/times',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If Times Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If a time is being processed and the current user/admin created it then allow any manipulation
  if (req.time && req.user && req.time.user && (req.time.user.id === req.user.id || req.user.roles.indexOf('admin') !== -1)) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
