// Renders a page with common options
const renderPage = (req, res, page, options) => {
  const opt = options;
  const account = req.session.account;

  if (account) {
    opt.username = account.username;
    opt.userId = account._id;
  }

  res.render(page, opt);
};

module.exports = {
  renderPage,
};
