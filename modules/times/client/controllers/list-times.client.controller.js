(function () {
  'use strict';

  angular
    .module('times')
    .controller('TimesListController', TimesListController);

  TimesListController.$inject = ['TimesService', 'Authentication', '$state', '$timeout'];

  function TimesListController(timesService, Authentication, $state, $timeout) {
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
    vm.humanTime = humanTime;
    
    // check success message
    $timeout(function(){
      vm.successMsg = $state.current.data.successMsg;
      // dismiss message
      $timeout(function() { delete vm.successMsg; }, 5000);
    });
    
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

        $state.reload().then(function (state) {
          state.data.successMsg = 'Time time was deleted successfully.';
        });
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
    
    function humanTime(hours) {
      var fHours = Math.floor(hours);
      var fMinutes = hours*60%60;
      
      var ret = fHours + ' hours';
      if(fMinutes > 0) {
        ret += ' and ' + fMinutes + ' minutes';
      }
      
      return ret;
    }
    
    getTimes();
  }
})();
