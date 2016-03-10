'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Time = mongoose.model('Time');

/**
 * Globals
 */
var user, time;

/**
 * Unit tests
 */
describe('Time Model Unit Tests:', function () {

  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    });

    user.save(function () {
      time = new Time({
        notes: 'This are notes',
        date: Date.now(),
        hours: 2.3,
        user: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      return time.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without hours', function (done) {
      time.hours = undefined;

      return time.save(function (err, a) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save with negative hours', function (done) {
      time.hours = -2;

      return time.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Time.remove().exec(function () {
      User.remove().exec(done);
    });
  });
});
