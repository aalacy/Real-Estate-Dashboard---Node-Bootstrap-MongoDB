/*!
 * Module dependencies.
 */

const fs = require('fs');
const request = require('request-promise');
const mongoose = require('mongoose');
const Properties = mongoose.model('Properties');
const Documents = mongoose.model('Documents');
const Tenants = mongoose.model('Tenants');
const Transactions = mongoose.model('Transactions');
var moment = require('moment');
const uuidv4 = require('uuid/v4');
const urlLib = require('url');

exports.all = async function(req, res) {
  const { user } = req.session;

  let properties  = await Properties.find({ user_id: user.id }, { _id: 0 });

  res.render('transaction/index', {
    title: 'Avenue - Transactions',
    // token: req.csrfToken(),
    token: 'req.csrfToken()',
    properties
  });
}

exports.all_get = async function(req, res) {
  const { user } = req.session;
  const { params: { id, cnt } } = req;

  let transactions = []
  if (id != undefined && cnt != -1) {
    transactions = await Transactions.find({ user_id: user.id, property_id: id, type: 'In' }, { _id: 0 }).limit(Number(cnt));
  } else {
    transactions = await Transactions.find({ user_id: user.id }, { _id: 0 });
  }

  const properties = await Properties.find({ user_id: user.id }, { _id: 0 });
  const documents = await Documents.find({}, { _id: 0 });
  let newTransactions = transactions.map(function(transaction)  {
  	const property = properties.filter(property => property.id == transaction.property_id);
  	let propertyName = ''
    let unit = []
  	if (property.length > 0) {
	  	propertyName = property[0].address + ', ' + property[0].city;
      if (property[0].tenancies.length > 1) {
        unit = property[0].tenancies.filter(unit => unit.id == transaction.unit_id)
        if (unit.length > 0) {
          propertyName += ' • ' + unit[0].description
        }
      }
  	}
    const doc = documents.filter(document => document.id == transaction.document_id);
  	return { 
  		id: transaction.id,
  		created_at: moment(transaction.created_at).format('YYYY-MM-DD'), 
  		propertyName,
      property_id: transaction.property_id,
      unit_id: transaction.unit_id,
      unit_name: unit.length > 0 ? unit[0].description : '',
  		user: transaction.user,
  		category: transaction.category,
  		account: transaction.account,
  		amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      mimetype: doc.mimetype,
      path: doc.path
 	  };
  })

  const incomeTransactions = newTransactions.filter(transaction => transaction.type == "In");
  const expensesTransactions = newTransactions.filter(transaction => transaction.type == "Out");

  res.json({
    transactions: newTransactions,
    incomeTransactions,
    expensesTransactions
  });
}

exports.create = async function(req, res) {
  const { body: { transaction, document } } = req;

  const { user } = req.session;

  console.log('===', transaction)
  const newTransaction  = new Transactions(transaction);
  newTransaction.id = uuidv4();
  newTransaction.user_id = user.id;
  newTransaction.document_id = document.id;
  if (newTransaction.category == '') {
    newTransaction.category = 'Uncategorised';
  }
  newTransaction.amount = newTransaction.amount.replace(/,/g, '')

  const referer = urlLib.parse(req.headers.referer)

  newTransaction.save().then(() => {
 	  res.redirect(referer.path);
  })
}

exports.edit = async function(req, res) {
  const { body: { transaction } } = req;

  const referer = urlLib.parse(req.headers.referer)

  const { user } = req.session;
  transaction.update_at = moment().format('YYYY-MM-DD HH:mm:ss');
  const new_values = { $set: transaction };

  return Transactions.updateOne({ id: transaction.id }, new_values).then(() => {
    res.redirect(referer.path);
  });
}

exports.delete = async function(req, res) {
  const { body: { transaction } } = req;

  const { user } = req.session;

  Transactions.deleteMany({id: {'$in': transaction.ids}}).then( (err) => {
  	res.json({
  		status:  200,
  		message: 'Successfully deleted'
  	})
  }).catch(err => {	
  	console.log(err);
  })
}

exports.mark =  async function(req, res) {
  const { body: { transaction, status } } = req;

  const { user } = req.session;

  Transactions.updateMany({id: {'$in': transaction.ids}}, { $set: { status } }).then( (err) => {
    res.json({
      status:  200,
      message: 'Successfully deleted'
    })
  }).catch(err => { 
    console.log(err);
  })
}