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

//POST new user route (optional, everyone has access)
router.post('/signup', auth.optional, home.signup_post);
router.get('/signup', home.signup);

//POST login route (optional, everyone has access)
router.post('/signin', auth.optional, home.signin_post);
router.get('/signin', home.signin);

router.post('/logout', auth.checkToken, home.logout);

//  Password Reset
router.get('/password_reset', home.password_reset);
router.get('/password_recovery/*', home.password_recovery);

router.post('/password_reset_generate', home.password_reset_generate);
router.post('/password_reset_post', home.password_reset_post);

router.get('/settings', auth.checkToken, home.settings);
router.post('/settings/update', home.update_settings);
router.post('/settings/password', home.update_password);

//GET current route (required, only authenticated users have access)
router.use('/current', auth.required, home.current);

/**
 * Dashboard
 */

router.get('/', auth.checkToken, dashboard.index);
router.post('/dashboard/cash_flow', auth.checkToken, dashboard.get_cash_flow);

/**
 * Property
 */

router.get('/property/my', auth.checkToken, property.my);
router.get('/property/all', auth.checkToken, property.all);
router.get('/property/overview/:id/:tabs', auth.checkToken, property.overview);
router.get('/property/overview/:id/:tabs/:unit_id', auth.checkToken, property.overview);
router.get('/property/overview/:id', auth.checkToken, property.overview);
router.get('/property/detail/:id', auth.checkToken, property.detail);
router.use('/property/new', auth.checkToken, property.new);
router.use('/property/review', auth.checkToken, property.review);
router.use('/property/search/:query', auth.checkToken,  property.search);
router.use('/property/create', auth.checkToken, property.create);
router.use('/property/update', auth.checkToken, property.update);
router.use('/property/remove', auth.checkToken, property.remove);

// Add Tenancy
router.get('/property/tenancies', auth.checkToken, property.tenancies);
router.use('/property/unit/all', auth.checkToken, property.all_units);
router.use('/property/unit/new', auth.checkToken, property.new_unit);
router.use('/property/unit/delete', auth.checkToken, property.delete_unit);
router.use('/property/unit/clear', auth.checkToken, property.clear_unit);
router.use('/property/adjust_summary', auth.checkToken, property.adjust_summary);
router.use('/property/estimated_sale', auth.checkToken, property.estimated_sale);

router.use('/property/unit/tenant/new', auth.checkToken, property.new_tenant);
router.use('/property/unit/tenant/delete', auth.checkToken, property.delete_tenant);

// documents
router.get('/property/documents', auth.checkToken, property.documents);
router.post('/property/documents/upload', upload.single( 'file' ), property.documents_upload);
router.post('/property/documents/delete', auth.checkToken, property.documents_delete);
router.post('/property/documents/upload_all', auth.checkToken, property.upload_doc_to_property);

// loan
router.post('/property/loan/all', auth.checkToken, property.get_equity_debt);
router.post('/property/loan/new', auth.checkToken, property.new_loan);

// transactions
router.get('/transaction/all', auth.checkToken, transaction.all);
router.get('/transaction/all/get', auth.checkToken, transaction.all_get);
router.post('/transaction/create', auth.checkToken, transaction.create);
router.post('/transaction/edit', auth.checkToken, transaction.edit);
router.post('/transaction/delete', auth.checkToken, transaction.delete);

module.exports = router;
