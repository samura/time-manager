(function () {
  'use strict';

  describe('Times Controller Tests', function () {
    // Initialize global variables
    var TimesController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      timesService,
      mockTime;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _TimesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      timesService = _TimesService_;

      // create mock time
      mockTime = new (timesService(null))({
        _id: '525a8422f6d0f87f0e407a33',
        notes: 'notes',
        hours: 1.2,
        date: new Date().toISOString()
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Times controller.
      TimesController = $controller('TimesController as vm', {
        $scope: $scope,
        timeResolve: {}
      });

      //Spy on state go
      spyOn($state, 'go').and.callThrough();
    }));

    describe('vm.save() as create', function () {
      var sampleTimePostData;

      beforeEach(function () {
        // Create a sample time object
        sampleTimePostData = new (timesService(null))({
          notes: 'notes',
          hours: 1.2,
          date: new Date().toISOString()
        });

        $scope.vm.time = sampleTimePostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (TimesService) {
        // Set POST response
        $httpBackend.expectPOST('api/times', sampleTimePostData).respond(JSON.stringify(mockTime));

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the time was created
        expect($state.go).toHaveBeenCalledWith('times.list');
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/times', sampleTimePostData).respond(400, JSON.stringify({
          message: errorMessage
        }));

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock time in $scope
        $scope.vm.time = mockTime;
      });

      it('should update a valid time', inject(function (TimesService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/times\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('times.list');
      }));

      it('should set $scope.vm.error if error', inject(function (TimesService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/times\/([0-9a-fA-F]{24})$/).respond(400, JSON.stringify({
          message: errorMessage
        }));

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });
  });
})();
