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

exports.index = async function(req, res) {
  const { user } = req.session;
  res.render('invest/index', {
    title: 'Avenue - Invest',
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
  });
}
