(function () {
  'use strict';

  angular
    .module('times')
    .controller('TimesListController', TimesListController);

  TimesListController.$inject = ['TimesService', 'Authentication', '$state'];

  function TimesListController(timesService, Authentication, $state) {
    var vm = this;

    if(Authentication.user) {
      vm.isAdmin = Authentication.user.roles.indexOf('admin') !== -1;
      vm.isManager = Authentication.user.roles.indexOf('manager') !== -1;
    }
    vm.enoughHours = enoughHours;
    vm.remove = remove;
    vm.pageChanged = pageChanged;
    vm.filters = {
      date: {}
    };
    vm.getTimes = getTimes;
    
    function enoughHours(time) {
      
      // get the right format for the date
      var dateObj = new Date(time.date);
      var date = ('0' + dateObj.getDate()).slice(-2) + '/' +
        ('0' + (dateObj.getMonth()+1)).slice(-2) + '/' +
        dateObj.getFullYear();

      
      return time.user.workingHoursPerDay <= vm.totals[time.user._id][date] ? 'success': 'danger';
    }
    
    // Remove existing Time
    function remove (time) {
      if (confirm('Are you sure you want to delete this time?')) {
        time.$remove();

        $state.reload();
      }
    }
    
    function pageChanged() {
      getTimes(vm.pagination.page);
    }
    
    function getTimes(page) {
      vm.times = timesService(paginationAndTotalsCallback).query({ p: page, filters: vm.filters });
    }
    
    function paginationAndTotalsCallback (pagination, totals) {
      vm.pagination = pagination;
      vm.totals = totals;
    }
    
    getTimes();
  }
})();
