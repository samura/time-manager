(function (app) {
  'use strict';

  app.registerModule('times', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('times.services');
  app.registerModule('times.routes', ['ui.router', 'times.services']);
})(ApplicationConfiguration);
