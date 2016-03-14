(function () {
  'use strict';

  angular
    .module('times.services')
    .factory('TimesService', TimesService);

  TimesService.$inject = ['$resource'];

  var paginationAndTotalsCallback;
  
  function TimesService($resource) {
    return function(callback) {

      // this moves the pagination and totals out of the $resource information, directly to the controller
      paginationAndTotalsCallback = callback;
      
      return $resource('api/times/:timeId', {
        timeId: '@_id'
      }, {
        get: {
          method: 'GET', 
          transformResponse: transformDate
        },
        export: {
          method: 'GET',
          url: 'api/times/export',
          isArray: true
        },
        query: {
          method: 'GET',
          isArray: true,
          transformResponse: storePagination
        },
        update: {
          method: 'PUT',
          transformResponse: transformDate
        },
        save: {
          method: 'POST',
          transformResponse: transformDate
        }
      });
    };
  }

  /**
   * Converts the date string to a date object
   */
  function transformDate(response) {
    
    var data = JSON.parse(response);
    data.date = new Date(data.date);
    
    return data;
  }
  
  /**
   * move the pagination and totals directly to the controller
   * if this was not done, it screws the $resource
   */
  function storePagination(response) {
    var data = JSON.parse(response);
    
    // 
    var pagination = {
      total: data.total,
      limit: data.limit,
      page: data.page,
      pages: data.pages
    };    
    paginationAndTotalsCallback(pagination, data.dayTotals);
    
    // return only the documents
    return data.docs;
  }
})();
