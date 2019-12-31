
/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var moment = require('moment');
const uuidv4 = require('uuid/v4');

/**
 * User schema
 */

const UsersSchema = new Schema({
  id: { type: String, default: ''},
  first_name: { type: String, default: '' },
  last_name: { type: String, default: '' },
  email: { type: String, default: '' },
  hash: { type: String, default: '' },
  salt: { type: String, default: '' },
  reset_link: { type: String, default: '' },
  created_at: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
  updated_at: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */

UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex');
  return this.hash === hash;
};

UsersSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      email: this.email,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10),
    },
    'secret'
  );
};

UsersSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    username: this.first_name,
    token: this.generateJWT()
  };
};

/**
 * Register
 */

UsersSchema.methods.setDate = function() {
  this.created_at = this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

UsersSchema.methods.updateDate = function() {
  this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

UsersSchema.methods.setID = function() {
    this.id = uuidv4();
}

UsersSchema.methods.setPasswordResetLink = function(id) {
  this.reset_link = id;
};

mongoose.model('Users', UsersSchema);
