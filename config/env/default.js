'use strict';

module.exports = {
  app: {
    title: 'Track Time',
    description: 'Keep track of your working hours!',
    keywords: 'track, time, hours, work, job, minutes, hour, quota',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID',
    itemsPerPage: 10
  },
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  templateEngine: 'swig',
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: process.env.SESSION_SECRET || 'MEAN',
  // sessionKey is set to the generic sessionId key used by PHP applications
  // for obsecurity reasons
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  // Lusca config
  csrf: {
    csrf: false,
    csp: { /* Content Security Policy object */},
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    hsts: {
      maxAge: 31536000, // Forces HTTPS for one year
      includeSubDomains: true,
      preload: true
    },
    xssProtection: true
  },
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  uploads: {
    profileUpload: {
      dest: './modules/users/client/img/profile/uploads/', // Profile upload destination path
      limits: {
        fileSize: 1*1024*1024 // Max file size in bytes (1 MB)
      }
    }
  },
  mailer: {
    from: process.env.MAILER_FROM || 'joao.campos@samura.pt',
    config: {
      host: 'pro.turbo-smtp.com',
      port: 25,
      secure: false,
      auth: {
        user: 'joao.campos@samura.pt',
        pass: 'Y2Khobjs'
      }
    }
  },
  seedDB: {
    seed: process.env.MONGO_SEED === 'true' ? true : false,
    options: {
      logResults: process.env.MONGO_SEED_LOG_RESULTS === 'false' ? false : true,
      seedUser: {
        username: process.env.MONGO_SEED_USER_USERNAME || 'user',
        email: process.env.MONGO_SEED_USER_EMAIL || 'user@localhost.com',
        firstName: 'User',
        lastName: 'Local',
        displayName: 'User Local',
        roles: ['user'],
        workingHoursPerDay: 5,
        seedTime: [
          { notes: 'note1', date: new Date(1457550315897), hours: 1.2 },
          { notes: 'note2', date: new Date(1457550315897), hours: 2.2 },
          { notes: 'note3', date: new Date(1457550315897), hours: 3.2 },
          { notes: 'note4', date: new Date(1457550215897), hours: 4.2 },
        ]
      },
      seedAdmin: {
        username: process.env.MONGO_SEED_ADMIN_USERNAME || 'admin',
        email: process.env.MONGO_SEED_ADMIN_EMAIL || 'admin@localhost.com',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        roles: ['user', 'admin'],
        workingHoursPerDay: 3
      },
      seedManager: {
        username: process.env.MONGO_SEED_ADMIN_USERNAME || 'manager',
        email: process.env.MONGO_SEED_ADMIN_EMAIL || 'manager@localhost.com',
        firstName: 'Manager',
        lastName: 'Local',
        displayName: 'Manager Local',
        roles: ['user', 'manager'],
        workingHoursPerDay: 2,
        seedTime: [
          { notes: 'note1', date: new Date(1457550315897), hours: 1.2 },
          { notes: 'note2', date: new Date(1457550315897), hours: 2.2 },
        ]
      }
    }
  }
};
