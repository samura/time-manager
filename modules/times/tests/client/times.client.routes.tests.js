(function () {
  'use strict';

  describe('Times Route Tests', function () {
    // Initialize global variables
    var $scope,
      timesService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _TimesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      timesService = _TimesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('times');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/times');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('times.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have template', function () {
          expect(liststate.templateUrl).toBe('modules/times/client/views/list-times.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          TimesController,
          mockTime;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('times.create');
          $templateCache.put('modules/times/client/views/form-time.client.view.html', '');

          // create mock time
          mockTime = new (timesService(null))();

          //Initialize Controller
          TimesController = $controller('TimesController as vm', {
            $scope: $scope,
            timeResolve: mockTime
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.timeResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/times/create');
        }));

        it('should attach an time to the controller scope', function () {
          expect($scope.vm.time._id).toBe(mockTime._id);
          expect($scope.vm.time._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/times/client/views/form-time.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          TimesController,
          mockTime;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('times.edit');
          $templateCache.put('modules/times/client/views/form-time.client.view.html', '');

          // create mock time
          mockTime = new (timesService(null))({
            _id: '525a8422f6d0f87f0e407a33',
            notes: 'notes',
            date: new Date().toISOString(),
            hours: 1.2
          });

          //Initialize Controller
          TimesController = $controller('TimesController as vm', {
            $scope: $scope,
            timeResolve: mockTime
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:timeId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.timeResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            timeId: 1
          })).toEqual('/times/1/edit');
        }));

        it('should attach an time to the controller scope', function () {
          expect($scope.vm.time._id).toBe(mockTime._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/times/client/views/form-time.client.view.html');
        });
      });
      
      describe('Export Route', function () {
        var exportstate,
          TimesController,
          mockTime;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          exportstate = $state.get('times.export');
          $templateCache.put('modules/times/client/views/export-times.client.view.html', '');

          //Initialize Controller
          TimesController = $controller('TimesExportController as vm', {
            $scope: $scope
          });
        }));

        it('Should have the correct URL', function () {
          expect(exportstate.url).toEqual('/export');
        });

        it('Should not be abstract', function () {
          expect(exportstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(exportstate.templateUrl).toBe('modules/times/client/views/export-times.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope) {
          $state.go('times.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('times/');
          $rootScope.$digest();

          expect($location.path()).toBe('/times');
          expect($state.current.templateUrl).toBe('modules/times/client/views/list-times.client.view.html');
        }));
      });

    });
  });
})();
