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
var app,
  agent,
  credentials,
  credentialsManager,
  credentialsAdmin,
  user,
  manager,
  admin,
  time,
  managerTime;

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
    credentialsManager = {
      username: 'manager',
      password: 'M3@n.jsI$Aw3$0m3'
    };
    credentialsAdmin = {
      username: 'admin',
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
    
    // Create a new manager
    manager = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test2@test.com',
      username: credentialsManager.username,
      password: credentialsManager.password,
      provider: 'local',
      roles: ['manager'],
    });
    
    // Create a new user
    admin = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test3@test.com',
      username: credentialsAdmin.username,
      password: credentialsAdmin.password,
      provider: 'local',
      roles: ['admin'],
    });
    
    // create a new time for the manager
    managerTime = new Time({
      notes: 'This are manager notes',
      date: Date.now(),
      hours: 4.1,
    });

    // Save a user to the test db and create new time
    user.save(function () {
      manager.save(function () {
        admin.save(function () {
          managerTime.user = manager;
          managerTime.save(function () {
            // create a time
            time = {
              notes: 'This are notes',
              date: Date.now(),
              hours: 2.3,
              user: user
            };
            
            done();
          });
        });
      });
    });
  });

  it('should be able to save a time if logged in', function (done) {
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
                (times[0].notes).should.match('This are notes');
                (times[0].hours).should.equal(2.3);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save a time if not logged in', function (done) {
    agent.post('/api/times')
      .send(time)
      .expect(403)
      .end(function (timeSaveErr, timeSaveRes) {
        // Call the assertion callback
        done(timeSaveErr);
      });
  });

  it('should not be able to save a time if no hours are provided', function (done) {
    // Invalidate hours field
    time.hours = undefined;

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save a new time
        agent.post('/api/times')
          .send(time)
          .expect(400)
          .end(function (timeSaveErr, timeSaveRes) {
            // Set message assertion
            (timeSaveRes.body.message).should.match('Hours cannot be blank');

            // Handle time save error
            done(timeSaveErr);
          });
      });
  });

  it('should be able to update a time if owner', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save a new time
        agent.post('/api/times')
          .send(time)
          .expect(200)
          .end(function (timeSaveErr, timeSaveRes) {
            // Handle time save error
            if (timeSaveErr) {
              return done(timeSaveErr);
            }

            // Update time
            time.hours = 3.2;
            time.notes = 'This are other notes';

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
                (timeUpdateRes.body.hours).should.match(3.2);
                (timeUpdateRes.body.notes).should.match('This are other notes');

                // Call the assertion callback
                done();
              });
          });
      });
  });
  
  it('should not be able to update a time if not owner', function (done) {
    
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
      
        // Update an existing time
        agent.put('/api/times/' + managerTime._id)
          .send(time)
          .expect(403)
          .end(function (timeUpdateErr, timeUpdateRes) {
            // Handle time error error
            (timeUpdateRes.body.message).should.match('User is not authorized');

            // Call the assertion callback
            done(timeUpdateErr);
          });
      });
  });

  it('should not be able to get a list of times if not signed in', function (done) {
    // Create new time model instance
    var timeObj = new Time(time);

    // Save the time
    timeObj.save(function () {
      // Request times
      request(app).get('/api/times')
        .expect(403)
        .end(function (timeListErr, timeListRes) {
        
          // Set message assertion
          (timeListRes.body.message).should.match('User is not authorized');

          // Handle time error error
          done(timeListErr);
        });
    });
  });

  it('should not be able to get a single time if not signed in', function (done) {
    // Create new time model instance
    var timeObj = new Time(time);

    // Save the time
    timeObj.save(function () {
      request(app).get('/api/times/' + timeObj._id)
        .expect(403)
        .end(function (timeErr, timeRes) {
          // Set message assertion
          (timeRes.body.message).should.match('User is not authorized');

          // Handle time error error
          done(timeErr);
        });
    });
  });
  
  it('should be able to get a list of own times if signed in', function (done) {
    // Create new time model instance
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

          // Request times
          agent.get('/api/times')
            .end(function (req, res) {
              // Set assertion
              res.body.should.be.instanceof(Array).and.have.lengthOf(1);

              // Call the assertion callback
              done();
            });
        });
    });
  });

  it('should be able to get a single time if owner', function (done) {
    // Create new time model instance
    var timeObj = new Time(time);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
    
        // Save the time
        timeObj.save(function () {
          agent.get('/api/times/' + timeObj._id)
            .end(function (req, res) {
              // Set assertion
              res.body.should.be.instanceof(Object).and.have.property('hours', 2.3);

              // Call the assertion callback
              done();
            });
        });
      });
  });
  
  it('should not be able to get a single time if user is not owner', function (done) {
    
    agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
         
          // Create new time model instance
          agent.get('/api/times/' + managerTime._id)
            .expect(403)
            .end(function (req, res) {
              // Set assertion
              (res.body.message).should.match('User is not authorized');
    
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

  it('should be able to delete a time if owner', function (done) {
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

  it('should not be able to delete a time if not signed in', function (done) {
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
  
  it('should not be able to delete a time if not owner', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Delete an existing time
        agent.delete('/api/times/' + managerTime._id)
          .send(time)
          .expect(403)
          .end(function (timeDeleteErr, timeDeleteRes) {
            // Handle time error error
            (timeDeleteRes.body.message).should.match('User is not authorized');
          
            // Call the assertion callback
            done(timeDeleteErr);
          });
      });
  });
  
  it('should be able to get a list of all times if manager', function (done) {
    // Create new time model instance
    var timeObj = new Time(time);

    // Save the time
    timeObj.save(function () {
      
      agent.post('/api/auth/signin')
        .send(credentialsManager)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Request times
          agent.get('/api/times')
            .end(function (req, res) {
              // Set assertion
              res.body.should.be.instanceof(Array).and.have.lengthOf(2);

              // Call the assertion callback
              done();
            });
        });
    });
  });
  
  it('should be able to get a list of all times if admin', function (done) {
    // Create new time model instance
    var timeObj = new Time(time);

    // Save the time
    timeObj.save(function () {
      
      agent.post('/api/auth/signin')
        .send(credentialsAdmin)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Request times
          agent.get('/api/times')
            .end(function (req, res) {
              // Set assertion
              res.body.should.be.instanceof(Array).and.have.lengthOf(2);

              // Call the assertion callback
              done();
            });
        });
    });
  });

  it('should be able to get a single time not owned if manager', function (done) {
    // Create new time model instance
    var timeObj = new Time(time);

    agent.post('/api/auth/signin')
      .send(credentialsManager)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
    
        // Save the time
        timeObj.save(function () {
          agent.get('/api/times/' + timeObj._id)
            .end(function (req, res) {
              // Set assertion
              res.body.should.be.instanceof(Object).and.have.property('hours', 2.3);

              // Call the assertion callback
              done();
            });
        });
      });
  });
  
  it('should be able to get a single time not owned if admin', function (done) {
    var timeObj = new Time(time);

    agent.post('/api/auth/signin')
      .send(credentialsAdmin)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
    
        // Save the time
        timeObj.save(function () {
          agent.get('/api/times/' + timeObj._id)
            .end(function (req, res) {
              // Set assertion
              res.body.should.be.instanceof(Object).and.have.property('hours', 2.3);

              // Call the assertion callback
              done();
            });
        });
      });
  });

  it('should not be able to update other people times if manager', function (done) {
    var timeObj = new Time(time);
    
    agent.post('/api/auth/signin')
      .send(credentialsManager)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        timeObj.save(function () {
          // Update an existing time
          agent.put('/api/times/' + timeObj._id)
            .send(time)
            .expect(403)
            .end(function (timeUpdateErr, timeUpdateRes) {
              // Handle time error error
              (timeUpdateRes.body.message).should.match('User is not authorized');

              // Call the assertion callback
              done(timeUpdateErr);
            });
        });
      });
  });
  
  it('should not be able to delete other people times if manager', function (done) {
    var timeObj = new Time(time);
    
    agent.post('/api/auth/signin')
      .send(credentialsManager)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save the time
        timeObj.save(function () {

          // Delete an existing time
          agent.delete('/api/times/' + timeObj._id)
            .send(time)
            .expect(403)
            .end(function (timeDeleteErr, timeDeleteRes) {
              // Handle time error error
              (timeDeleteRes.body.message).should.match('User is not authorized');

              // Call the assertion callback
              done(timeDeleteErr);
            });
        });
      });
  });
  
  it('should be able to update a time if admin', function (done) {
    var timeObj = new Time(time);
    
    agent.post('/api/auth/signin')
      .send(credentialsAdmin)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save the time
        timeObj.save(function () {
            
          // Update time
          time.hours = 3.2;
          time.notes = 'This are other notes';

          // Update an existing time
          agent.put('/api/times/' + timeObj._id)
            .send(time)
            .expect(200)
            .end(function (timeUpdateErr, timeUpdateRes) {
              // Handle time update error
              if (timeUpdateErr) {
                return done(timeUpdateErr);
              }

              // Set assertions
              timeUpdateRes.body._id.should.be.equal(String(timeObj._id));
              timeUpdateRes.body.hours.should.match(3.2);
              timeUpdateRes.body.user._id.should.be.equal(String(user._id));

              // Call the assertion callback
              done();
            });
        });
      });
  });
  
  it('should be able to delete a time if admin', function (done) {
    var timeObj = new Time(time);
    
    agent.post('/api/auth/signin')
      .send(credentialsAdmin)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save the time
        timeObj.save(function () {

          // Delete an existing time
          agent.delete('/api/times/' + timeObj._id)
            .send(time)
            .expect(200)
            .end(function (timeDeleteErr, timeDeleteRes) {
              // Handle time error error
              if (timeDeleteErr) {
                return done(timeDeleteErr);
              }

              // Set assertions
              timeDeleteRes.body._id.should.be.equal(String(timeObj._id));

              // Call the assertion callback
              done();
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