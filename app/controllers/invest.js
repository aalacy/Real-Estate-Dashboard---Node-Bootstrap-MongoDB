/*!
 * Module dependencies.
 */

const fs = require('fs');
const request = require('request-promise');
const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');
const Documents = mongoose.model('Documents');
const Transactions = mongoose.model('Transactions');
const Invests = mongoose.model('Invests');
const Investshorts = mongoose.model('Investshorts');
var moment = require('moment');
const uuidv4 = require('uuid/v4');
const CronJobManager = require('cron-job-manager');

const propertyList = [
	"repossessed-properties",
	"unmodernised-properties",
	"cash-buyers-only-properties",
	"auction-properties",
	"quick-sale-properties",
	"land-plots-for-sale",
	"new-build-properties",
	"hmo-licenced-properties",
	"reduced-properties",
	"investment-portfolios",
	"back-on-market",
	"slow-to-sell-properties",
	"short-lease-properties",
	"georgian-houses",
	"holiday-let-properties",
	"properties-in-growth-zones",
	"high-yield-properties",
	"tenanted-properties-for-sale",
]

const propertyRegions = [
	"north_east",
	"north_west",
	"east_midlands",
	"west_midlands",
	"east_of_england",
	"greater_london",
	"south_east",
	"south_west",
	"wales",
	"scotland",
	"northern_ireland"
]

cronManager = new CronJobManager();

exports.propertyListCron = async (req, res) => {
  console.log('propertyListCron')
  const _propertyList = propertyList[0]
  const _propertyRegion = propertyRegions[0]
  const property_list_url = `https://api.propertydata.co.uk/property-list?key=${process.env.PROPERTYDATA_API_KEY}&list=${_propertyList}&region=${_propertyRegion}`;
  const list_res = await request({ uri: property_list_url, json: true }).catch(e => {
    console.log(e)
  });
  if (list_res.status == 'success') {
  	const properties = list_res.properties.map(property => {
  		property.category = _propertyList
  		property.type = _propertyRegion
  		return property
  	})
  	
  	await Invests.insertMany(properties).catch(e => {
  		console.log(e)
  	})
  }

  return res.json({
  	status: 200
  })
}

exports.index = async function(req, res) {
  const { user } = req.session;


  const _propertyList = propertyList.map(list => {
	  let category = list.replace(/-/g, ' ').replace('properties', '').trim()
	    category = category[0].toUpperCase() + category.substr(1)

	  return {
	  	text: category,
	  	value: list
	  }
  })

  res.render('invest/index', {
    title: 'Avenue - Invest',
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
    _propertyList,
    propertyRegions
  });
}

// get the all the invests and shortlist data
exports.all = async (req, res) => {
	const invests = await Invests.find({}, {_id: 0})
	let shortListIds = await Investshorts.find({}, {_id: 0})
	shortListIds = shortListIds.map(ids => ids.invest_id)
	const shortLists = await Invests.find({ id: {$in: shortListIds} }, {_id: 0})

	res.json({
		status: 200,
		invests,
		shortLists,
		shortListIds
	})
}

exports.manageShortList = async (req, res) => {
	const { user } = req.session;
	const { invest: { id } } = req.body;

	const checkList = await Investshorts.findOne({ invest_id: id }, {_id: 0})
	let shortLists = []
	let shortListIds = []
	let type = 'add'
	if (checkList) { // already in the shortlist
		await Investshorts.deleteOne({ invest_id: id })
		type = 'remove'
	} else { // should be added to short list
		let newInvest = new Investshorts()
		newInvest.id = uuidv4()
		newInvest.user_id = user.id
		newInvest.invest_id = id

		await newInvest.save().catch(e => {
			console.log(e)
		})
	}

	shortListIds = await Investshorts.find({}, {_id: 0 })
	shortListIds = shortListIds.map(ids => ids.invest_id)
	shortLists = await Invests.find({ id: {$in: shortListIds} }, {_id: 0})
	res.json({
		status: 200,
		type,
		shortLists,
		shortListIds
	})
}
