(function () {
  'use strict';

  describe('Times Export Controller Tests', function () {
    // Initialize global variables
    var TimesExportController,
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
    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_, _Authentication_, _TimesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      Authentication = _Authentication_;
      timesService = _TimesService_;

      // create mock time
      mockTime = new (timesService(null))({
        date: '09/03/2016',
        hours: 3.4,
        notes: ['note1', 'note2'],
        user: {
          _id: '56e81c787b38a548d1906fb6',
          displayName: 'Manager Local'
        } 
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Times List controller.
      TimesExportController = $controller('TimesExportController as vm', {
        $scope: $scope
      });
    }));

    describe('Instantiate', function () {
      var mockDayTotals;

      beforeEach(function () {
        mockDayTotals = [mockTime, mockTime];
      });

      it('should send a GET request and return the exported times', inject(function (TimesService) {
        // Set GET response
        $httpBackend.expectGET('api/times/export?filters=%7B%22date%22:%7B%7D%7D').respond(mockDayTotals);
        
        $httpBackend.flush();

        expect($scope.vm.times.length).toEqual(2);
        expect($scope.vm.times[0]._id).toEqual(mockTime._id);
        expect($scope.vm.times[1]._id).toEqual(mockTime._id);
      }));
      
      it('should use the filters', inject(function (TimesService) {
        // Set GET response
        $httpBackend.expectGET('api/times/export?filters=%7B%22date%22:%7B%7D%7D').respond(mockDayTotals);
        $httpBackend.flush();

        expect($scope.vm.times.length).toEqual(2);        
        
        $scope.vm.filters.date = {
          from: new Date(0),
          to: new Date(0)
        };
        $scope.vm.getTimes();
        
        $httpBackend.expectGET('api/times/export?filters=%7B%22date%22:%7B%22from%22:%221970-01-01T00:00:00.000Z%22,%22to%22:%221970-01-01T00:00:00.000Z%22%7D%7D').respond(JSON.stringify(mockDayTotals));
        $httpBackend.flush();

        expect($scope.vm.times.length).toEqual(2);
      }));
    });
  });
})();