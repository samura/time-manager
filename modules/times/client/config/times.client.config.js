(function () {
  'use strict';

  angular
    .module('times')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Times',
      state: 'times.list',
      roles: ['*']
    });
  }
})();
