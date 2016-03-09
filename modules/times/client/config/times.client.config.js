(function () {
  'use strict';

  angular
    .module('times')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Times',
      state: 'times',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'times', {
      title: 'List Times',
      state: 'times.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'times', {
      title: 'Create Time',
      state: 'times.create',
      roles: ['user']
    });
  }
})();
