/*!
 * Module dependencies.
 */

const fs = require('fs');
const request = require('request-promise');
const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');
const Documents = mongoose.model('Documents');
const Transactions = mongoose.model('Transactions');
var moment = require('moment');
const uuidv4 = require('uuid/v4');

exports.all = async function(req, res) {
  const { user } = req.session;
  let cnt_enabled_properties = await Properties.find({user_id: user.id }, { _id: 0 }).count();

  res.render('service/index', {
    title: 'Avenue - Services',
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
    cnt_enabled_properties
  });
}

exports.instant_valuations = async function(req, res) {
  const { user } = req.session;
  
  let properties = await Properties.find({ user_id: user.id }, { _id: 0 });
  properties.map(property => {
    property.remaining_days = moment(property.estimate_cron_run_date).add(30, 'days').diff(moment(), 'days')
  })

  res.render('service/valuations', {
    title: 'Avenue - Services',
    properties,
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
  });
}
