
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

const InvestsSchema = new Schema({
  id: { type: String, default: ''},
  listname: { type: String, default: ''},
  address: { type: String, default: '' },
  postcode: { type: String, default: '' },
  type: { type: String, default: '' },
  bedrooms: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  lat: { type: String, default: '' },
  lng: { type: String, default: '' },
  url: { type: String, default: '' },
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

InvestsSchema.methods.setDate = function() {
  this.created_at = this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

InvestsSchema.methods.updateDate = function() {
  this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

InvestsSchema.methods.setID = function() {
    this.id = uuidv4();
}

mongoose.model('Invests', InvestsSchema);
