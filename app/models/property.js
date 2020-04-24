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
    user_id: {type: String, default: ''},
    image: { type: String, default: '' },
    address: { type: String, default: '' },
    address2: { type: String, default: '' },
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    county: { type: String, default: '' },
    country: { type: String, default: '' },
    lat: {type: String, default: ''},
    lng: {type: String, default: ''},
    fulladdress: { type: String, default: '' },
    zip: { type: String, default: '' },
    units: { type: Number, default: 1 }, // Single Unit / Multiple Units
    current_value: { type: Number, default: 0.0 }, // property value from user input
    estimate_value: { type: Number, default: 0.0 }, // estimate value from api https://propertydata.co.uk/api/documentation/valuation-sale
    margin: { type: Number, default: 0.0 }, // property margin from api https://propertydata.co.uk/api/documentation/valuation-sale
    estimate_cron_on: { type: Boolean, default: false},
    estimate_cron_possible: { type: Boolean, default: false},
    estimate_cron_run_date: { type: String, default: ''},
    purchase_price: { type: Number, default: 0.0 }, // £240
    purchase_date: { type: String, default: '' }, // 2019-01-02
    bedrooms: { type: Number, default: 1 }, // 1
    bathrooms: { type: Number, default: 1 }, // 2
    square_feet: { type: Number, default: 0.0 },
    type: { type: String, default: 'detached_house' }, // Detached House / Semi Detached House / Terraced House / Flat
    finish_quality: { type: String, default: 'unmodernised' }, // Very High / High / Average / Below Average / Unmordernised
    outdoor_space: { type: String, default: 'none' }, // None / Balcony Terrace / Garden / Garden (Large)
    ownership: { type: String, default: '' }, // Freehold / Leasehold
    construction_date: { type: String, default: 'pre_1914' }, // 2019-01-02
    rental_yield: { type: Number, default: 0.0 }, // 3.8% - gross yeild
    rental_income: { type: Number, default: 0.0 }, // £240pcm
    off_street_parking: { type: String, default: '0' }, // 0 ~ 3 Spaces
    is_new: { type: Boolean, default: true }, // used to display alert on top of the overview page
    status: { type: String, default: 'Vacant' }, // Vacant or Occupied
    has_loan: { type: Boolean, default: false }, // used to display alert on top of the overview page
    debt: { type: Number, default: 0.0 }, // Loan
    equity: { type: Number, default: 0.0 }, // Equity
    lender: { type: String, default: '' }, // Lender
    amount_borrowed: { type: Number, default: 0.0 }, // Amount borrowed
    interest_rate: { type: Number, default: 0.0 }, // Interest Rate
    monthly_payment: { type: Number, default: 0.0 }, // Monthly Payment
    start_date: { type: String, default: '' }, // Start Date
    maturity_date: { type: String, default: '' }, // Maturity Date
    loan_updated_at: { type: String, default: '' },
    tenancies: { type: Array, default: [] }, // Tenancies
    created_at: { type: String, default: moment().format('YYYY-MM-DD HH:mm:ss') },
    updated_at: { type: String, default: moment().format('YYYY-MM-DD HH:mm:ss') }
});

PropertiesSchema.methods.setData = function(property) {
    this.address = property.address;
    this.address2 = property.address2;
    this.county = property.county;
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

PropertiesSchema.methods.addUnit = function(unit) {
    this.tenancies.push(unit);
};

mongoose.model('Properties', PropertiesSchema);
