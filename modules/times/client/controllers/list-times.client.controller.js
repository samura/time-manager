(function () {
  'use strict';

  angular
    .module('times')
    .controller('TimesListController', TimesListController);

  TimesListController.$inject = ['TimesService'];

  function TimesListController(TimesService) {
    var vm = this;

    vm.times = TimesService.query();
  }
})();
