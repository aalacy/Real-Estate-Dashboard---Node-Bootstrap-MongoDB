/*!
 * Module dependencies.
 */

const request = require('request-promise');
const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');
var moment = require('moment');

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

  const address = `https://maps.googleapis.com/maps/api/geocode/json?address=${property.address.split(' ').join('+')}&key=${process.env.GOOGLE_MAP_KEY}`;
  
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

  property.is_new = false;
  property.update_at = moment().format('YYYY-MM-DD HH:mm:ss');
  const new_values = { $set: property };

  await Properties.updateOne({ id: property.id }, new_values);
  res.redirect('/property/overview/' + property.id);
};

exports.remove = async function(req, res) {
  const { body: { property } } = req;

  await Properties.deleteOne({ id: property.id });
  res.redirect('/property/my');
};
