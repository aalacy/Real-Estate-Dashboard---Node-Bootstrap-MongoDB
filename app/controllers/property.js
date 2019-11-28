/*!
 * Module dependencies.
 */

const request = require('request-promise');
const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');
var moment = require('moment');
const uuidv4 = require('uuid/v4');

exports.my = async function(req, res, next) {
  const all_properties = await Properties.find({}, { _id: 0 });
  const occupied_properties = await Properties.find({ status: 'occupied' }, { _id: 0 });
  const vacant_properties = await Properties.find({ status: 'vacant' }, { _id: 0 });
  res.render('property/myproperties', {
    title: 'Avenue - MyProperties',
    token: req.csrfToken(),
    all_properties,
    occupied_properties,
    vacant_properties
  });
};

exports.overview = async function(req, res) {
  const { params: { id } } = req;
  const property = await Properties.findOne({ id: id }, { _id: 0 });
  
  res.render('property/overview', {
    title: 'Avenue - Overview',
    token: req.csrfToken(),
    property: property
  });
};

exports.detail = async function(req, res) {
  const { params: { id } } = req;
  const property = await Properties.findOne({ id: id }, { _id: 0 });

  res.render('property/detail', {
    title: 'Avenue - Overview',
    token: req.csrfToken(),
    property: property
  });
};

exports.new = function(req, res) {
  res.render('property/new', {
    title: 'Avenue - Add Property',
    token: req.csrfToken()
  });
};

exports.review = async function(req, res) {
  const { body: { property } } = req;
  const address = `https://maps.googleapis.com/maps/api/geocode/json?address=${property.fulladdress.split(' ').join('+')}&key=${process.env.GOOGLE_MAP_KEY}`;
  
  request({uri: address, json: true}).then(geo_data => {
    property.lat = geo_data.results[0].geometry.location.lat;
    property.lng = geo_data.results[0].geometry.location.lng;
  
    res.render('property/review', {
      title: 'Avenue - Add Property',
      token: req.csrfToken(),
      property: property
    });
  }).catch(err => console.log(err));
};

exports.create = async function(req, res) {
  const { body: { property } } = req;

  const address = `https://maps.googleapis.com/maps/api/geocode/json?address=${property.fulladdress.split(' ').join('+')}&key=${process.env.GOOGLE_MAP_KEY}`;
  
  request({uri: address, json: true}).then(geo_data => {
    property.lat = geo_data.results[0].geometry.location.lat;
    property.lng = geo_data.results[0].geometry.location.lng;
  
    const myproperty = new Properties(property);

    return myproperty.save().then(_property => {
      res.redirect('/property/overview/' + _property.id);
    });
  }).catch(err => console.log(err));
};

exports.update = async function(req, res) {
  const { body: { property } } = req;

  const address = `https://maps.googleapis.com/maps/api/geocode/json?address=${property.fulladdress.split(' ').join('+')}&key=${process.env.GOOGLE_MAP_KEY}`;
  
  const myproperty = await Properties.findOne({ id: property.id }, { _id: 0 });

  request({uri: address, json: true}).then(geo_data => {
    property.lat = geo_data.results[0].geometry.location.lat;
    property.lng = geo_data.results[0].geometry.location.lng;
  
    property.is_new = false;
    property.rental_yield = property.purchase_price == 0 ? 0 : parseFloat(myproperty.rental_income) * 0.01 / parseFloat(property.purchase_price);
    property.update_at = moment().format('YYYY-MM-DD HH:mm:ss');
    const new_values = { $set: property };

    return Properties.updateOne({ id: property.id }, new_values).then(_property => {
      res.redirect('/property/overview/' + property.id);
    });
  }).catch(err => console.log(err));
};

exports.remove = async function(req, res) {
  const { body: { property } } = req;

  await Properties.deleteOne({ id: property.id });
  res.redirect('/property/my');
};

// Tenancy
exports.new_unit = async function(req, res) {
  const { body: { property, unit } } = req;

  unit.id = uuidv4();
  const freq = {
    Daily: 365,
    Weekly: 52,
    Fortnightly: 26,
    Monthly: 12
  };
  const myproperty = await Properties.findOne({ id: property.id }, { _id: 0 });
  const rental_income = myproperty.rental_income + freq[unit.rent_frequency] * parseFloat(unit.rent_price);
  let rental_yield = myproperty.purchase_price == 0 ? 0 : rental_income * 0.01 / parseFloat(myproperty.purchase_price);
  const new_values = {
    $push: { tenancies: unit },
    $set: { rental_income, rental_yield }
  };
  return Properties.updateOne({ id: property.id }, new_values).then(() => {
    res.redirect('/property/overview/' + property.id);
  });
};

exports.delete_unit = async function(req, res) {
  const { body: { unit_id, property_id } } = req;

  console.log(unit_id, '==', property_id);
  const myproperty = await Properties.findOne({ id: property_id });
  let new_tenancies = [];
  myproperty.tenancies.map(element => {
    if (element.id != unit_id) {
      new_tenancies.push(element);
    }
  });
  myproperty.tenancies = new_tenancies;
  console.log(myproperty);
  await myproperty.save();
  return res.redirect('/property/overview/' + property_id);
};

exports.adjust_summary = async function(req, res) {
  const { body: { property: { current_value, id } } } = req;

  const myproperty = await Properties.findOne({ id: id }, { _id: 0 });
  let rental_yield = myproperty.purchase_price == 0 ? 0 : parseFloat(myproperty.rental_income) * 0.01 / parseFloat(myproperty.purchase_price);
  const new_values = { $set: { current_value, rental_yield } };
  return Properties.updateOne({ id }, new_values).then(() => {
    res.redirect('/property/overview/' + id);
  });
};
