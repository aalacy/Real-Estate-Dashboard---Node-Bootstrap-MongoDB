
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

const DocumentsSchema = new Schema({
  id: { type: String, default: ''},
  user_id: { type: String, default: ''},
  tag: { type: Array, default: []},
  note: { type: String, default: ''},
  property_id: { type: String, default: ''},
  property_name: { type: String, default: ''},
  unit_id: { type: String, default: ''},
  unit_name: { type: String, default: ''},
  category: { type: String, default: ''}, //  key documents( EPC, Gas Safety Record, Fire Safety Record, Floorplan, EICR)
  expiry_date: { type: String, default: ''}, // only for subcategory(EPC, Gas Safety Record and Fire Safety Record) when key documents; 
  rating: { type: String, default: ''}, // A-G only for EPC
  filename: { type: String, default: '' },
  display_name: { type: String, default: '' },
  size: { type: String, default: '' },
  path: { type: String, default: '' },
  mimetype: { type: String, default: '' },
  status: { type: String, default: 'dead' },
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

DocumentsSchema.methods.setDate = function() {
  this.created_at = this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

DocumentsSchema.methods.updateDate = function() {
  this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

DocumentsSchema.methods.setID = function() {
    this.id = uuidv4();
}

mongoose.model('Documents', DocumentsSchema);
