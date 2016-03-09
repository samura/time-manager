'use strict';

describe('Times E2E Tests:', function () {
  describe('Test times page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/times');
      expect(element.all(by.repeater('time in times')).count()).toEqual(0);
    });
  });
});
