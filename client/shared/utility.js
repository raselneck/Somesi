// Dismisses the current error message
const dismissError = () => {
  const container = $('#error-container');
  if (container) {
    container.css({
      display: 'none',
      visibility: 'hidden',
    });
  }
};

// Handles an error message
const displayError = (msg) => {
  const message = msg || 'Oops! An error occurred.';
  console.log(message);

  // Show the container
  const container = $('#error-container');
  if (container) {
    container.css({
      display: 'block',
      visibility: 'visible',
    });
  }

  // Set the error message
  const err = $('#error-message');
  if (err) {
    err.text(message);
  }
};

// Defines a response
class Response {
  constructor(xhr, userdata) {
    try {
      this.data = JSON.parse(xhr.responseText);
    } catch (ex) {
      if (xhr.responseText) {
        displayError(xhr.responseText);
      }
      this.data = null;
    }

    this.status = xhr.status;
    this.userdata = userdata;
  }
}

// Sends a request
const sendRequest = (method, url, data, callback, userdata) => {
  $.ajax({
    cache: false,
    type: method.toUpperCase(),
    url,
    data,
    dataType: 'json',
    success: (responseData, status, xhr) => {
      const response = new Response(xhr);

      if (response.data.redirect) {
        window.location = response.data.redirect;
      } else {
        callback(response);
      }
    },
    error: (xhr, status, error) => {
      try {
        const message = JSON.parse(xhr.responseText);
        displayError(message.error);
      } catch (ex) {
        displayError(xhr.responseText);
      }
    },
  });
};

// Gets a CSRF token
const getCsrfToken = (callback) => {
  sendRequest('GET', '/get-csrf-token', null, (response) => {
    const token = response.data.token;
    callback(token);
  });
};

// Checks to see if a username is valid
const isValidUsername = (name) => {
  const regex = /^[a-zA-Z0-9_\-]+$/;
  return regex.test(name) && name.length >= 4 && name.length <= 16;
};

// Checks to see if an email is valid
const isValidEmail = (email) => {
  // Regex from http://stackoverflow.com/a/46181
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

// Handles signing in
const handleSignIn = (e) => {
  e.preventDefault();

  const usernameElem = $('#sign-in-name');
  const passwordElem = $('#sign-in-pass');

  const username = usernameElem.val();
  const password = passwordElem.val();

  // Ensure the username and password have been entered
  if (!username || !password) {
    displayError('Oops! To sign in you need a username AND a password!');
    return false;
  }

  // Attempt to sign in
  const form = $('#sign-in-form');
  sendRequest('POST', form.attr('action'), form.serialize(), (response) => {
    // If we're here, then we got a response that wasn't a redirect
    displayError('Uh-oh... This shouldn\'t have happened...');
    console.log(response);
  });
};

// Renders the sign in form for the navbar
const renderNavbarSignInForm = function() {
  return (
    <form className="navbar-form"
          name="sign-in-form"
          id="sign-in-form"
          onSubmit={this.handleSubmit}
          method="POST"
          action="/login">
      <input type="hidden" name="_csrf" value={this.props.csrf}/>
      <input type="text" id="sign-in-name" name="user" placeholder="Username" className="form-control"/>
      <input type="password" id="sign-in-pass" name="pass" placeholder="Password" className="form-control"/>
      <button type="submit" className="btn btn-success form-control">Log In</button>
    </form>
  );
};

// Renders the navbar account info
const renderNavbarAccountInfo = function() {
  return (
    <ul className="nav navbar-nav">
      <li className="dropdown">
        <a  href="#"
            className="dropdown-toggle"
            data-toggle="dropdown"
            role="button"
            aria-haspopup="true"
            aria-expanded="false">Hello, {this.state.username} <span className="caret"></span>
        </a>
        <ul className="dropdown-menu">
          <li><a href="/logout">Log Out</a></li>
        </ul>
      </li>
    </ul>
  );
};

// Sets up the navbar sign-in form
const initNavbar = (token) => {
  const target = document.querySelector('#navbar-data');
  const csrf = token;

  // Initializes the navbar sign-in form
  const initNavbarSignIn = () => {
    // Create the sign in form
    const NavbarSignIn = React.createClass({
      handleSubmit: handleSignIn,
      render: renderNavbarSignInForm
    });

    // Render the sign in form
    ReactDOM.render(<NavbarSignIn csrf={csrf}/>, target);
  };

  // Initializes the navbar account menu
  const initNavbarAccount = (username, id) => {
    const NavbarAccount = React.createClass({
      render: renderNavbarAccountInfo,

      // Gets the initial state
      getInitialState: function() {
        return { username, id };
      },
    });

    // Render the user account info
    ReactDOM.render(<NavbarAccount/>, target);
  };

  /////////////////////////////////////////////////////////////////////////////

  const accountInfo = $('#account-info');
  const username = accountInfo.attr('data-username');
  const id = accountInfo.attr('data-id');

  if (username && id) {
    initNavbarAccount(username, id);
  } else {
    initNavbarSignIn();
  }
};

// Shared functionality for when the page loads
$(document).ready(() => {
  // See if there's an initial error message
  const initialError = $('#initial-error').attr('data-message');
  if (initialError) {
    displayError(initialError);
  }

  // Handle the error alert button being clicked
  $('button.error-close').click(() => {
    dismissError();
  });

  getCsrfToken(initNavbar);
});
