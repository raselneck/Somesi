const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const favicon = require('serve-favicon');
const path = require('path');
const mongoose = require('mongoose');
const redis = require('./redis.js');
const router = require('./router.js');
const csrf = require('csurf');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost/DomoMaker';
const app = express();

// Attempt to connect to the database
mongoose.connect(dbUrl, (err) => {
  if (err) {
    console.log('Failed to connect to database');
    throw new Error(err);
  }
});

// Configure our Express app
const hostedDir = path.resolve(__dirname, '..', 'hosted');
const viewsDir = path.resolve(__dirname, 'views');
app.use(express.static(hostedDir));
app.use(favicon(path.join(hostedDir, 'favicon.png')));
app.set('x-powered-by', 'Duct Tap and Glue(t'); // heh
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  key: 'sessionid',
  store: redis.createStore(session),
  secret: 'Yet Another Dang Social Media Site',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', viewsDir);
app.use(cookieParser());

// csrf comes AFTER cookie parser but BEFORE the router
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  console.log('Missing CSRF token from request!');
  return false;
});

// Link our router to our Express app
router(app);

// Start the Express app
app.listen(port, (err) => {
  if (err) {
    throw new Error(err);
  }

  console.log(`Somesi is now running at http://localhost:${port}/`);
});
