
/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment');
const uuidv4 = require('uuid/v4');

/**
 * User schema
 */

const TransactionsSchema = new Schema({
  id: { type: String, default: ''},
  property_id: { type: String, default: '' },
  user_id: { type: String, default: '' },
  user: { type: String, default: '' },
  category: { type: String, default: '' },
  account: { type: String, default: '' },
  amount: { type: String, default: '' },
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

TransactionsSchema.methods.setDate = function() {
  this.created_at = this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

TransactionsSchema.methods.updateDate = function() {
  this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

TransactionsSchema.methods.setID = function() {
    this.id = uuidv4();
}

mongoose.model('Transactions', TransactionsSchema);
