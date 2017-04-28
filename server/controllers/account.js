const models = require('../models');
const shared = require('./shared.js');

const Account = models.Account;
const Post = models.Post;

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
      console.log('error saving account:', err);

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
  const text = `${req.body.text}`;

  // Ensure the text is valid
  if (!text || text.length === 0) {
    return res.status(400).json({ error: 'Invalid post text.' });
  }

  // Create the post data
  const postData = {
    owner: req.session.account._id,
    ownerName: req.session.account.username,
    text,
  };

  // Now save the post
  return new Post(postData)
    .save()
    .then(() => res.status(201).json({ info: 'Nice! Refresh the page to see your new post.' }))
    .catch((err) => {
      // Uh-oh! An error occurred while saving the post
      console.log('error saving post:', err);
      return res.status(500).json({ error: 'An error occurred while saving your post.' });
    });
};

// Provides functionality for following or unfollowing a user
const followOrUnfollow = (req, res, follow) => {
  const follower = req.session.account.username;
  const followee = `${req.body.username}`;

  return Account.followOrUnfollow(follower, followee, follow, (err) => {
    if (err) {
      const action = follow ? 'follow' : 'unfollow';
      const message = `An error occurred trying to ${action} ${followee}`;
      return res.status(500).json({ error: message });
    }

    let info;
    if (follow) {
      info = `Nice! You're now following ${followee}.`;
    } else {
      info = `Aww.. You're not longer following ${followee}...`;
    }

    return res.status(200).json({ info });
  });
};

// Attempts to follow a user
const follow = (req, res) => followOrUnfollow(req, res, true);

// Attempts to un-follow a user
const unfollow = (req, res) => followOrUnfollow(req, res, false);

// Checks to see if a given user follows another
const follows = (req, res) => {
  // Checks if "follower" follows "followee"
  const follower = `${req.body.follower}`;
  const followee = `${req.body.followee}`;

  return Account.getFollowing(follower, (err, following) => {
    if (err || !following) {
      return res.status(500).json({ error: 'Failed to get your following list.' });
    }

    return res.json({ follows: following.indexOf(followee) >= 0 });
  });
};

// Gets a CSRF token
const getToken = (req, res) => {
  const token = req.csrfToken();
  res.json({ token });
};

module.exports = {
  renderLogInPage,
  renderSignUpPage,
  renderSettingsPage,
  logIn,
  logOut,
  signUp,
  post,
  follow,
  follows,
  unfollow,
  getToken,
};
