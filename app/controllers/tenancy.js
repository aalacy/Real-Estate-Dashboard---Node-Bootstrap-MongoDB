/*
* Tenancy Controller
*/

const fs = require('fs');
const request = require('request-promise');
const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');
const Documents = mongoose.model('Documents');
const Transactions = mongoose.model('Transactions');
const Contacts = mongoose.model('Contacts');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

exports.tenancies = async function(req, res) {
  const { user } = req.session;  
  const properties = await Properties.find({ user_id: user.id }, { _id: 0 });
  const contacts = await Contacts.find({ user_id: user.id, type: 'Tenant' }, {_id: 0})
  let occupied_properties = [];
  let vacant_properties = []
  let all_tenancies = 0;
  let occupied_tenancies = 0;
  let vacant_tenancies = 0;
  properties.map(property => {
    all_tenancies += property.tenancies.length;
    var occupied_property = Object.assign({}, JSON.parse(JSON.stringify(property)));
    occupied_property.tenancies = [];
    var vacant_property = Object.assign({}, JSON.parse(JSON.stringify(property)));
    vacant_property.tenancies = [];
    property.tenancies.map(unit => {
      if (unit.rent_frequency == 'Vacant') {
        vacant_tenancies++;
        vacant_property.tenancies.push(unit);
      } else {
        occupied_tenancies++;
        occupied_property.tenancies.push(unit);
      }
    });
    property.tenancies.sort((a, b) => { return moment(a.end_date).isBefore(moment(b.end_date))})
    occupied_properties.push(occupied_property);
    vacant_properties.push(vacant_property);
  });

  res.render('tenancy/tenancies', {
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
    title: 'Tenancies | Avenue',
    properties,
    occupied_properties,
    vacant_properties,
    all_tenancies,
    occupied_tenancies,
    vacant_tenancies,
    contacts,
    path: '/tenancy/tenancies'
  });
};

exports.new_tenancy = async function(req, res) {
  const { body: { property, unit, tenants } } = req;

  const referer = urlLib.parse(req.headers.referer)
  if (!unit) {
    return res.redirect(referer.path);
  } 

  const new_values = await createNewUnit(property, unit, tenants)
  
  return Properties.updateOne({ id: property.id }, new_values).then(() => {
    res.redirect('/property/tenancies');
  });
};

exports.detail = async function(req, res) {
  const { user } = req.session;
  const { params: { property_id, id } } = req;

  const property = await Properties.findOne({ id: property_id }, { _id: 0 });
  const contacts = await Contacts.find({ user_id: user.id, type: 'Tenant' }, {_id: 0})
  let units = property.tenancies.filter(tenancy => tenancy.id == id)

  let unit
  if (units.length) {
    unit = units[0]
  }

  let tenancyName = `${property.address}, ${property.city}`
  if (property.tenancies.length > 1) {
    tenancyName += ' - ' + unit.description
  }

  res.render('tenancy/detail', {
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
    unit,
    property,
    contacts,
    unit_id: id,
    tenancyName,
    title: 'Tenancies | Avenue',
    path: '/tenancy/detail'
  })
}