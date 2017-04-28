const shared = require('./shared.js');
const models = require('../models');

const Account = models.Account;
const Post = models.Post;

// Copies an array
const copyArray = (source) => {
  const dest = [];
  source.forEach((val) => { dest.push(val); });
  return dest;
};

// Converts an array to a string
const arrayToString = (arr) => {
  let str = '[';
  for (let i = 0; i < arr.length; ++i) {
    str += `'${arr[i]}'`;
    if (i < arr.length - 1) {
      str += ',';
    }
  }
  return `${str}]`;
};

// Handles the request for retrieving a user's dashboard posts
const getPosts = (req, res) => {
  const account = req.session.account;
  const offset = parseInt(req.body.offset, 10) || 0;
  const count = parseInt(req.body.count, 10) || 10;

  return Account.getFollowing(account.username, (err, follow) => {
    // Ensure there wasn't an error
    if (err) {
      console.log('error getting following:', err);
      return res.status(400).json({ error: err.errmsg });
    }

    // Ensure we have a list of following people
    if (!follow) {
      return res.status(500).json({ error: 'Failed to retrieving followed users.' });
    }

    // We also need to retrieve the user's posts
    const following = copyArray(follow);
    following.push(account.username);

    // Define our callback
    const callback = (err2, posts) => {
      if (err2) {
        console.log(err2);
        return res.status(500).json({ error: 'An error occurred.' });
      }
      console.log('Found posts:', posts);
      return res.json({ posts });
    };

    // This is super disgusting, but it fixes reference errors
    const whereFunc = `${arrayToString(following)}.indexOf(this.ownerName) >= 0`;

    // Now we need to retrieve the posts
    return Post.find()
      // Filter the posts by the owner
      .$where(whereFunc)
      // Sort the posts from new to old
      .sort({ date: 'desc' })
      // Only get the specified amount
      .skip(offset)
      .limit(count)
      // Execute the query
      .exec(callback);
  });
};

// Renders a user's dashboard
const renderDashboard = (req, res) => {
  shared.renderPage(req, res, 'dashboard');
};

module.exports = {
  getPosts,
  renderDashboard,
};
