const models = require('../models');
const shared = require('./shared.js');

const Account = models.Account;
const Post = models.Post;

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
    const profile = {};

    if (err) {
      profile.exists = false;
    } else {
      profile.exists = true;
      profile.hasPosts = posts.length > 0;
      profile.username = username;
    }

    shared.renderPage(req, res, 'profile', { profile });
  });
};

// Gets the posts for a profile
const getPosts = (req, res) => {
  const username = `${req.query.user}`;
  const offset = parseInt(req.body.offset, 10) || 0;
  const count = parseInt(req.body.count, 10) || 10;

  console.log('getting', count, 'posts for', username, 'offset by', offset);

  // Get the posts
  return Post.getByUserName(username, offset, count, (err, posts) => {
    // Check if there was an error first
    if (err) {
      const message = `An error occurred retrieving ${username}'s posts.`;
      return res.status(500).json({ error: message });
    }

    return res.json({ posts });
  });
};

module.exports = {
  renderProfilePage,
  getPosts,
};
