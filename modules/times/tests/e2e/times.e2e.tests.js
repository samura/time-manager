'use strict';

describe('Times E2E Tests:', function () {
  
  var signout = function () {
    // Make sure user is signed out first
    browser.get('http://localhost:3001/authentication/signout');
    // Delete all cookies
    browser.driver.manage().deleteAllCookies();
  };
  
  describe('Test normal user interaction with times', function () {
    
    it('Should not allow to view the times without login', function () {
      browser.get('http://localhost:3001/times');
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/authentication/signin');
    });
    
    it('Should see a list of the available times once logged in as user', function () {
      element(by.model('credentials.username')).sendKeys('user');
      element(by.model('credentials.password')).sendKeys('Temporary$4');
      element(by.css('button[type=submit]')).click();
      
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times');
      
      expect(element.all(by.css('table tr.success')).count()).toEqual(4);
      expect(element.all(by.css('table tr.danger')).count()).toEqual(0);
      expect(element.all(by.css('table th')).count()).toEqual(4);
    });
    
    it('Should successfully edit a note', function () {
      element.all(by.css('td a.btn-primary')).get(0).click();
      
      element(by.model('vm.time.date')).clear().sendKeys('09/03/2020');
      element(by.model('vm.time.hours')).clear().sendKeys('0');
      element(by.css('button[type=submit]')).click();
      
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times');
      expect(element.all(by.css('table tr.success')).count()).toEqual(3);
      expect(element.all(by.css('table tr.danger')).count()).toEqual(1);
    });
    
    it('Should report errors on non valid fields', function(){
      // go to edit
      element.all(by.css('td a.btn-primary')).get(0).click();
      
      element(by.model('vm.time.date')).clear();
      element(by.model('vm.time.hours')).clear().sendKeys('-1-1');
      element(by.css('button[type=submit]')).click();
      
      expect(element.all(by.css('.error-text')).get(0).getText()).toBe('A date is required.');
      expect(element.all(by.css('.error-text')).get(1).getText()).toBe('A valid number of hours is required.'); 
    });
    
    it('Should go back from edit without saving', function () {
      // go back
      element(by.css('a.btn.btn-link')).click();
      
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times');
    });
    
    it('Should remove a time', function() {
      
      // delete an element
      element.all(by.css('td a.btn-danger')).get(2).click();
      browser.switchTo().alert().accept();

      expect(element.all(by.css('table tr.success')).count()).toEqual(2);
      expect(element.all(by.css('table tr.danger')).count()).toEqual(1);
    });
    
    it('Should add a time', function() {

      element(by.css('.btn-success')).click();
      element(by.model('vm.time.date')).clear().sendKeys('10/02/2016');
      element(by.model('vm.time.hours')).sendKeys(6);
      element(by.model('vm.time.notes')).sendKeys('new notes');
      element(by.css('button[type=submit]')).click();
      
      
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times');
      expect(element.all(by.css('table tr.success')).count()).toEqual(3);
      expect(element.all(by.css('table tr.danger')).count()).toEqual(1);
      
    });
    
    it('Should filter times', function() {
      
      // click on the filter to open the popup
      element(by.css('.page-header .btn-primary')).click();
      element(by.model('vm.filters.date.from')).sendKeys('10/02/2016');
      element(by.model('vm.filters.date.to')).sendKeys('10/02/2016');
      element(by.css('.panel button[type=submit]')).click();
      
      expect(element.all(by.css('table tr.success')).count()).toEqual(1);
      expect(element.all(by.css('table tr.danger')).count()).toEqual(0);
    });
    
    it('Should show export times', function() {
      
      // click on the export button on top
      element(by.css('.page-header .btn-info')).click();
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times/export');
      expect(element.all(by.css('table tr')).count()).toEqual(4);
      expect(element.all(by.css('table th')).count()).toEqual(3);
    });
    
    it('Should show export times with filters', function() {
      
      element(by.css('.page-header .btn-primary')).click();
      element(by.model('vm.filters.date.from')).sendKeys('10/02/2016');
      element(by.model('vm.filters.date.to')).sendKeys('10/02/2016');
      element(by.css('.panel button[type=submit]')).click();
      
      expect(element.all(by.css('table tr')).count()).toEqual(2);
    });
    
    it('Should go back to the times', function() {
      
      element(by.css('.page-header .btn-group .btn-default')).click();
      
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times');
      expect(element.all(by.css('table tr.success')).count()).toEqual(3);
      expect(element.all(by.css('table tr.danger')).count()).toEqual(1);
    });
  });
  
  
  describe('Test manager user interaction with times', function () {
        
    it('Should see a list of the available times once logged in as manager', function () {
      signout();
      browser.get('http://localhost:3001/times');
      element(by.model('credentials.username')).sendKeys('manager');
      element(by.model('credentials.password')).sendKeys('Temporary$4');
      element(by.css('button[type=submit]')).click();
      
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times');
      
      // should see users
      expect(element.all(by.css('table th')).count()).toEqual(5);
      // should see everyone
      expect(element.all(by.css('table tr.success')).count()).toEqual(5);
      expect(element.all(by.css('table tr.danger')).count()).toEqual(1);
      // should edit their own
      expect(element.all(by.css('table .glyphicon-pencil')).count()).toEqual(2);
      
    });
    
    it('Should show export times', function() {
      
      // click on the export button on top
      element(by.css('.page-header .btn-info')).click();
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times/export');
      expect(element.all(by.css('table tr')).count()).toEqual(5);
      expect(element.all(by.css('table th')).count()).toEqual(4);
    });
  });
  
  
  describe('Test admin user interaction with times', function () {
        
    it('Should see a list of the available times once logged in as admin', function () {
      signout();
      browser.get('http://localhost:3001/times');
      element(by.model('credentials.username')).sendKeys('admin');
      element(by.model('credentials.password')).sendKeys('Temporary$4');
      element(by.css('button[type=submit]')).click();
      
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times');
      
      // should see users
      expect(element.all(by.css('table th')).count()).toEqual(5);
      // should see everyone
      expect(element.all(by.css('table tr.success')).count()).toEqual(5);
      expect(element.all(by.css('table tr.danger')).count()).toEqual(1);
      // should edit their own
      expect(element.all(by.css('table .glyphicon-pencil')).count()).toEqual(6);
      
    });
    
    it('Should show export times', function() {
      
      // click on the export button on top
      element(by.css('.page-header .btn-info')).click();
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/times/export');
      expect(element.all(by.css('table tr')).count()).toEqual(5);
      expect(element.all(by.css('table th')).count()).toEqual(4);
    });
    
    it('Should signout at the end', function () {
      signout();
    });
  });
});
