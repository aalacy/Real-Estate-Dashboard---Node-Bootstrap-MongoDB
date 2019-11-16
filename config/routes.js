'use strict';

const express = require('express');
const router = express.Router();

/**
 * Module dependencies.
 */

const dashboard = require('../app/controllers/dashboard');
const auth = require('../app/controllers/auth');
const property = require('../app/controllers/property');

/**
 * Expose
 */

module.exports = function(app) {
  /**
   * Dashboard
   */

  app.get('/', dashboard.index);

  /**
   * Auth
   */

  app.get('/signin', auth.signin);
  app.get('/signup', auth.signup);
  app.get('/settings', auth.settings);

  /**
   * Property
   */

  app.get('/property/my', property.my);
  app.get('/property/overview', property.overview);

  /**
   * Error handling
   */

  app.use(function(err, req, res, next) {
    // treat as 404
    if (
      err.message &&
      (~err.message.indexOf('not found') ||
        ~err.message.indexOf('Cast to ObjectId failed'))
    ) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('other/error', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function(req, res) {
    res.status(404).render('other/error', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
