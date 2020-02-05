/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');
const Transactions = mongoose.model('Transactions');
var moment = require('moment');

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
  let labels = [];
  let vacant_cnt = 0;
  properties.map(property => {
    if (property.current_value < property.purchase_price) {
	   portfolio_value -= property.current_value;
    } else {
      portfolio_value += property.current_value;
    }

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

    property.tenancies.map(unit => {
      if (unit.rent_frequency == 'Vacant') {
        vacant_cnt++;
      }
    });
  })

  if (portfolio_value && total_purchase_price ) {
    badge_value = portfolio_value - total_purchase_price;
  } 

  const occupancy = all_units == 0 ? 0.0 : (occupied * 100 / all_units).toFixed(2);
  res.render('dashboard/index', {
    token: req.csrfToken(),
    title: 'Avenue - Dashboard',
    username: user.first_name,
    properties: properties,
    portfolio_value,
    rental_income,
    all_units,
    occupancy,
    markers: JSON.stringify(markers),
    market_data,
    income_data,
    labels,
    badge_value,
    vacant_cnt
  });
};

exports.get_cash_flow = async function(req, res) {
  const { user } = req.session;

  const properties = await Properties.find({ user_id: user.id }, { _id: 0 });
  const transactions = await Transactions.find({ user_id: user.id }, { _id: 0 });
  let Jan = 0, 
    Feb = 0, 
    Mar = 0, 
    Apr = 0, 
    May = 0, 
    Jun = 0, 
    Jul = 0, 
    Aug = 0, 
    Sep = 0, 
    Oct = 0, 
    Nov = 0, 
    Dec = 0;

  transactions.map(transaction => {
    const date = moment(transaction.created_at).format('MMM');
    const amount = parseFloat(transaction.amount.replace(',', ''));
    switch (date) {
      case 'Jan':
        Jan += amount;
        break;
      case 'Feb':
        Feb += amount;
        break;
      case 'Mar':
        Mar += amount;
        break;
      case 'Apr':
        Apr += amount;
        break;
      case 'May':
        May += amount;
        break;
      case 'Jun':
        Jun += amount;
        break;
      case 'Jul':
        Jul += amount;
        break;
      case 'Aug':
        Aug += amount;
        break;
      case 'Sep':
        Sep += amount;
        break;
      case 'Oct':
        Oct += amount;
        break;
      case 'Nov':
        Nov += amount;
        break;
      case 'Dec':
        Dec += amount;
        break;
    }
  })

  return res.json({
    status: 200,
    data: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
  })
}
