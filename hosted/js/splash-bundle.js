'use strict';

// Handles signing in
var handleSignIn = function handleSignIn(e) {
  e.preventDefault();

  var usernameElem = $('#sign-in-name');
  var passwordElem = $('#sign-in-pass');

  var username = usernameElem.val();
  var password = passwordElem.val();

  // Ensure the username and password have been entered
  if (!username || !password) {
    handleError('Oops! To sign in you need a username AND a password!');
    return false;
  }

  // Attempt to sign in
  var form = $('#sign-in-form');
  sendRequest('POST', form.attr('action'), form.serialize(), function (response) {
    console.log(response);
  });
};

/**
  regex.test(...) && (...).length >= 4 && (...).length <= 16
*/

// Renders the sign in form for the splash page
var renderSplashSignInForm = function renderSplashSignInForm() {
  return React.createElement(
    'form',
    { className: 'navbar-form navbar-right',
      name: 'sign-in-form',
      id: 'sign-in-form',
      onSubmit: this.handleSubmit,
      method: 'POST',
      action: '/sign-in' },
    React.createElement('input', { type: 'text', id: 'sign-in-name', name: 'user', placeholder: 'Username', className: 'form-control' }),
    React.createElement('input', { type: 'password', id: 'sign-in-pass', name: 'pass', placeholder: 'Password', className: 'form-control' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: this.props.csrf }),
    React.createElement(
      'button',
      { type: 'submit', className: 'btn btn-success form-control' },
      'Sign In'
    )
  );
};

// Initializes the splash page
var initialize = function initialize(csrf) {
  // Create the sign in form
  var SignInForm = React.createClass({
    displayName: 'SignInForm',

    handleSubmit: handleSignIn,
    render: renderSplashSignInForm
  });

  // Render the sign in form
  var target = document.querySelector('#navbar');
  ReactDOM.render(React.createElement(SignInForm, { csrf: csrf }), target);
};

// Handle when the page is done loading
$(document).ready(function () {
  getCsrfToken(initialize);
});
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Handles an error message
var handleError = function handleError(message) {
  console.log(message);

  var errContainer = $('#alert-container');
  if (errContainer) {
    errContainer.css('display', 'block');
    errContainer.css('visibility', 'visible');
  }

  var err = $('#error-message');
  if (err) {
    err.text(message);
  }
};

// Defines a response

var Response = function Response(xhr, userdata) {
  _classCallCheck(this, Response);

  try {
    this.data = JSON.parse(xhr.responseText);
  } catch (ex) {
    if (xhr.responseText) {
      handleError(xhr.responseText);
    }
    this.data = null;
  }

  this.status = xhr.status;
  this.userdata = userdata;
};

// Sends a request


var sendRequest = function sendRequest(method, url, data, callback, userdata) {
  $.ajax({
    cache: false,
    type: method.toUpperCase(),
    url: url,
    data: data,
    dataType: 'json',
    success: function success(responseData, status, xhr) {
      var response = new Response(xhr);
      callback(response);
    },
    error: function error(xhr, status, _error) {
      try {
        var message = JSON.parse(xhr.responseText);
        handleError(message.error);
      } catch (ex) {
        handleError(xhr.responseText);
      }
    }
  });
};

// Gets a CSRF token
var getCsrfToken = function getCsrfToken(callback) {
  sendRequest('GET', '/get-csrf-token', null, function (response) {
    var token = response.data.token;
    callback(token);
  });
};

// Checks to see if the given username is valid
var isUsernameValid = function isUsernameValid(name) {
  var regex = /^[a-zA-Z0-9_\-]+$/;
  return regex.matches(name) && name.length >= 4 && name.length <= 16;
};
