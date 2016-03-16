(function(){
  'use strict';

  angular
    .module('users.admin')
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', '$state', 'Authentication', 'userResolve'];

  function UserController ($scope, $state, Authentication, userResolve) {
    var vm = this;
    
    vm.authentication = Authentication;
    vm.user = userResolve;
    vm.update = update;
    // list of roles for the select
    vm.roles = ['user', 'manager', 'admin'];

    // save the user information
    function update (isValid) {
      // show errors if not valid
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = vm.user;

      // save using the $resource
      user.$update(function () {
        $state.go('admin.users').then(function(state) {
          // send the success message to the next controller
          state.data.successMsg = 'The user was saved successfully.';
        });
      }, function (errorResponse) {
        vm.error = errorResponse.data.message;
      });
    }
  }
})();