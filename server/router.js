const ExpressRouter = require('express').Router;
const controllers = require('./controllers');

const account = controllers.account;
const splash = controllers.splash;
const router = ExpressRouter();

// TODO - Middleware

router.all('/', splash.renderSplashPage);

router.get('/create-account', account.renderCreateAccountPage);
router.get('/get-csrf-token', account.getToken);

router.post('/sign-in', account.signIn);
router.post('/sign-up', account.signUp);

module.exports = router;
