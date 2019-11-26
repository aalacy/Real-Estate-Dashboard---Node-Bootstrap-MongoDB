/* eslint-disable no-unused-vars */
/*!
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv4 = require('uuid/v4');
var moment = require('moment');

/**
 * Property schema
 */

const PropertiesSchema = new Schema({
    id: {type: String, default: ''},
    address: { type: String, default: '' },
    address2: { type: String, default: '' },
    region: { type: String, default: '' },
    country: { type: String, default: '' },
    lat: {type: String, default: ''},
    lng: {type: String, default: ''},
    zip: { type: String, default: '' },
    units: { type: String, default: '' },
    current_value: { type: Number, default: '' },
    purchase_price: { type: Number, default: '' },
    purchase_date: { type: String, default: '' },
    income: { type: Number, default: '' },
    bedrooms: { type: Number, default: '' },
    bathrooms: { type: Number, default: '' },
    square_feets: { type: Number, default: '' },
    type: { type: String, default: '' },
    finish_quality: { type: String, default: '' },
    outdoor_space: { type: String, default: '' },
    land_title: { type: String, default: '' },
    construction_date: { type: String, default: '' },
    status: { type: String, default: '' }, // vacant or occupied
    created_at: { type: String, default: '' },
    updated_at: { type: String, default: '' }
});

PropertiesSchema.methods.setData = function(property) {
    this.address = property.address;
    this.address2 = property.address2;
    this.region = property.region;
    this.country = property.country;
    this.zip = property.zip;
    this.units = property.units;
    this.purchase_price = property.purchase_price;
    this.purchase_date = property.purchase_date;
    this.bedrooms = property.bedrooms;
    this.bathrooms = property.bathrooms;
    this.type = property.type;
    this.finish_quality = property.finish_quality;
    this.outdoor_space = property.outdoor_space;
    this.land_title = property.land_title;
    this.construction_date = property.construction_date;
};

PropertiesSchema.methods.setID = function() {
    this.id = uuidv4();
}

PropertiesSchema.methods.setDate = function() {
    this.created_at = this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

mongoose.model('Properties', PropertiesSchema);
