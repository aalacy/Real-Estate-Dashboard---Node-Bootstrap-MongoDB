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

  console.log(user);

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

  const { body: { startDate, endDate } }  = req;

  console.log(new Date(startDate), new Date(endDate))
  const properties = await Properties.find({ user_id: user.id }, { _id: 0 });
  const transactions = await Transactions.find({$and:[{created_at:{$gte:new Date(startDate)}},{created_at:{$lte:new Date(endDate)}}, {user_id: user.id}]}, { _id: 0 });
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
  let Jan1 = 0, 
    Feb1 = 0, 
    Mar1 = 0, 
    Apr1 = 0, 
    May1 = 0, 
    Jun1 = 0, 
    Jul1 = 0, 
    Aug1 = 0, 
    Sep1 = 0, 
    Oct1 = 0, 
    Nov1 = 0, 
    Dec1 = 0;

  transactions.map(transaction => {
    const date = moment(transaction.created_at).format('MMM');
    const amount = parseFloat(transaction.amount.replace(',', ''));
    switch (date) {
      case 'Jan':
        if (amount > 0) {
          Jan += amount;
        } else {
          Jan1 += amount;
        }
        break;
      case 'Feb':
        if (amount > 0) {
          Feb += amount;
        } else {
          Feb1 += amount;
        }
        break;
      case 'Mar':
        if (amount > 0) {
          Mar += amount;
        } else {
          Mar1 += amount;
        }
        break;
      case 'Apr':
        if (amount > 0) {
          Apr += amount;
        } else {
          Apr1 += amount;
        }
        break;
      case 'May':
        if (amount > 0) {
          May += amount;
        } else {
          May1 += amount;
        }
        break;
      case 'Jun':
        if (amount > 0) {
          Jun += amount;
        } else {
          Jun1 += amount;
        }
        break;
      case 'Jul':
        if (amount > 0) {
          Jul += amount;
        } else {
          Jul1 += amount;
        }
        break;
      case 'Aug':
        if (amount > 0) {
          Aug += amount;
        } else {
          Aug1 += amount;
        }
        break;
      case 'Sep':
        if (amount > 0) {
          Sep += amount;
        } else {
          Sep1 += amount;
        }
        break;
      case 'Oct':
        if (amount > 0) {
          Oct += amount;
        } else {
          Oct1 += amount;
        }
        break;
      case 'Nov':
        if (amount > 0) {
          Nov += amount;
        } else {
          Nov1 += amount;
        }
        break;
      case 'Dec':
        if (amount > 0) {
          Dec += amount;
        } else {
          Dec1 += amount;
        }
        break;
    }
  })

  return res.json({
    status: 200,
    data: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec],
    data1: [Jan1, Feb1, Mar1, Apr1, May1, Jun1, Jul1, Aug1, Sep1, Oct1, Nov1, Dec1]
  })
}
