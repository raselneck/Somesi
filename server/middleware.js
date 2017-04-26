// Checks to see if an account exists on the given request
const hasAccount = req => req.session.account !== undefined;

// Specifies that an account is required
const requiresAccount = (req, res, next) => {
  if (hasAccount(req)) {
    return next();
  }
  return res.redirect('/');
};

// Specifies that an account is required for a post request
const requiresAccountPost = (req, res, next) => {
  if (hasAccount(req)) {
    return next();
  }
  return res.status(401).json({ error: 'You are not signed in!' });
};

// Specifies that no sign in is required
const requiresNoAccount = (req, res, next) => {
  if (hasAccount(req)) {
    return res.redirect('/dashboard');
  }
  return next();
};

module.exports = {
  requiresAccount,
  requiresAccountPost,
  requiresNoAccount,
};
