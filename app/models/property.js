/* eslint-disable no-unused-vars */
/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Property schema
 */

const PropertiesSchema = new Schema({
    address: { type: String, default: '' },
    units: { type: Number, default: '' },
    current_value: { type: Number, default: '' },
    purchase_price: { type: Number, default: '' },
    income: { type: Number, default: '' },
    status: { type: String, default: '' },
    created_at: { type: Date, default: '' },
    updated_at: { type: Date, default: '' }
});
