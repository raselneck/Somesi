const models = require('../models');
const shared = require('./shared.js');

const Account = models.Account;

// Renders the log in page
const renderLogInPage = (req, res) => {
  shared.renderPage(req, res, 'account-entry', {
    mode: 'log-in',
    error: req.renderError,
  });
};

// Renders the sign up page
const renderSignUpPage = (req, res) => {
  shared.renderPage(req, res, 'account-entry', {
    mode: 'sign-up',
    error: req.renderError,
  });
};

// Renders a user's profile page
const renderProfilePage = (req, res) => {
  const pathParts = req.path.split('/');
  pathParts.splice(0, 1);

  if (pathParts.length === 0 || pathParts[0] === '') {
    // "/profile" just redirects to "/"
    return res.redirect('/');
  } else if (pathParts.length > 1) {
    // "/profile/{name}/..." redirects to "/profile/{name}"
    return res.redirect(`/profile/${pathParts[0]}`);
  }
    // Okay, now we can try to render the profile page
  const username = pathParts[0];
  return Account.getPosts(username, (err, posts) => {
    const options = {};

    if (err) {
      options.exists = false;
    } else {
      options.exists = true;
      options.hasPosts = posts.length > 0;
      options.posts = posts;
    }

    shared.renderPage(req, res, 'profile', options);
  });
};

// Renders the settings page
const renderSettingsPage = (req, res) => {
  res.status(501).json({ error: 'Sorry, not implemented :/' });
};

// Attempts to log a user in
const logIn = (req_, res) => {
  const req = req_;

  const username = `${req.body.user}`;
  const password = `${req.body.pass}`;

  // Ensure both the username and password were given
  if (!username || !password) {
    return res.status(400).json({ error: 'Oops! Both a username AND a password are required!' });
  }

  // Attempt to log in
  return Account.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Invalid username / password combination.' });
    }

    // Set the account info for the session
    req.session.account = Account.toSession(account);

    const redirect = req.headers.referer || '/dashboard';
    return res.json({ redirect });
  });
};

// Attempts to log the current user out
const logOut = (req_, res) => {
  const req = req_;

  if (req.session.account) {
    delete req.session.account;
  }

  const redirect = req.headers.referer || '/dashboard';
  res.redirect(redirect);
};

// Attempts to create a user account
const signUp = (req_, res) => {
  const req = req_;

  const username = `${req.body.user}`;
  const email = `${req.body.email}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // Ensure all parameters are provided
  if (!username || !email || !pass || !pass2) {
    return res.status(400).json({ error: 'Oops! All fields are required.' });
  }

  // Ensure the passwords match
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Oops! Passwords do not match.' });
  }

  // Generate the password hash
  return Account.generateHash(pass, (salt, hash) => {
    // Create the account data
    const accountData = {
      username,
      email,
      salt,
      password: hash,
    };

    // Now create the account
    const account = new Account(accountData);

    // Save the account
    const promise = account.save();

    promise.then(() => {
      // Save the user account in the session
      req.session.account = Account.toSession(account);
      res.json({ redirect: '/dashboard' });
    }).catch((err) => {
      console.log('Error saving account:', err);

      let errorMessage = 'An error occurred.';
      if (err.code === 11000) {
        const message = err.errmsg;

        if (message.indexOf('username') >= 0) {
          errorMessage = 'Username is already in use.';
        } else if (message.indexOf('email') >= 0) {
          errorMessage = 'Email address is already in use.';
        }
      }

      return res.status(400).json({ error: errorMessage });
    });
  });
};

// Attempts to make a post for a user
const post = (req, res) => {
  res.status(501).json({});
};

// Attempts to follow a user
const follow = (req, res) => {
  res.status(501).json({});
};

// Attempts to un-follow a user
const unfollow = (req, res) => {
  res.status(501).json({});
};

// Gets a CSRF token
const getToken = (req, res) => {
  const token = req.csrfToken();
  res.json({ token });
};

module.exports = {
  renderLogInPage,
  renderSignUpPage,
  renderProfilePage,
  renderSettingsPage,
  logIn,
  logOut,
  signUp,
  post,
  follow,
  unfollow,
  getToken,
};
