'use strict';

var _ = require('lodash'),
  config = require('../config'),
  mongoose = require('mongoose'),
  chalk = require('chalk'),
  crypto = require('crypto');

// global seed options object
var seedOptions = {};

function removeUser (user) {
  return new Promise(function (resolve, reject) {
    var User = mongoose.model('User');
    var Time = mongoose.model('Time');
    
    User.findOne({ username: user.username }, function(err, user) {
      if (err) {
        reject(new Error('Failed to remove ' + user.username));
      }
      
      if(!user) {
        return resolve();
      }
      user.remove(function (err) {
        if (err) {
          reject(new Error('Failed to remove ' + user.username));
        }
        
        resolve();  
      });
    });
  });
}

function saveUser (user) {
  return function() {
    return new Promise(function (resolve, reject) {
      // Then save the user
      user.save(function (err, theuser) {
        if (err) {
          reject(new Error('Failed to add local ' + user.username));
        } else {
          resolve(theuser);
        }
      });
    });
  };
}

function checkUserNotExists (user) {
  return new Promise(function (resolve, reject) {
    var User = mongoose.model('User');
    User.find({ username: user.username }, function (err, users) {
      if (err) {
        reject(new Error('Failed to find local account ' + user.username));
      }

      if (users.length === 0) {
        resolve();
      } else {
        reject(new Error('Failed due to local account already exists: ' + user.username));
      }
    });
  });
}

function reportSuccess (password) {
  return function (user) {
    return new Promise(function (resolve, reject) {
      if (seedOptions.logResults) {
        console.log(chalk.bold.red('Database Seeding:\t\t\tLocal ' + user.username + ' added with password set to ' + password));
      }
      resolve();
    });
  };
}

// save the specified user with the password provided from the resolved promise
function seedTheUser (user) {
  return function (password) {
    return new Promise(function (resolve, reject) {

      var User = mongoose.model('User');
      // set the new password
      user.password = password;

      if (user.username === seedOptions.seedAdmin.username && process.env.NODE_ENV === 'production') {
        checkUserNotExists(user)
          .then(saveUser(user))
          .then(reportSuccess(password))
          .then(function () {
            resolve();
          })
          .catch(function (err) {
            reject(err);
          });
      } else {
        removeUser(user)
          .then(saveUser(user))
          .then(reportSuccess(password))
          .then(function () {
            resolve();
          })
          .catch(function (err) {
            reject(err);
          });
      }
    });
  };
}

// save the specified time
function seedTheTime (user, data) {
  return function () {

    var Time = mongoose.model('Time');
    var promises = [];

    if(typeof data === 'undefined') {
      return;
    }
    
    data.forEach(function(time) {
      promises.push(new Promise(function(resolve, reject) {
        var timeObj = new Time(time);
        timeObj.user = user;

        timeObj.save(function (err, thetime) {
          if (err) {
            reject(new Error('Failed to add time ' + timeObj.notes));
          } else {
            resolve(thetime);
          }
        });
      }));
    });

    return Promise.all(promises);
  };
}

// report the error
function reportError (reject) {
  return function (err) {
    if (seedOptions.logResults) {
      console.log();
      console.log('Database Seeding:\t\t\t' + err);
      console.log();
    }
    reject(err);
  };
}

module.exports.start = function start(options) {
  // Initialize the default seed options
  seedOptions = _.clone(config.seedDB.options, true);

  // Check for provided options

  if (_.has(options, 'logResults')) {
    seedOptions.logResults = options.logResults;
  }

  if (_.has(options, 'seedUser')) { 
    seedOptions.seedUser = options.seedUser; 
  }

  if (_.has(options, 'seedAdmin')) {
    seedOptions.seedAdmin = options.seedAdmin;
  }
  
  if (_.has(options, 'seedManager')) {
    seedOptions.seedManager = options.seedManager;
  }

  var User = mongoose.model('User');
  return new Promise(function (resolve, reject) {

    var adminAccount = new User(seedOptions.seedAdmin);
    var userAccount = new User(seedOptions.seedUser);
    var managerAccount = new User(seedOptions.seedManager);

    //If production only seed admin if it does not exist
    if (process.env.NODE_ENV === 'production') {
      User.generateRandomPassphrase()
        .then(seedTheUser(adminAccount))
        .then(function () {
          resolve();
        })
        .catch(reportError(reject));
    } else {
      // Add both Admin, manager and User account

      User.generateRandomPassphrase()
        .then(seedTheUser(userAccount))
        .then(seedTheTime(userAccount, seedOptions.seedUser.seedTime))
        .then(User.generateRandomPassphrase)
        .then(seedTheUser(adminAccount))
        .then(seedTheTime(adminAccount, seedOptions.seedAdmin.seedTime))
        .then(User.generateRandomPassphrase)
        .then(seedTheUser(managerAccount))
        .then(seedTheTime(managerAccount, seedOptions.seedManager.seedTime))
        .then(function () {
          resolve();
        })
        .catch(reportError(reject));
    }
  });
};
