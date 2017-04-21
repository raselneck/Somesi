// Checks to see if an account exists on the given request
const hasAccount = req => req.session.account !== undefined;

// Specifies that an account is required
const requiresAccount = (req, res, next) => {
  if (hasAccount(req)) {
    return next();
  } else {
    return res.redirect('/');
  }
};

// Specifies that no sign in is required
const requiresNoAccount = (req, res, next) => {
  if (hasAccount(req)) {
    return res.redirect('/dashboard');
  } else {
    return next();
  }
};

module.exports = {
  requiresAccount,
  requiresNoAccount,
};
