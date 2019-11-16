'use strict';

/*
 * nodejs-express-mongoose
 * Copyright(c) 2015 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config');

const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3000;

const app = express();
const connection = connect();

/**
 * Expose
 */

module.exports = {
  app,
  connection
};

// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.indexOf('.js'))
  .forEach(file => require(join(models, file)));

// Bootstrap routes
require('./config/passport')(passport);
require('./config/express')(app, passport);
app.use(require('./routes'));

app.use(function(err, req, res, next) {
  console.log('server', err);
  // treat as 404
  if (
    err.message &&
    (~err.message.indexOf('not found') ||
      ~err.message.indexOf('Cast to ObjectId failed'))
  ) {
    return next();
  } else if (err.status && err.status == 405) {
    res.redirect('/signin');
  } else {
    // error page
    res.status(500).render('other/error', { error: err.stack });
  }
});

// assume 404 since no middleware responded
app.use(function(req, res) {
  res.status(404).render('other/error', {
    url: req.originalUrl,
    error: 'Not found'
  });
});

connection
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen() {
  if (app.get('env') === 'test') return;
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect() {
  var options = { keepAlive: 1, useNewUrlParser: true };
  mongoose.connect(config.db, options);
  return mongoose.connection;
}
