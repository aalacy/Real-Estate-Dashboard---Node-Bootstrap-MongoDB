const express = require('express');
const router = express.Router();
const auth = require('./auth');
/**
 * Module dependencies.
 */

const dashboard = require('../app/controllers/dashboard');
const home = require('../app/controllers/home');
const property = require('../app/controllers/property');

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

router.get('/settings', home.settings);

//GET current route (required, only authenticated users have access)
router.use('/current', auth.required, home.current);

/**
 * Dashboard
 */

router.get('/', auth.checkToken, dashboard.index);

/**
 * Property
 */

router.get('/property/my', auth.checkToken, property.my);
router.use('/property/overview/:id', auth.checkToken, property.overview);
router.use('/property/new', auth.checkToken, property.new);
router.use('/property/review', auth.checkToken, property.review);
router.use('/property/create', auth.checkToken, property.create);

module.exports = router;
