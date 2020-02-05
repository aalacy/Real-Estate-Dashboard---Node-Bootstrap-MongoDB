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
  let newTransactions = transactions.map(function(transaction)  {
  	const property = properties.filter(property => property.id == transaction.property_id);
  	let propertyName = ''
  	if (property.length > 0) {
	  	propertyName = property[0].address + ', ' + property[0].city;
  	}
  	return { 
  		id: transaction.id,
  		created_at: moment(transaction.created_at).format('YYYY-MM-DD'), 
  		propertyName,
  		user: transaction.user,
  		category: transaction.category,
  		account: transaction.account,
  		amount: transaction.amount
 	};
  })

  res.json({
    transactions: newTransactions
  });
}

exports.create = async function(req, res) {
  const { body: { transaction } } = req;

  const { user } = req.session;

  const newTransaction  = new Transactions(transaction);
  newTransaction.id = uuidv4();
  newTransaction.user_id = user.id;

  newTransaction.save().then( () => {
 	res.redirect('/transaction/all');
  })
}

exports.edit = async function(req, res) {
  const { body: { transaction } } = req;

  const { user } = req.session;

}

exports.delete = async function(req, res) {
  const { body: { transaction } } = req;

  const { user } = req.session;

  console.log(transaction);

  Transactions.deleteOne({id: transaction.id}).then( (err) => {
  	console.log(err)
  	res.json({
  		status:  200,
  		message: 'Successfully deleted'
  	})
  }).catch(err => {	
  	console.log(err);
  })
}