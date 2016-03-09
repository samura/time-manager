(function () {
  'use strict';

  angular
    .module('times.services')
    .factory('TimesService', TimesService);

  TimesService.$inject = ['$resource'];

  function TimesService($resource) {
    return $resource('api/times/:timeId', {
      timeId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
