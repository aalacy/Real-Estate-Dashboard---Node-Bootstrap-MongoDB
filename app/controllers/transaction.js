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

exports.all = async function(req, res) {
  const { user } = req.session;

  const properties = await Properties.find({ user_id: user.id }, { _id: 0 });

  res.render('transaction/index', {
    title: 'Avenue - Transactions',
    token: req.csrfToken(),
    properties
  });
}

exports.all_get = async function(req, res) {
  const { user } = req.session;
  let transactions = await Transactions.find({ user_id: user.id }, { _id: 0 });
  const properties = await Properties.find({ user_id: user.id }, { _id: 0 });
  const documents = await Documents.find({}, { _id: 0 });
  let newTransactions = transactions.map(function(transaction)  {
  	const property = properties.filter(property => property.id == transaction.property_id);
  	let propertyName = ''
  	if (property.length > 0) {
	  	propertyName = property[0].address + ', ' + property[0].city;
  	}
    const doc = documents.filter(document => document.id == transaction.document_id);
  	return { 
  		id: transaction.id,
  		created_at: moment(transaction.created_at).format('YYYY-MM-DD'), 
  		propertyName,
      property_id: transaction.property_id,
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

  const newTransaction  = new Transactions(transaction);
  newTransaction.id = uuidv4();
  newTransaction.user_id = user.id;
  newTransaction.document_id = document.id;
  if (transaction.type == "Out") {
    newTransaction.amount = '-' + transaction.amount;
  }

  newTransaction.save().then( () => {
 	  res.redirect('/transaction/all');
  })
}

exports.edit = async function(req, res) {
  const { body: { transaction } } = req;

  const { user } = req.session;
  transaction.update_at = moment().format('YYYY-MM-DD HH:mm:ss');
  const new_values = { $set: transaction };

  return Transactions.updateOne({ id: transaction.id }, new_values).then(() => {
    res.redirect('/transaction/all');
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
  const { body: { transaction } } = req;

  const { user } = req.session;

  Transactions.updateMany({id: {'$in': transaction.ids}}, { $set: {status: 'Paid'} }).then( (err) => {
    res.json({
      status:  200,
      message: 'Successfully deleted'
    })
  }).catch(err => { 
    console.log(err);
  })
}