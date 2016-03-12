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
      get: {
        method: 'GET',
        transformResponse: transformDate
      },
      update: {
        method: 'PUT',
        transformResponse: transformDate
      }
    });
  }

  function transformDate(response) {
    // convert the data object
    var data = JSON.parse(response);
    console.log(data);
    data.date = new Date(data.date);

    return data;
  }
})();
