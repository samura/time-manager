'use strict';

describe('User Management E2E Tests:', function () {

  var signout = function () {
    // Make sure user is signed out first
    browser.get('http://localhost:3001/authentication/signout');
    // Delete all cookies
    browser.driver.manage().deleteAllCookies();
  };

  describe('Manage user with a "user" account', function () {
    
    it('Should not have access to user management', function () {
      browser.get('http://localhost:3001/authentication/signin');
      element(by.model('credentials.username')).sendKeys('user');
      element(by.model('credentials.password')).sendKeys('Temporary$4');
      element(by.css('button[type=submit]')).click();
      
      browser.get('http://localhost:3001/admin/users');
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/forbidden');
      
      signout();
    });
  });
  
  describe('Manage user with a "manager" account', function () {
    
    it('Should have access to user management', function () {
      browser.get('http://localhost:3001/authentication/signin');
      element(by.model('credentials.username')).sendKeys('manager');
      element(by.model('credentials.password')).sendKeys('Temporary$4');
      element(by.css('button[type=submit]')).click();
      
      browser.get('http://localhost:3001/admin/users');
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/admin/users');
    });
    
    it('Should be able to edit/delete any user except the admin', function () {
      browser.get('http://localhost:3001/admin/users');
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/admin/users');
      
      expect(element.all(by.css('table .glyphicon-pencil')).count()).toEqual(2);
      expect(element.all(by.css('table tr')).count()).toEqual(4);
    });
    
    it('Should report validation errors when editing a user', function () {
      element.all(by.css('td a.btn-primary')).get(1).click();
      
      element(by.model('vm.user.username')).clear();
      element(by.model('vm.user.email')).clear().sendKeys('asd');
      element(by.css('button[type=submit]')).click();
      
      expect(element.all(by.css('.error-text')).get(0).getText()).toBe('Username is required.');
      expect(element.all(by.css('.error-text')).get(1).getText()).toBe('Must be a valid e-mail.'); 
    });
    
    it('Should successfully edit a user', function () {
      element(by.model('vm.user.username')).sendKeys('user2');
      element(by.model('vm.user.email')).clear().sendKeys('user2@localhost.com');
      element(by.css('button[type=submit]')).click();
      
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/admin/users');
      
      // go to edit and check the values
      element.all(by.css('td a.btn-primary')).get(1).click();
      expect(element(by.model('vm.user.username')).getAttribute('value')).toBe('user2');
      expect(element(by.model('vm.user.email')).getAttribute('value')).toBe('user2@localhost.com');
      
      // go back
      element(by.css('a.btn.btn-link')).click();
      
      signout();
    });
  });
  
  describe('Manage user with an "admin" account', function () {
    
    it('Should have access to user management', function () {
      browser.get('http://localhost:3001/authentication/signin');
      element(by.model('credentials.username')).sendKeys('admin');
      element(by.model('credentials.password')).sendKeys('Temporary$4');
      element(by.css('button[type=submit]')).click();
      
      browser.get('http://localhost:3001/admin/users');
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/admin/users');
    });
    
    it('Should be able to edit/delete any user except the admin', function () {
      browser.get('http://localhost:3001/admin/users');
      expect(browser.getCurrentUrl()).toEqual('http://localhost:3001/admin/users');
      
      expect(element.all(by.css('table .glyphicon-pencil')).count()).toEqual(3);
      expect(element.all(by.css('table tr')).count()).toEqual(4);
      
      signout();
    });
  });
});