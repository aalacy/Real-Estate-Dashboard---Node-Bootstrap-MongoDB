
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

const InvestshortsSchema = new Schema({
  id: { type: String, default: ''},
  invest_id: { type: String, default: '' },
  user_id: { type: String, default: '' },
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

InvestshortsSchema.methods.setDate = function() {
  this.created_at = this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

InvestshortsSchema.methods.updateDate = function() {
  this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

InvestshortsSchema.methods.setID = function() {
    this.id = uuidv4();
}

mongoose.model('Investshorts', InvestshortsSchema);
