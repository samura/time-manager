(function () {
  'use strict';

  angular
    .module('times')
    .controller('TimesExportController', TimesListController);

  TimesListController.$inject = ['TimesService', 'Authentication', '$state'];

  function TimesListController(timesService, Authentication, $state) {
    var vm = this;

    if(Authentication.user) {
      vm.isAdmin = Authentication.user.roles.indexOf('admin') !== -1;
      vm.isManager = Authentication.user.roles.indexOf('manager') !== -1;
    }
    
    vm.filters = {
      date: {}
    };
    vm.getTimes = getTimes;
    
    function getTimes(page) {
      vm.times = timesService(null).export({ filters: vm.filters });
    }
    
    getTimes();
  }
})();
