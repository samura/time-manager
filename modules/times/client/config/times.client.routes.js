(function () {
  'use strict';

  angular
    .module('times.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('times', {
        abstract: true,
        url: '/times',
        template: '<ui-view/>'
      })
      .state('times.list', {
        url: '',
        templateUrl: 'modules/times/client/views/list-times.client.view.html',
        controller: 'TimesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Times'
        }
      })
      .state('times.export', {
        url: '/export',
        templateUrl: 'modules/times/client/views/export-times.client.view.html',
        controller: 'TimesExportController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Export Times'
        }
      })
      .state('times.create', {
        url: '/create',
        templateUrl: 'modules/times/client/views/form-time.client.view.html',
        controller: 'TimesController',
        controllerAs: 'vm',
        resolve: {
          timeResolve: newTime
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Create Time Entry'
        }
      })
      .state('times.edit', {
        url: '/:timeId/edit',
        templateUrl: 'modules/times/client/views/form-time.client.view.html',
        controller: 'TimesController',
        controllerAs: 'vm',
        resolve: {
          timeResolve: getTime
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Time Entry'
        }
      });
  }

  getTime.$inject = ['$stateParams', 'TimesService'];

  function getTime($stateParams, timesService) {
    return timesService(null).get({
      timeId: $stateParams.timeId
    }).$promise;
  }

  newTime.$inject = ['TimesService'];

  function newTime(timesService) {
    
    var date = new Date();
    date.setHours(2);
    
    return new (timesService(null))({ date: date });
  }
})();
