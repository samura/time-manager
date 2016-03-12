(function () {
  'use strict';

  angular
    .module('times')
    .controller('TimesListController', TimesListController);

  TimesListController.$inject = ['TimesService', 'Authentication'];

  function TimesListController(TimesService, Authentication) {
    var vm = this;

    vm.times = TimesService.query();
    vm.isAdmin = Authentication.user.roles.indexOf('admin') !== -1;
    vm.isManager = Authentication.user.roles.indexOf('manager') !== -1;
  }
})();
