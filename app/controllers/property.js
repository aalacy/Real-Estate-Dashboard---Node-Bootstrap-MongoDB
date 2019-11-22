/*!
 * Module dependencies.
 */

const request = require('request-promise');

exports.my = function(req, res, next) {
  res.render('property/myproperties', {
    title: 'Avenue - MyProperties',
    token: req.csrfToken()
  });
};

exports.overview = function(req, res) {
  res.render('property/overview', {
    title: 'Avenue - Overview',
    token: req.csrfToken()
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
  const address = `https://maps.googleapis.com/maps/api/geocode/json?address=${property.address.split(' ').join('+')}&key=${process.env.GOOGLE_MAP_KEY}`
  
  request({uri: address, json: true}).then(geo_data => {
    property.latitude = geo_data.results[0].geometry.location.lat;
    property.longitude = geo_data.results[0].geometry.location.lng;
  
    res.render('property/review', {
      title: 'Avenue - Add Property',
      token: req.csrfToken()
    });
  }).catch(err => console.log(err));

};
