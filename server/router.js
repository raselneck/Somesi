const ExpressRouter = require('express').Router;
const controllers = require('./controllers');
const mid = require('./middleware.js');

const account = controllers.account;
const dashboard = controllers.dashboard;
const splash = controllers.splash;
const router = ExpressRouter();

// TODO - Middleware

router.all('/', mid.requiresNoAccount, splash.renderSplashPage);

router.all('/logout', mid.requiresAccount, account.logOut);
router.get('/signup', mid.requiresNoAccount, account.renderSignUpPage);
router.get('/login', mid.requiresNoAccount, account.renderLogInPage);
router.get('/get-csrf-token', account.getToken);

router.use('/profile', account.renderProfilePage);

router.get('/dashboard', mid.requiresAccount, dashboard.renderDashboard);

router.post('/login', account.logIn);
router.post('/signup', account.signUp);
router.post('/post', mid.requiresAccountPost, account.post);
router.post('/follow', mid.requiresAccountPost, account.follow);
router.post('/unfollow', mid.requiresAccountPost, account.unfollow);
router.post('/get-posts', mid.requiresAccountPost, dashboard.getPosts);

module.exports = router;
