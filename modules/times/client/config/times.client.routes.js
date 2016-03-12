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
          pageTitle: 'Times List'
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
          pageTitle : 'Times Create'
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
          pageTitle: 'Edit Time {{ timeResolve.title }}'
        }
      });
  }

  getTime.$inject = ['$stateParams', 'TimesService'];

  function getTime($stateParams, TimesService) {
    return TimesService.get({
      timeId: $stateParams.timeId
    }).$promise;
  }

  newTime.$inject = ['TimesService'];

  function newTime(TimesService) {
    return new TimesService();
  }
})();
