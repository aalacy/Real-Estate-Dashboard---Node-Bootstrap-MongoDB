
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

const TenantsSchema = new Schema({
  id: { type: String, default: ''},
  user_id: { type: String, default: '' },
  type: { type: String, default: '' },
  avatar: { type: String, default: '' },
  first_name: { type: String, default: '' },
  last_name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone_number: { type: String, default: '' },
  notes: { type: String, default: '' },
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

TenantsSchema.methods.setDate = function() {
  this.created_at = this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

TenantsSchema.methods.updateDate = function() {
  this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

TenantsSchema.methods.setID = function() {
    this.id = uuidv4();
}

mongoose.model('Tenants', TenantsSchema);
