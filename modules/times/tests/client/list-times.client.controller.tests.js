(function () {
  'use strict';

  describe('Times List Controller Tests', function () {
    // Initialize global variables
    var TimesListController,
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
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _TimesService_, $q) {
      // Set a new global scope
      $scope = $rootScope.$new();
      var deferred = $q.defer();

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
        date: new Date(0).toISOString(),
        user: {
          _id: '123123123',
          displayName: 'user',
          workingHoursPerDay: 3
        }
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user', 'admin']
      };

      // Initialize the Times List controller.
      TimesListController = $controller('TimesListController as vm', {
        $scope: $scope
      });

      //Spy on state go
      spyOn($state, 'go');
      spyOn($state, 'reload').and.returnValue(deferred.promise);
    }));

    describe('Instantiate', function () {
      var mockTimeList,
        mockTimeList2;

      beforeEach(function () {
        mockTimeList = {
          total: 12,
          limit: 4,
          page: 1,
          pages: 3,
          docs: [mockTime, mockTime, mockTime, mockTime],
          dayTotals: {
            123123123: { '01/01/1970': 3.4 }
          }
        };
        mockTimeList2 = {
          total: 12,
          limit: 4,
          page: 2,
          pages: 3,
          docs: [mockTime, mockTime]
        };
      });

      it('should send a GET request and return all times', inject(function (TimesService) {
        // Set GET response
        $httpBackend.expectGET('api/times?filters=%7B%22date%22:%7B%7D%7D').respond(JSON.stringify(mockTimeList));
        
        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.times.length).toEqual(4);
        expect($scope.vm.pagination.total).toEqual(mockTimeList.total);
        expect($scope.vm.pagination.limit).toEqual(mockTimeList.limit);
        expect($scope.vm.pagination.page).toEqual(mockTimeList.page);
        expect($scope.vm.pagination.pages).toEqual(mockTimeList.pages);
        expect($scope.vm.times[0]._id).toEqual(mockTime._id);
        expect($scope.vm.times[1]._id).toEqual(mockTime._id);
      }));
      
      it('should change to the second page', inject(function (TimesService) {
        // Set GET response
        $httpBackend.expectGET('api/times?filters=%7B%22date%22:%7B%7D%7D').respond(JSON.stringify(mockTimeList));
        $httpBackend.flush();

        expect($scope.vm.pagination.page).toEqual(1);
        
        $scope.vm.pagination.page = 2;
        $scope.vm.pageChanged();
        
        $httpBackend.expectGET('api/times?filters=%7B%22date%22:%7B%7D%7D&p=2').respond(JSON.stringify(mockTimeList2));
        $httpBackend.flush();
        
        expect($scope.vm.pagination.page).toEqual(2);
        expect($scope.vm.times.length).toEqual(2);
      }));
      
      it('should use the filters', inject(function (TimesService) {
        // Set GET response
        $httpBackend.expectGET('api/times?filters=%7B%22date%22:%7B%7D%7D').respond(JSON.stringify(mockTimeList2));
        $httpBackend.flush();

        expect($scope.vm.times.length).toEqual(2);
        
        // page is ignored and back to one
        $scope.vm.pagination.page = 2;
        $scope.vm.filters.date = {
          from: new Date(0),
          to: new Date(0)
        };
        $scope.vm.getTimes();
        
        $httpBackend.expectGET('api/times?filters=%7B%22date%22:%7B%22from%22:%221970-01-01T00:00:00.000Z%22,%22to%22:%221970-01-01T00:00:00.000Z%22%7D%7D').respond(JSON.stringify(mockTimeList));
        $httpBackend.flush();

        expect($scope.vm.pagination.page).toEqual(1);
        expect($scope.vm.times.length).toEqual(4);
      }));
      
      it('should return a float time into hours and minutes', inject(function (TimesService) {
        // Set GET response
        $httpBackend.expectGET('api/times?filters=%7B%22date%22:%7B%7D%7D').respond(JSON.stringify(mockTimeList2));
        $httpBackend.flush();

        expect($scope.vm.humanTime(2.75)).toEqual('2 hours and 45 minutes');
        expect($scope.vm.humanTime(3)).toEqual('3 hours');
      }));
      
      it('should return success/danger if a user has/has not done enough hours', inject(function (TimesService) {
        // Set GET response
        $httpBackend.expectGET('api/times?filters=%7B%22date%22:%7B%7D%7D').respond(JSON.stringify(mockTimeList));
        $httpBackend.flush();

        expect($scope.vm.enoughHours(mockTime)).toEqual('success');
        
        mockTime.user.workingHoursPerDay = 4;
        expect($scope.vm.enoughHours(mockTime)).toEqual('danger');
      }));
      
      it('should detect if current user is admin but not manager', inject(function (TimesService) {
        
        // Set GET response
        $httpBackend.expectGET('api/times?filters=%7B%22date%22:%7B%7D%7D').respond(JSON.stringify(mockTimeList));
        $httpBackend.flush();

        expect($scope.vm.isAdmin).toEqual(true);
        expect($scope.vm.isManager).toEqual(false);
      }));
      
      
      it('should delete the time and redirect to times', function () {
        
        // Set GET response
        $httpBackend.expectGET('api/times?filters=%7B%22date%22:%7B%7D%7D').respond(JSON.stringify(mockTimeList));
        $httpBackend.flush();
        
        //Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/times\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove(mockTime);
        $httpBackend.flush();

        expect($state.reload);
      });

      it('should should not delete the time and not redirect', function () {
        //Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove(mockTime);

        expect($state.reload).not.toHaveBeenCalled();
      });
    });
  });
})();