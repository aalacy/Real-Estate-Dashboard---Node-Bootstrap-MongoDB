/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');

exports.index = async function(req, res) {
  const properties = await Properties.find({}, { _id: 0 }).limit(7);
  res.render('dashboard/index', {
    token: req.csrfToken(),
    title: 'Avenue - Dashboard',
    properties: properties
  });
};
