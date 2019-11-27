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
    id: {type: String, default: uuidv4()},
    address: { type: String, default: '' },
    fulladdress: { type: String, default: '' },
    address2: { type: String, default: '' },
    city: { type: String, default: '' },
    county: { type: String, default: '' },
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
    square_feet: { type: Number, default: '' },
    type: { type: String, default: '' },
    finish_quality: { type: String, default: '' },
    outdoor_space: { type: String, default: '' },
    ownership: { type: String, default: '' },
    construction_date: { type: String, default: '' },
    is_new: { type: Boolean, default: true },
    status: { type: String, default: 'vacant' }, // vacant or occupied
    created_at: { type: String, default: moment().format('YYYY-MM-DD HH:mm:ss') },
    updated_at: { type: String, default: moment().format('YYYY-MM-DD HH:mm:ss') }
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

PropertiesSchema.methods.updateDate = function() {
    this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
};

mongoose.model('Properties', PropertiesSchema);
