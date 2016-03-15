(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserListController', UserListController);

  UserListController.$inject = ['$scope', '$filter', 'Admin', '$state', '$timeout'];
  
  function UserListController ($scope, $filter, Admin, $state, $timeout) {
    var vm = this;
    vm.users = Admin.query();
    vm.remove = remove;

    // check success message
    $timeout(function(){
      vm.successMsg = $state.current.data.successMsg;
      // dismiss message
      $timeout(function() { delete vm.successMsg; }, 5000);
    });
    
    // Remove existing User
    function remove (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        user.$remove();

        $state.reload().then(function (state) {
          state.data.successMsg = 'Time user was deleted successfully.';
        });
      }
    }
  }
})();