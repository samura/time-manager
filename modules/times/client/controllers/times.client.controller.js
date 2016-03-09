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
    vm.remove = remove;
    vm.save = save;

    // Remove existing Time
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.time.$remove($state.go('times.list'));
      }
    }

    // Save Time
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.timeForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.time._id) {
        vm.time.$update(successCallback, errorCallback);
      } else {
        vm.time.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('times.view', {
          timeId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
