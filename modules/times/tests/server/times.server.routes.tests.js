'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Time = mongoose.model('Time'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, time;

/**
 * Time routes tests
 */
describe('Time CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new time
    user.save(function () {
      time = {
        title: 'Time Title',
        content: 'Time Content'
      };

      done();
    });
  });

  it('should be able to save an time if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new time
        agent.post('/api/times')
          .send(time)
          .expect(200)
          .end(function (timeSaveErr, timeSaveRes) {
            // Handle time save error
            if (timeSaveErr) {
              return done(timeSaveErr);
            }

            // Get a list of times
            agent.get('/api/times')
              .end(function (timesGetErr, timesGetRes) {
                // Handle time save error
                if (timesGetErr) {
                  return done(timesGetErr);
                }

                // Get times list
                var times = timesGetRes.body;

                // Set assertions
                (times[0].user._id).should.equal(userId);
                (times[0].title).should.match('Time Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an time if not logged in', function (done) {
    agent.post('/api/times')
      .send(time)
      .expect(403)
      .end(function (timeSaveErr, timeSaveRes) {
        // Call the assertion callback
        done(timeSaveErr);
      });
  });

  it('should not be able to save an time if no title is provided', function (done) {
    // Invalidate title field
    time.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new time
        agent.post('/api/times')
          .send(time)
          .expect(400)
          .end(function (timeSaveErr, timeSaveRes) {
            // Set message assertion
            (timeSaveRes.body.message).should.match('Title cannot be blank');

            // Handle time save error
            done(timeSaveErr);
          });
      });
  });

  it('should be able to update an time if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new time
        agent.post('/api/times')
          .send(time)
          .expect(200)
          .end(function (timeSaveErr, timeSaveRes) {
            // Handle time save error
            if (timeSaveErr) {
              return done(timeSaveErr);
            }

            // Update time title
            time.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing time
            agent.put('/api/times/' + timeSaveRes.body._id)
              .send(time)
              .expect(200)
              .end(function (timeUpdateErr, timeUpdateRes) {
                // Handle time update error
                if (timeUpdateErr) {
                  return done(timeUpdateErr);
                }

                // Set assertions
                (timeUpdateRes.body._id).should.equal(timeSaveRes.body._id);
                (timeUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of times if not signed in', function (done) {
    // Create new time model instance
    var timeObj = new Time(time);

    // Save the time
    timeObj.save(function () {
      // Request times
      request(app).get('/api/times')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single time if not signed in', function (done) {
    // Create new time model instance
    var timeObj = new Time(time);

    // Save the time
    timeObj.save(function () {
      request(app).get('/api/times/' + timeObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', time.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single time with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/times/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Time is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single time which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent time
    request(app).get('/api/times/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No time with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an time if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new time
        agent.post('/api/times')
          .send(time)
          .expect(200)
          .end(function (timeSaveErr, timeSaveRes) {
            // Handle time save error
            if (timeSaveErr) {
              return done(timeSaveErr);
            }

            // Delete an existing time
            agent.delete('/api/times/' + timeSaveRes.body._id)
              .send(time)
              .expect(200)
              .end(function (timeDeleteErr, timeDeleteRes) {
                // Handle time error error
                if (timeDeleteErr) {
                  return done(timeDeleteErr);
                }

                // Set assertions
                (timeDeleteRes.body._id).should.equal(timeSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an time if not signed in', function (done) {
    // Set time user
    time.user = user;

    // Create new time model instance
    var timeObj = new Time(time);

    // Save the time
    timeObj.save(function () {
      // Try deleting time
      request(app).delete('/api/times/' + timeObj._id)
        .expect(403)
        .end(function (timeDeleteErr, timeDeleteRes) {
          // Set message assertion
          (timeDeleteRes.body.message).should.match('User is not authorized');

          // Handle time error error
          done(timeDeleteErr);
        });

    });
  });

  it('should be able to get a single time that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new time
          agent.post('/api/times')
            .send(time)
            .expect(200)
            .end(function (timeSaveErr, timeSaveRes) {
              // Handle time save error
              if (timeSaveErr) {
                return done(timeSaveErr);
              }

              // Set assertions on new time
              (timeSaveRes.body.title).should.equal(time.title);
              should.exist(timeSaveRes.body.user);
              should.equal(timeSaveRes.body.user._id, orphanId);

              // force the time to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the time
                    agent.get('/api/times/' + timeSaveRes.body._id)
                      .expect(200)
                      .end(function (timeInfoErr, timeInfoRes) {
                        // Handle time error
                        if (timeInfoErr) {
                          return done(timeInfoErr);
                        }

                        // Set assertions
                        (timeInfoRes.body._id).should.equal(timeSaveRes.body._id);
                        (timeInfoRes.body.title).should.equal(time.title);
                        should.equal(timeInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single time if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new time model instance
    time.user = user;
    var timeObj = new Time(time);

    // Save the time
    timeObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user.id;

          // Save a new time
          agent.post('/api/times')
            .send(time)
            .expect(200)
            .end(function (timeSaveErr, timeSaveRes) {
              // Handle time save error
              if (timeSaveErr) {
                return done(timeSaveErr);
              }

              // Get the time
              agent.get('/api/times/' + timeSaveRes.body._id)
                .expect(200)
                .end(function (timeInfoErr, timeInfoRes) {
                  // Handle time error
                  if (timeInfoErr) {
                    return done(timeInfoErr);
                  }

                  // Set assertions
                  (timeInfoRes.body._id).should.equal(timeSaveRes.body._id);
                  (timeInfoRes.body.title).should.equal(time.title);

                  // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                  (timeInfoRes.body.isCurrentUserOwner).should.equal(true);

                  // Call the assertion callback
                  done();
                });
            });
        });
    });
  });

  it('should be able to get a single time if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new time model instance
    var timeObj = new Time(time);

    // Save the time
    timeObj.save(function () {
      request(app).get('/api/times/' + timeObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', time.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single time, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      username: 'temp',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create temporary user
    var _user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _user.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Time
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user._id;

          // Save a new time
          agent.post('/api/times')
            .send(time)
            .expect(200)
            .end(function (timeSaveErr, timeSaveRes) {
              // Handle time save error
              if (timeSaveErr) {
                return done(timeSaveErr);
              }

              // Set assertions on new time
              (timeSaveRes.body.title).should.equal(time.title);
              should.exist(timeSaveRes.body.user);
              should.equal(timeSaveRes.body.user._id, userId);

              // now signin with the temporary user
              agent.post('/api/auth/signin')
                .send(_creds)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the time
                  agent.get('/api/times/' + timeSaveRes.body._id)
                    .expect(200)
                    .end(function (timeInfoErr, timeInfoRes) {
                      // Handle time error
                      if (timeInfoErr) {
                        return done(timeInfoErr);
                      }

                      // Set assertions
                      (timeInfoRes.body._id).should.equal(timeSaveRes.body._id);
                      (timeInfoRes.body.title).should.equal(time.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (timeInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Time.remove().exec(done);
    });
  });
});
