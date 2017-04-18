// Renders the sign up page
const renderCreateAccountPage = (req, res) => {
  res.render('create-account', { csrfToken: req.csrfToken() });
};

// Attempts to sign a user in
const signIn = (req, res) => {
  res.status(500).json({});
};

// Attempts to create a user account
const signUp = (req, res) => {
  res.status(500).json({});
};

// Gets a CSRF token
const getToken = (req, res) => {
  const token = req.csrfToken();
  res.json({ token });
};

module.exports = {
  renderCreateAccountPage,
  signIn,
  signUp,
  getToken,
};
