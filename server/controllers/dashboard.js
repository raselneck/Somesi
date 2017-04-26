// Attempts to get the posts for a user's dashboard
const getPosts = (account, offset, count, callback) => {
  callback(undefined, undefined);
};

// Renders a user's dashboard
const renderDashboard = (req, res) => {
  const account = req.session.account;
  const offset = 0;
  const count = 10;

  return getPosts(account, offset, count, (err, posts) => {
    const username = account.username;
    res.render('dashboard', { username, posts });
  });
};

module.exports = {
  getPosts,
  renderDashboard,
};
