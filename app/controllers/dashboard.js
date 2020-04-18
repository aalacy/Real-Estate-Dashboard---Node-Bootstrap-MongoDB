/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const Properties = mongoose.model('Properties');
const Transactions = mongoose.model('Transactions');
var moment = require('moment');

Colors = {};
Colors.names = {
    aqua: "#00ffff",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    blue: "#0000ff",
    brown: "#a52a2a",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgrey: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkviolet: "#9400d3",
    fuchsia: "#ff00ff",
    gold: "#ffd700",
    green: "#008000",
    indigo: "#4b0082",
    khaki: "#f0e68c",
    lightblue: "#add8e6",
    lightcyan: "#e0ffff",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    magenta: "#ff00ff",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    orange: "#ffa500",
    pink: "#ffc0cb",
    purple: "#800080",
    violet: "#800080",
    red: "#ff0000",
    silver: "#c0c0c0",
    yellow: "#ffff00"
};

Colors.random = function() {
    var result;
    var count = 0;
    for (var prop in this.names)
        if (Math.random() < 1/++count)
           result = prop;
    return Colors.names[result];
};

exports.index = async function(req, res) {
  const { user } = req.session;
  const current_user = await Users.findOne({id: user.id}, {_id: 0});
  const properties = await Properties.find({ user_id: user.id }, { _id: 0 }).sort('-rental_yield');
  const transactions = await Transactions.find({ user_id: user.id }, { _id: 0 });
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

  let total_current_value = 0;
  properties.map(property => {
    if (property.current_value < property.purchase_price) {
	   portfolio_value -= property.current_value;
    } else {
      portfolio_value += property.current_value;
    }

    total_purchase_price += property.purchase_price;
  	all_units += property.units;
  	if (property.status == 'Occupied') {
  		occupied += property.units;
  	}
    const title = property.address + ', ' + property.city
  	markers.push({
      "lng": property.lng,
      "lat": property.lat,
      "title": title,
      "type": property.units == 1 ? 'single' : 'multiple',
      "link": '/property/overview/' + property.id
    });
  	rental_income += property.rental_income;
    market_data.push(property.current_value);
    income_data.push(property.rental_income);
    labels.push(property.address.toString());

    property.tenancies.map(unit => {
      if (unit.rent_frequency == 'Vacant') {
        vacant_cnt++;
      }
    });
  })

  if (portfolio_value && total_purchase_price) {
    badge_value = portfolio_value - total_purchase_price;
  } 

  const occupancy = all_units == 0 ? 0.0 : (occupied * 100 / all_units).toFixed(2);
  res.render('dashboard/index', {
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
    title: 'Avenue - Dashboard',
    username: current_user.first_name,
    properties: properties,
    portfolio_value,
    rental_income,
    total_current_value,
    all_units,
    occupancy,
    markers: JSON.stringify(markers),
    market_data,
    income_data,
    labels,
    badge_value,
    vacant_cnt,
  });
};

exports.get_cash_flow = async function(req, res) {
  const { user } = req.session;

  const { body: { startDate, endDate } }  = req;

  const properties = await Properties.find({ user_id: user.id }, { _id: 0 });
  const transactions = await Transactions.find({$and:[{created_at:{$gte:new Date(startDate)}},{created_at:{$lte:new Date(endDate)}}, {user_id: user.id}]}, { _id: 0 });

  const dateStart = moment(startDate);
  const dateEnd = moment(endDate);

  let categories = []
  while (dateEnd.diff(dateStart, 'months') >= 0) {
    categories.push(dateStart.format('MMM YYYY'))
    dateStart.add(1, 'month')
  }

  categories.pop()

  let income_data = [];
  let expenses_data = [];
  let net_income_data = []
  for (let i = 0; i < categories.length; i++) {
   income_data.push(0)
   expenses_data.push(0)
   net_income_data.push(0)
  }

  transactions.map(transaction => {
    const date = moment(transaction.created_at).format('MMM YYYY');
    let amount = 0;
    if (transaction.amount) {
      amount = parseFloat(transaction.amount.replace(',', ''));
    }
    const idx = categories.indexOf(date)
    if (idx > -1) {
      if (transaction.type == 'In') {
        income_data[idx] += amount;
        net_income_data[idx] += amount;
      } else {
        expenses_data[idx] -= amount
        net_income_data[idx] -= amount;
      }
    }
  })

  return res.json({
    status: 200,
    categories,
    data: [
      {
        type: 'column',
        showInLegend: true,  
        name: 'Income',
        data: income_data,
        color: '#41D3BD'
      },
      {
        type: 'column',
        showInLegend: true,  
        name: 'Expenses',
        data: expenses_data,
        color: '#EF476F'
      },
      {
        type: 'spline',
        name: 'Net Income',
        data: net_income_data,
        dashStyle: 'longdash',
        marker: {
            lineWidth: 2,
            lineColor: '#555F7F',
            fillColor: 'white',
        }
      }
    ],
  })
}
