const ExpressRouter = require('express').Router;
const controllers = require('./controllers');

const account = controllers.account;
const dashboard = controllers.dashboard;
const splash = controllers.splash;
const router = ExpressRouter();

// TODO - Middleware

router.all('/', splash.renderSplashPage);

router.get('/signup', account.renderSignUpPage);
router.get('/login', account.renderLogInPage);
router.get('/get-csrf-token', account.getToken);

router.get('/dashboard', dashboard.renderDashboard);

router.post('/login', account.logIn);
router.post('/signup', account.signUp);

module.exports = router;
