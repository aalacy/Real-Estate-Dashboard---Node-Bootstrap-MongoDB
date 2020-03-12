/*!
 * Module dependencies.
 */

const fs = require('fs');
const request = require('request-promise');
const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');
const Documents = mongoose.model('Documents');
const Transactions = mongoose.model('Transactions');
const Tenants = mongoose.model('Tenants');
var moment = require('moment');
const uuidv4 = require('uuid/v4');

 /**
  * Constants map for the property details
  */

const freq = {
  Daily: 365,
  Weekly: 52,
  Fortnightly: 26,
  Monthly: 12,
  Vacant: 0,
};

const PROPERTY_TYPE = {
    detached_house: 'Detached House',
    'semi-detached_house': 'Semi Detached House',
    terraced_house: 'Terraced House',
    flat: 'Flat'
};

const CONSTRUCTION_DATE = {
  pre_1914: 'Pre-1914',
  '1914_2000': 'Between 1914-2000',
  '2000_onwards': '2000 onwards'
};

const FINISH_QUALITY = {
  very_high: 'Very High',
  high: 'High',
  average: 'Average',
  below_average: 'Below Average',
  unmodernised: 'Unmodernised'
};

const OUTDOOR_SPACE = {
  none: 'None',
  balcony_terrace: 'Balcony Terrace',
  garden: 'Garden',
  garden_very_large: 'Garden (Large)',

};

const OFF_STREET_PARKING = {
  '0': 'No parking',
  '1': '1 Space',
  '2': '2 Spaces',
  '3': '3+ Spaces'
};

const calcRentalYield = function(purchase_price, rental_income) {
  let rental_yield = purchase_price == 0 ? 0 : parseFloat(rental_income) * 100 / parseFloat(purchase_price);
  console.log('rental_yield', rental_yield)
  return rental_yield.toFixed(2);
}

exports.all = async function(req, res, next) {
  const { user } = req.session;
  
  let all_properties = await Properties.find({user_id: user.id}, { _id: 0 }).sort('-current_value');
  const new_all_properties = [];
  let transactions = await Transactions.find({ user_id: user.id }, { _id: 0 }).sort('-created_at');
  all_properties.map((property) => {
    transactions = transactions.filter(transaction => transaction.property_id == property.id);
    let total_income = 0;
    let total_expenses = 0;
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      if ( amount >= 0) {
        total_income += amount
      } else {
        total_expenses += (amount)
      }
    })
    property.type = PROPERTY_TYPE[property.type];
    let net_profit = total_income - Math.abs(total_expenses);
    const total_cost = total_income + Math.abs(total_expenses);
    const income_percent = (total_income/total_cost*100).toFixed(2);
    const expenses_percent = total_cost > 0 ? (Math.abs(total_expenses)/total_income*100).toFixed(2) : 0;
    const operating_expense_ratio = expenses_percent;
    const gross_yield = (total_income/parseFloat(property.current_value)*100).toFixed(2);
    const net_yield = 0;
    if (property.purchase_price > 0) {
      net_yield = (net_profit/parseFloat(property.purchase_price)*100).toFixed(2);
    }
    new_all_properties.push({
      id: property.id,
      status: property.status,
      image: property.image,
      units: property.units,
      tenancies: property.tenancies,
      current_value: property.current_value,
      rental_yield: property.rental_yield,
      address: property.address,
      city: property.city,
      type: property.type,
      created_at: property.created_at,
      net_yield,
      gross_yield,
      total_income,
    });
  })
  // let occupied_properties = await Properties.find({ status: 'Occupied', user_id: user.id }, { _id: 0 });
  // let new_occupied_properties = [];
  // occupied_properties.map(property => {
  //   property.type = PROPERTY_TYPE[property.type];
  //   new_occupied_properties.push(property);
  // })
  // let vacant_properties = await Properties.find({ status: 'Vacant', user_id: user.id }, { _id: 0 });
  // let new_vacant_properties = [];
  // vacant_properties = vacant_properties.map(property => {
  //   property.type = PROPERTY_TYPE[property.type];
  //   new_vacant_properties.push(property);
  // })
  res.json({
    status: 'ok',
    properties: new_all_properties,
  });
};

exports.my = async function(req, res, next) {
  const { user } = req.session;
 
  res.render('property/myproperties', {
    title: 'Avenue - MyProperties',
    token: req.csrfToken(),
  });
};

exports.overview = async function(req, res) {
  const { params: { id, unit_id, tabs } } = req;
  if (id == '...' || tabs == '...') {
    return res.json({})
  }
  const { user } = req.session;
  const property = await Properties.findOne({ id: id }, { _id: 0 });
  const documents = await Documents.find({ user_id: user.id, property_id: id, status: 'alive' }, { _id: 0 }).limit(3);
  const transactions = await Transactions.find({ user_id: user.id, property_id: id }, { _id: 0 }).sort('-created_at');

  let empty_cnt = 0;
  if (property.ownership == "") empty_cnt++;
  if (property.purchase_price == 0) empty_cnt++;
  if (property.purchase_date == "") empty_cnt++;
  if (property.type == "") empty_cnt++;
  if (property.construction_date == "") empty_cnt++;
  if (property.finish_quality == "") empty_cnt++;
  if (property.square_feet == 0) empty_cnt++;
  if (property.outdoor_space == 0) empty_cnt++;
  if (property.off_street_parking == "") empty_cnt++;
  empty_cnt = (11 - empty_cnt) / 11 * 100;
  empty_cnt = empty_cnt.toFixed(0);

  property.type = PROPERTY_TYPE[property.type];
  property.construction_date = CONSTRUCTION_DATE[property.construction_date];
  property.outdoor_space = OUTDOOR_SPACE[property.outdoor_space];
  property.finish_quality = FINISH_QUALITY[property.finish_quality];
  property.off_street_parking = OFF_STREET_PARKING[property.off_street_parking];
  const total_units = property.tenancies.length;
  let vacant_cnt = 0;
  const chart_labels = JSON.stringify(['Vacant', 'Tenancy']);
  let vacant_units = [];
  let occupied_units = [];
  property.tenancies.map(tenancy => {
    if (tenancy.rent_frequency == 'Vacant') {
      vacant_cnt++;
      vacant_units.push(tenancy);
    } else {
      occupied_units.push(tenancy);
    }
  });
  const vacant_value = (vacant_cnt/total_units*100).toFixed(0);
  const tenancy_value =  ((total_units-vacant_cnt)/total_units*100).toFixed(0);
  const chart_data = [vacant_value, tenancy_value];

  // expenses breakdown
  let expenses_breakdown = {};
  let breakdown_percent = {};
  const expenses_categories = ['Insurance', 'Repairs & Maintenance', 'Management Fees', 'Utilities', 'Tax', 'Legal', 'Mortgage or Loans', 'Uncategorised'];
  expenses_categories.map((item) => {
    expenses_breakdown[item] = 0;
  })

  // total income and expenses
  let total_income = 0;
  let total_expenses = 0;
  transactions.forEach(transaction => {
    const amount = parseFloat(transaction.amount) || 0;
    if ( amount >= 0) {
      total_income += amount
    } else {
      total_expenses += (amount)
      expenses_breakdown[transaction.category] += Math.abs(amount)
    }
  })

  transactions.forEach(transaction => {
    breakdown_percent[transaction.category] = (expenses_breakdown[transaction.category]/Math.abs(total_expenses) * 100).toFixed(1)
  })

  // sort
  sortedBreakdownKey = Object.keys(expenses_breakdown).sort(function(a, b){return expenses_breakdown[b]-expenses_breakdown[a]})
  sortedBreakdown = {}
  sortedBreakdownKey.map(key => {
    sortedBreakdown[key] = expenses_breakdown[key];
  })

  expenses_chart_data = []
  const colors = ['#DEEFB7', '#FFAF87', '#C9CAD9', '#051a35', '#0e67dc', '#ef476f', '#41d3bd', '#555f7f'];
  Object.keys(sortedBreakdown).map((item, i) => {
    if (sortedBreakdown[item] > 0) {
      expenses_chart_data.push({
        name: item,
        color: colors[i],
        y: sortedBreakdown[item],
      })
    }
  })

  let net_profit = total_income - Math.abs(total_expenses);
  const total_cost = total_income + Math.abs(total_expenses);
  const income_percent = (total_income/total_cost*100).toFixed(2);
  const expenses_percent = total_cost > 0 ? (Math.abs(total_expenses)/total_income*100).toFixed(2) : 0;
  const operating_expense_ratio = expenses_percent;
  const gross_yield = (total_income/parseFloat(property.current_value)*100).toFixed(2);
  const net_yield = 0;
  if (property.purchase_price > 0) {
    net_yield = (net_profit/parseFloat(property.purchase_price)*100).toFixed(2);
  }

  // recent 5 transactions
  const recentTrans = transactions.slice(4)

  res.render('property/overview', {
    title: 'Avenue - Overview',
    token: req.csrfToken(),
    property,
    empty_cnt,
    total_units,
    vacant_cnt,
    chart_labels,
    chart_data,
    vacant_value,
    tenancy_value,
    documents,
    vacant_units,
    occupied_units,
    unit_id,
    tabs,
    property_id: property.id,
    total_income,
    total_expenses,
    income_percent,
    expenses_percent,
    total_income,
    net_profit,
    expenses_breakdown: sortedBreakdown,
    breakdown_percent,
    expenses_chart_data: JSON.stringify(expenses_chart_data),
    colors,
    recentTrans,
    operating_expense_ratio,
    gross_yield,
    net_yield
  });
};

exports.detail = async function(req, res) {
  const { params: { id } } = req;
  const property = await Properties.findOne({ id: id }, { _id: 0 });

  res.render('property/detail', {
    title: 'Avenue - Detail',
    token: req.csrfToken(),
    property
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

exports.search = async function(req, res) {
  const { params: { query } } = req;
  const { user } = req.session;
  const myproperties = await Properties.find( {user_id: user.id}, { _id: 0 });
  const _q = query.toLowerCase()
  units = [];
  tenants = []
  properties = []
  myproperties.map(property => {
    if (property.address.toLowerCase().includes(_q) || property.city.toLowerCase().includes(_q)) {
      properties.push(property);
    }

    property.tenancies.map(unit => {
      if (unit.description.toLowerCase().includes(_q)) {
        units.push({
          id: unit.id,
          property_name: `${property.address}, ${property.city}`,
          property_id: property.id,
          description: unit.description,
          active: unit.rent_frequency == 'Vacant'
        })
      }
      unit.tenants.map(tenant => {
        if ( tenant.first_name.toLowerCase().includes(_q) ||
        tenant.last_name.toLowerCase().includes(_q)) {
          tenants.push({
            unit_id: unit.id,
            property_id: property.id,
            property_name: `${property.address}, ${property.city}`,
            unit_name: unit.description,
            first_name: tenant.first_name,
            last_name: tenant.last_name,
          })
        }
      })
    })
  })
  return res.json({
    status: 200,
    properties: properties.slice(0, 5),
    tenants: tenants.slice(0, 5),
    units: units.slice(0, 5)
  })
};

exports.create = async function(req, res) {
  const { body: { property, document } } = req;

  const { user } = req.session;
  property.user_id = user.id;

  const address = `https://maps.googleapis.com/maps/api/geocode/json?address=${property.fulladdress.split(' ').join('+')}&key=${process.env.GOOGLE_MAP_KEY}`;

  const floor_area_url = `https://api.propertydata.co.uk/floor-areas?key=${process.env.PROPERTYDATA_API_KEY}&postcode=${property.zip.split(' ').join('+')}`

  const floor_area_list = await request({ uri: floor_area_url, json: true });
  if (floor_area_list['known_floor_areas']) {
    floor_area_list['known_floor_areas'].map(area => {
      if (area.address.replace(',', '').replace(' ', '').toLowerCase().includes(property.address.replace(',', '').replace(' ', '').toLowerCase())) {
        property.square_feet = parseFloat(area.square_feet);
      }
    });
  }
  
  request({uri: address, json: true}).then(geo_data => {
    property.lat = geo_data.results[0].geometry.location.lat;
    property.lng = geo_data.results[0].geometry.location.lng;
  
    const myproperty = new Properties(property);
    myproperty.status = 'Vacant';
    myproperty.id = uuidv4();
    myproperty.image = document.path;
    for (let i = 1; i <= parseInt(property.units); i++) {
      const unit = {
        id: uuidv4(),
        description: 'Unit ' + i,
        rent_price: 0,
        rent_frequency: 'Vacant',
        tenants: []
      }
      myproperty.tenancies.push(unit)
    }

    return myproperty.save().then(_property => {
      res.redirect('/property/overview/' + _property.id);
    });
  }).catch(err => console.log(err));
};

exports.update = async function(req, res) {
  const { body: { property } } = req;

  const address = `https://maps.googleapis.com/maps/api/geocode/json?address=${property.fulladdress.split(' ').join('+')}&key=${process.env.GOOGLE_MAP_KEY}`;
  
  const myproperty = await Properties.findOne({ id: property.id }, { _id: 0 });

  request({uri: address, json: true}).then(geo_data => {
    property.lat = geo_data.results[0].geometry.location.lat;
    property.lng = geo_data.results[0].geometry.location.lng;
    property.purchase_price = property.purchase_price.replace(/,/g, '') ? parseFloat(property.purchase_price.replace(/,/g, '')) : 0;
    property.bedrooms = property.bedrooms.replace(/,/g, '') ? parseInt(property.bedrooms.replace(/,/g, '')) : 0;
    property.bathrooms = property.bathrooms.replace(/,/g, '') ? parseInt(property.bathrooms.replace(/,/g, '')) : 0;
    property.square_feet = property.square_feet.replace(/,/g, '') ? parseFloat(property.square_feet.replace(/,/g, '')) : 0;
  
    property.is_new = false;
    property.rental_yield = calcRentalYield(property.purchase_price, myproperty.rental_income);
    property.update_at = moment().format('YYYY-MM-DD HH:mm:ss');
    const new_values = { $set: property };

    return Properties.updateOne({ id: property.id }, new_values).then(_property => {
      res.redirect('/property/overview/' + property.id);
    });
  }).catch(err => console.log(err));
};

exports.remove = async function(req, res) {
  const { body: { property } } = req;

  await Properties.deleteOne({ id: property.id });
  res.redirect('/property/my');
};

// Tenancy
exports.documents = async function(req, res) {
  const { user } = req.session;  
  const properties = await Properties.find({ user_id: user.id }, { _id: 0 });
  const documents = await Documents.find({ user_id: user.id, status: 'alive' }, { _id: 0 });
  res.render('property/documents', {
    token: req.csrfToken(),
    title: 'Avenue - Documents',
    properties,
    documents
  });
};

exports.documents_upload = async function(req, res) {
  const { user } = req.session;  
  const mydocument = new Documents();
  mydocument.id = uuidv4();
  mydocument.user_id = user.id;
  mydocument.size = req.file.size;
  mydocument.mimetype = req.file.mimetype;
  mydocument.filename = req.file.originalname;
  mydocument.path = req.file.path.replace('public/', '');
  await mydocument.save();
  return res.status( 200 ).send( mydocument );
};

exports.documents_delete = async function(req, res) {
  const { user } = req.session;
  const { body: { document } } = req;
  new_values = {
    $set: { status: 'deleted' }
  };

  return Documents.updateOne({ id: document.id }, new_values).then(async () => {
    // const documents = await Documents.find({ proper: document.id, status: 'alive' }, { _id: 0 });
    res.json({
      status: 200,
      message: "Successfully deleted."
    });
  }).catch(e => {
    res.json({
      status: 422,
      message: "Failed to delete the document."
    });
  });
}

exports.upload_doc_to_property = async function(req, res) {
  const { body: { document } } = req;
  const mydocument = await Documents.findOne({ id: document.id });
  const property_name = document.property_name;
  const unit_name = document.unit_name;
  const new_document = {
    tag: document.tag,
    property_id: document.property_id,
    unit_id: document.unit_id,
    display_name: property_name + ' - ' + unit_name,
    property_name,
    unit_name,
    category: document.category,
    update_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    status: 'alive',
    size: mydocument.size,
    mimetype: mydocument.mimetype,
    filename: mydocument.filename,
    path: mydocument.path
  }

  if (document.status == 'edit') {
    new_document.size = document.size;
    new_document.mimetype = document.mimetype;
    new_document.filename = document.filename;
    new_document.path = document.path;
  }
  new_values = {
    $set: new_document
  };

  return Documents.updateOne({ id: document.id }, new_values).then(() => {
    res.json({
      status: 200,
      message: "Successfully uploaded."
    })
  }).catch(e => {
    res.json({
      status: 422,
      message: "Failed to upload the document."
    })
  });
}

exports.tenancies = async function(req, res) {
  const { user } = req.session;  
  const properties = await Properties.find({ user_id: user.id }, { _id: 0 });
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
    occupied_properties.push(occupied_property);
    vacant_properties.push(vacant_property);
  });

  res.render('property/tenancies', {
    token: req.csrfToken(),
    title: 'Avenue - Tenancies',
    properties,
    occupied_properties,
    vacant_properties,
    all_tenancies,
    occupied_tenancies,
    vacant_tenancies
  });
};

exports.all_units = async function(req, res) {
  const { body: { property } } = req;
  const myproperty = await Properties.findOne({ id: property.id }, { _id: 0 });
  return res.json({
    status: 200,
    units:myproperty.tenancies
  })
}

exports.new_tenant = async function(req, res) {
  const { body: { property, unit, tenant } } = req;

  let new_tenant = new Tenants(tenant);
  let new_values = {};
  if (!tenant.id) {
    new_tenant.setDate();
    new_tenant.setID();
    await new_tenant.save();
  } else {
    new_values = {
      $set: {  
        first_name: tenant.first_name,
        last_name: tenant.last_name,
        email: tenant.email,
        phone_number: tenant.phone_number
      }
    };
    await Tenants.updateOne({ id: tenant.id }, new_values);
  }

  const myproperty = await Properties.findOne({ id: property.id });
  let tenancies = [];
  tenants_cnt = 0;
  myproperty.tenancies.map(_unit => {
    if (!_unit.tenants) {
      _unit.tenants = [];
    } 
    if (_unit.id == unit.id) {
      _unit.tenants.push(new_tenant);
      tenants_cnt = _unit.tenants.length;
    }
    tenancies.push(_unit);
  });

  new_values = {
    $set: { tenancies }
  };
  
  return Properties.updateOne({ id: property.id }, new_values).then(() => {
    res.json({
      status: 200,
      tenant: new_tenant,
      message: "Sucessfully added.",
      cnt: tenants_cnt
    })
  });
}

exports.delete_tenant = async function(req, res) {
  const { body: { property_id, unit_id, tenant_id } } = req;

  const myproperty = await Properties.findOne({ id: property_id });
  let tenancies = [];
  let tenants = []
  const myunit = myproperty.tenancies.map(_unit => {
    if (_unit.id == unit_id) {
      _unit.tenants = _unit.tenants.filter(_tenant => _tenant.id != tenant_id);
      tenants = _unit.tenants;
    }
    tenancies.push(_unit);
  });

  new_values = {
    $set: { tenancies }
  };
  
  return Properties.updateOne({ id: property_id }, new_values).then(() => {
    res.json({
      status: 200,
      message: 'Success',
      cnt: tenants.length
    })
  }).catch(e => {
    res.json({
      status: 500,
      message: 'Failure'
    })
  });
}

exports.new_unit = async function(req, res) {
  const { body: { property, unit } } = req;

  if (!unit.rent_price || unit.rent_price == 0) {
    unit.rent_frequency = 'Vacant';
  }
  const myproperty = await Properties.findOne({ id: property.id }, { _id: 0 });
  unit.rent_price = unit.rent_price.replace(/,/g, '') ? parseFloat(unit.rent_price.replace(/,/g, '')) : 0;
  try {
    unit.tenants = JSON.parse(unit.tenants);
  } catch(e) {}
  status = 'Occupied';
  let rental_income = myproperty.rental_income;
  let rental_yield = myproperty.rental_yield;
  let new_values = {};
  let units = myproperty.units;
  rental_income = myproperty.rental_income + freq[unit.rent_frequency] * parseFloat(unit.rent_price);
  rental_yield = calcRentalYield(myproperty.purchase_price, rental_income);
  if (!unit.id) {
    unit.id = uuidv4();
    unit.start_date = unit.start_date ? unit.start_date : "";
    unit.end_date = unit.end_date ? unit.end_date : "";
    unit.tenants = [];
    units += 1;
    new_values = {
      $push: { tenancies: unit },
      $set: { rental_income, rental_yield, units, status }
    };
  } else {
    let tenancies = [];
    rental_income = 0;
    myproperty.tenancies.map(element => {
      if (element.id != unit.id) {
        rental_income += freq[element.rent_frequency] * parseFloat(element.rent_price);
        tenancies.push(element);
      } else {
        rental_income += freq[unit.rent_frequency] * parseFloat(unit.rent_price);
        tenancies.push(unit);
      }
    });
    rental_yield = calcRentalYield(myproperty.purchase_price, rental_income);
    new_values = {
      $set: { rental_income, rental_yield, units, status, tenancies }
    };
  }
  return Properties.updateOne({ id: property.id }, new_values).then(() => {
    const link = req.headers.referer.split(req.headers.host);
    res.redirect(link[1]);
  });
};

exports.clear_unit = async function(req, res) {
  const { body: { unit_id, property_id } } = req;

  const myproperty = await Properties.findOne({ id: property_id });
  let tenancies = [];
  let rental_income = 0;
  myproperty.tenancies.map(element => {
    if (element.id != unit_id) {
      tenancies.push(element);
      rental_income += freq[element.rent_frequency] * parseFloat(element.rent_price);
    } else {
      element.start_date = element.end_date = '';
      element.rent_frequency = 'Vacant';
      element.rent_price = 0;
      tenancies.push(element);
    }
  });
  let rental_yield = myproperty.purchase_price == 0 ? 0 : rental_income * 0.01 / parseFloat(myproperty.purchase_price);
  new_values = {
    $set: { rental_income, rental_yield, tenancies }
  };
  return Properties.updateOne({ id: property_id }, new_values).then(() => {
    res.redirect('/property/overview/' + property_id);
  });
};

exports.delete_unit = async function(req, res) {
  const { body: { unit_id, property_id } } = req;

  const myproperty = await Properties.findOne({ id: property_id });
  let tenancies = [];
  let rental_income = 0;
  let status = "Occupied";
  myproperty.tenancies.map(element => {
    if (element.id != unit_id) {
      tenancies.push(element);
      rental_income += freq[element.rent_frequency] * parseFloat(element.rent_price);
      if (element.rent_frequency == "Vacant") {
        status = "Vacant";
      }
    } 
  });
  let rental_yield = myproperty.purchase_price == 0 ? 0 : rental_income * 0.01 / parseFloat(myproperty.purchase_price);
  const units = myproperty.units - 1;
  new_values = {
    $set: { rental_income, rental_yield, units, tenancies, status }
  };
  return Properties.updateOne({ id: property_id }, new_values).then(() => {
    res.redirect('/property/overview/' + property_id);
  });
};

exports.adjust_summary = async function(req, res) {
  const { body: { property: { current_value, id } } } = req;

  const _current_value = current_value.replace(/,/g, '');
  const myproperty = await Properties.findOne({ id: id }, { _id: 0 });
  let rental_yield = calcRentalYield(myproperty.purchase_price, myproperty.rental_income);
  const equity = parseFloat(_current_value) - parseFloat(myproperty.debt || 0); 
  const new_values = { $set: { current_value: _current_value, rental_yield, equity } };
  return Properties.updateOne({ id }, new_values).then(() => {
    res.redirect('/property/overview/' + id);
  });
};

exports.estimated_sale = async function(req, res) {
  const { body: { property_id } } = req;
  const property = await Properties.findOne({ id: property_id }, { _id: 0 });
  const estimate_url = `https://api.propertydata.co.uk/valuation-sale?key=${process.env.PROPERTYDATA_API_KEY}&postcode=${property.zip.replace(' ','')}&internal_area=${property.square_feet}&property_type=${property.type}&construction_date=${property.construction_date}&bedrooms=${property.bedrooms}&bathrooms=${property.bathrooms}&finish_quality=${property.finish_quality}&outdoor_space=${property.outdoor_space}&off_street_parking=${property.off_street_parking}`;
  const est_res = await request({ uri: estimate_url, json: true });
  console.log(est_res);
  if (est_res.status == 'success') {
    return res.json({
      status: 200,
      message: 'Sucessfully got the estimate',
      estimate: est_res.result.estimate,
      margin: est_res.result.margin
    })
  } else {
    return res.json({
      status: 400,
      message: est_res.message
    })
  }
}

// Loan-to-value
exports.get_equity_debt = async function(req, res) {
  const { body: { property } } = req;
  const id = property.id;
  const myproperty = await Properties.findOne({ id }, { _id: 0 });
  const debt = parseFloat(myproperty.debt || 0)
  const equity = parseFloat(myproperty.equity || 0);
  const current_value = parseFloat(myproperty.current_value || 0);
  let percent = 0;
  if (current_value) {
    percent = Math.max(debt/current_value*100, equity/current_value*100)
  }
  percent = percent.toFixed(0)
  
  return res.json({
    status: 'ok',
    data: {
      debt,
      equity,
      percent,
      current_value
    }
  })
}

exports.new_loan = async function(req, res) {
  const { body: { property } } = req;

  const id = property.id;
  const myproperty = await Properties.findOne({ id }, { _id: 0 });
  const current_value = parseFloat(myproperty.current_value || 0);
  let percent = 0;
  if (current_value) {
    percent = Math.max(property.debt/current_value*100, property.equity/current_value*100)
  }
  percent = percent.toFixed(0)
  const new_values = { $set: property};
  return Properties.updateOne({ id }, new_values).then(async (dd) => {
    let newproperty = await Properties.findOne({ id }, { _id: 0 });
    res.json({
      status: 'ok',
      data: {
        debt: parseFloat(property.debt),
        equity: parseFloat(property.equity),
        percent,
        current_value,
        newproperty
      }
    })
  })
  .catch(e => {
    res.json({
      status: 'failure',
      err: e
    })
  });
};

exports.cashflow_date = async function(req, res) {
  const { body: { property } } = req;
  const { user } = req.session;

  const id = property.id;
  const date = property.date;
  let startDate = '1900-01-01';
  let endDate = '9999-01-01';
  const thisYear = moment().format('YYYY');
  switch (date) {
    case 'Current Month':
      startDate = moment().startOf('month').format('YYYY-MM-DD');
      endDate   = moment().endOf('month').format('YYYY-MM-DD');
      break;
    case 'Previous Month':
      startDate = moment().startOf('month').subtract(1, 'month').format('YYYY-MM-DD');
      endDate   = moment().startOf('month').subtract(1, 'day').format('YYYY-MM-DD');
      break;
    case 'YTD':
      startDate = thisYear + '-01-01'
      endDate = moment().format('YYYY-MM-DD');
      break;
    case 'Last Full Year':
      startDate = moment(thisYear + '-01-01').subtract(1, 'year').format('YYYY-MM-DD');
      endDate = moment(thisYear + '-01-01').subtract(1, 'day').format('YYYY-MM-DD');
      break;
  }
  // const transactions = await Transactions.find({ user_id: user.id, property_id: id }, { _id: 0 }).sort('-created_at');
  const transactions = await Transactions.find({$and:[{created_at:{$gte:new Date(startDate)}},{created_at:{$lte:new Date(endDate)}}, {user_id: user.id}]}, { _id: 0 });

  const myproperty = await Properties.findOne({ id }, { _id: 0 });

  // total income and expenses
  let total_income = 0;
  let total_expenses = 0;
  transactions.forEach(transaction => {
    const amount = parseFloat(transaction.amount) || 0;
    if ( amount >= 0) {
      total_income += amount
    } else {
      total_expenses += (amount)
    }
  })

  let net_profit = total_income - Math.abs(total_income);
  const total_cost = total_income + Math.abs(total_expenses);
  const income_percent = (total_income/total_cost*100).toFixed(2);
  const expenses_percent = total_cost > 0 ? (Math.abs(total_expenses)/total_cost*100).toFixed(2) : 0;
  const operating_expense_ratio = expenses_percent;
  const gross_yield = (total_income/parseFloat(myproperty.current_value)*100).toFixed(2);
  const net_yield = 0;
  if (myproperty.purchase_price > 0) {
    (net_profit/parseFloat(myproperty.purchase_price)*100).toFixed(2);
  }

  return res.json({
    status: 'ok',
    net_profit,
    total_income,
    total_expenses,
    operating_expense_ratio,
    gross_yield,
    net_yield
  })
}