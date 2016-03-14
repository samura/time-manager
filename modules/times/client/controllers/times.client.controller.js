(function () {
  'use strict';

  angular
    .module('times')
    .controller('TimesController', TimesController);

  TimesController.$inject = ['$scope', '$state', 'timeResolve', 'Authentication'];

  function TimesController($scope, $state, time, Authentication) {
    var vm = this;
    
    vm.time = time;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.save = save;

    // Save Time
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.timeForm');
        return false;
      }

      if (vm.time._id) {
        vm.time.$update(successCallback, errorCallback);
      } else {
        vm.time.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('times.list');
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
