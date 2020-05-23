const express = require('express');
var multer   =  require( 'multer' );
const path = require('path');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
var upload   =  multer( { storage: storage, dest: 'public/uploads/' } );
const router = express.Router();
const auth = require('./auth');
/**
 * Module dependencies.
 */

const dashboard = require('../app/controllers/dashboard');
const home = require('../app/controllers/home');
const property = require('../app/controllers/property');
const transaction = require('../app/controllers/transaction');
const service = require('../app/controllers/service');

//POST new user route (optional, everyone has access)
router.post('/signup', auth.optional, home.signup_post);
router.get('/signup', home.signup);

//POST login route (optional, everyone has access)
router.post('/signin', auth.optional, home.signin_post);
router.get('/signin', home.signin);

router.post('/logout', home.logout);

//  Password Reset
router.get('/password_reset', home.password_reset);
router.get('/password_recovery/*', home.password_recovery);

router.post('/password_reset_generate', home.password_reset_generate);
router.post('/password_reset_post', home.password_reset_post);

router.get('/settings', home.settings);
router.post('/settings/update', home.update_settings);
router.post('/settings/password', home.update_password);

//GET current route (required, only authenticated users have access)
router.use('/current', auth.required, home.current);

/**
 * Dashboard
 */

router.get('/', dashboard.index);
router.post('/dashboard/cash_flow', dashboard.get_cash_flow);
router.get('/dashboard/geojson/all', dashboard.get_all_geojson);

/**
 * Property
 */

router.get('/property/my', property.my);
router.get('/property/all', property.all);
router.get('/property/overview/:id/:tabs', property.overview);
router.get('/property/overview/:id/:tabs/:unit_id', property.overview);
router.get('/property/overview/:id', property.overview);
router.post('/property/overview/cashflow/date', property.cashflow_date);
router.get('/property/detail/:id', property.detail);
router.use('/property/new', property.new);
router.use('/property/review', property.review);
router.use('/property/search/:query',  property.search);
router.use('/property/create', property.create);
router.use('/property/update', property.update);
router.use('/property/updatedata', property.updateData);
router.use('/property/remove', property.remove);
router.use('/property/adjust_summary', property.adjust_summary);
router.use('/property/estimated_sale', property.estimated_sale);
router.post('/property/cron/estimate', property.cron_estimate);

// Add Tenancy
router.get('/property/tenancies', property.tenancies);
router.use('/property/unit/all', property.all_units);
router.use('/property/unit/new', property.new_unit);
router.use('/property/unit/edit/name', property.rename_unit);
router.use('/property/unit/update', property.update_unit);
router.use('/property/tenancies/new', property.new_tenancy);
router.use('/property/unit/delete', property.delete_unit);
router.use('/property/unit/clear', property.clear_unit);

router.use('/property/contact/new', property.new_contact);
router.use('/property/contact/delete', property.delete_contact);
router.use('/property/tenant/delete', property.delete_tenant);
// router.get('/property/contact/all', property.all_contacts);
router.post('/property/tenant/all', property.all_tenants);

// documents
router.get('/property/documents', property.documents);
router.post('/property/documents/upload', upload.single( 'file' ), property.documents_upload);
router.post('/property/documents/delete', property.documents_delete);
router.post('/property/documents/upload_all', property.upload_doc_to_property);
router.post('/property/documents/keyDocs', property.keyDocs);

// loan
router.post('/property/loan/all', property.get_equity_debt);
router.post('/property/loan/new', property.new_loan);

// transactions
router.get('/transaction/all', transaction.all);
router.get('/transaction/all/get/:id/:cnt', transaction.all_get);
router.post('/transaction/create', transaction.create);
router.post('/transaction/edit', transaction.edit);
router.post('/transaction/delete', transaction.delete);
router.post('/transaction/mark/paid', transaction.mark);

// services
router.get('/services', service.all);
router.get('/services/instantValuations', service.instant_valuations);

// contacts
router.get('/contacts', property.contacts);
router.get('/contacts/select', property.select_tenant);

module.exports = router;
