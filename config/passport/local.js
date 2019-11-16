/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const Users = mongoose.model('Users');

/**
 * Expose
 */

module.exports = new LocalStrategy(
  {
    usernameField: 'user[email]',
    passwordField: 'user[password]'
  },
  function(email, password, done) {
    Users.findOne({ email }, function(err, user) {
      if (err) return done(err);
      if (!user || !user.validatePassword(password)) {
        return done(null, false, {
          errors: { 'email or password': 'is invalid' }
        });
      }
      return done(null, user);
    }).catch(done);
  }
);
