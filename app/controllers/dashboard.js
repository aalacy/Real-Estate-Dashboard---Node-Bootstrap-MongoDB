/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');

exports.index = async function(req, res) {
  const { user } = req.session;
  const properties = await Properties.find({ user_id: user.id }, { _id: 0 }).sort('-rental_yield');
  let portfolio_value = 0;
  let total_purchase_price = 0;
  let badge_value = 0;
  let rental_income = 0;
  let all_units = 0;
  let occupied = 0;
  let markers = [];
  let market_data = [];
  let income_data = [];
  let labels = []
  properties.map(property => {
  	portfolio_value += property.current_value;
    total_purchase_price += property.purchase_price;
  	rental_income += property.rental_income;
  	all_units += property.units;
  	if (property.status == 'Occupied') {
  		occupied += property.units;
  	}
  	markers.push({"lng": property.lng, "lat": property.lat});
    market_data.push(property.current_value);
    income_data.push(property.rental_income);
    labels.push(property.address.toString());
  })

  if (portfolio_value && total_purchase_price ) {
    badge_value = portfolio_value - total_purchase_price;
  } 

  const occupancy = all_units == 0 ? 0.0 : (occupied * 100 / all_units).toFixed(2);
  console.log(labels)
  res.render('dashboard/index', {
    token: req.csrfToken(),
    title: 'Avenue - Dashboard',
    properties: properties,
    portfolio_value,
    rental_income,
    all_units,
    occupancy,
    markers: JSON.stringify(markers),
    market_data,
    income_data,
    labels,
    badge_value
  });
};
