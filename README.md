# A simple time management system

##  Project Description
- User must be able to create an account and log in
- User can add (and edit and delete) a row what he has worked on, what date, for how long
- User can add a setting (Preferred working hours per day)
- If on a certain date a user has worked under the PreferredWorkingHourPerDay, these rows are red, otherwise green.
- Implement at least two roles with different permission levels (ie: a regular user would only be able to CRUD on his owned records, a user manager would be able to CRUD users, an admin would be able to CRUD on all records and users, etc.)
- Filter entries by date from-to
- Export the filtered times to a sheet in HTML:
  - Date: 21.5
  - Total time: 9h
  - Notes:
    - Note1
    - Note2
    - Note3
    
### REST API
- Make it possible to perform all user actions via the API, including authentication.
- In any case you should be able to explain how a REST API works and demonstrate that by creating functional tests that use the REST Layer directly.


### Other Considerations
- All actions need to be done client side using AJAX, refreshing the page is not acceptable.
- Bonus: unit and e2e tests!
- You will not be marked on graphic design, however, do try to keep it as tidy as possible.


## Languages/Frameworks/Tools used

- Javascript
- Node.js
- Angularjs
- Express
- MongoDB
- bower
- npm
- protractor
- karma
- mocha
- phantomjs
- jslint
- ...


## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Node.js
* MongoDB
* Ruby
* Bower - ``` $ npm install -g bower ```
* Sass - ``` $ gem install sass ```
* Gulp - ``` $ npm install gulp -g ```

## Installation

Clone the project:
```bash
$ git clone git@git.toptal.com:Joao-Campos/joao-campos-2nd-attempt.git time-management
````

Add all the dependencies:
```bash
$ npm i
```

## Tests
To run **all the tests** do:
```bash
$ MONGO_SEED=true gulp test
```

For **server side** (API) tests:
```bash
$ gulp test:server
```

For **client side** (Angularjs) tests:
```bash
$ gulp test:client
```

For **e2e** tests:
```bash
$ MONGO_SEED=true gulp test:e2e
```


## Running

**First time** running the project we need some content on the DB:
```bash
$ MONGO_SEED=true gulp
```

Access your project on: http://localhost:3000   

If you run the project with MONGO_SEED you have the following available users with 3 different roles:

**User**   
username: user    
password: Temporary$4

**Manager**   
username: manager    
password: Temporary$4

**Administrator**   
username: admin    
password: Temporary$4

Next time you run the project, it can be done with just:
```bash
$ gulp
```