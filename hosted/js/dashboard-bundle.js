'use strict';

var PostFormClass = void 0;
var PostListClass = void 0;
var formRenderer = void 0;
var listRenderer = void 0;

// Renders the empty dashboard post list
var renderEmptyPosts = function renderEmptyPosts() {
  return React.createElement(
    'div',
    { className: 'empty-posts' },
    React.createElement(
      'h1',
      null,
      'Uh oh!'
    ),
    React.createElement(
      'p',
      null,
      'Looks like there aren\'t any posts!'
    ),
    React.createElement(
      'p',
      null,
      'Maybe you should try following some people to spice things up.'
    )
  );
};

// Retrieves a user's dashboard posts
var retrievePosts = function retrievePosts(self, callback) {
  getCsrfToken(function (token) {
    console.log('retrieving posts');

    // Create the data for the request
    var data = {
      _csrf: token,
      offset: self.state.offset,
      count: self.state.count || 10
    };

    // Send the request
    sendRequest('POST', '/get-posts', data, function (response) {
      var posts = response.data.posts;
      callback(posts);
    });
  });
};

// Handles when the page has loaded
$(document).ready(function () {
  // TODO - PostFormClass

  // Defines the post list class
  PostListClass = React.createClass({
    displayName: 'PostListClass',

    // Renders this class
    render: renderPosts,

    // Gets more posts
    getPosts: function getPosts() {
      var _this = this;

      retrievePosts(this, function (posts) {
        var currentPosts = _this.state.posts;
        var currentOffs = _this.state.offset;

        console.log('retrieved posts:', posts);
      });
    },

    // Gets the initial state for this class
    getInitialState: function getInitialState() {
      return {
        posts: [],
        offset: 0
      };
    }
  });

  // Get the containers
  var postFormTarget = document.querySelector('#post-form-container');
  var postListTarget = document.querySelector('#post-list-container');

  // Render the two classes
  listRenderer = ReactDOM.render(React.createElement(PostListClass, null), postListTarget);

  // Get the posts
  listRenderer.getPosts();
});
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
    displayError('Oops! To sign in you need a username AND a password!');
    return false;
  }

  // Attempt to sign in
  var form = $('#sign-in-form');
  sendRequest('POST', form.attr('action'), form.serialize(), function (response) {
    // If we're here, then we got a response that wasn't a redirect
    displayError('Uh-oh... This shouldn\'t have happened...');
    console.log(response);
  });
};

// Renders the sign in form for the navbar
var renderNavbarSignInForm = function renderNavbarSignInForm() {
  return React.createElement(
    'form',
    { className: 'navbar-form',
      name: 'sign-in-form',
      id: 'sign-in-form',
      onSubmit: this.handleSubmit,
      method: 'POST',
      action: '/login' },
    React.createElement('input', { type: 'hidden', name: '_csrf', value: this.props.csrf }),
    React.createElement('input', { type: 'text', id: 'sign-in-name', name: 'user', placeholder: 'Username', className: 'form-control' }),
    React.createElement('input', { type: 'password', id: 'sign-in-pass', name: 'pass', placeholder: 'Password', className: 'form-control' }),
    React.createElement(
      'button',
      { type: 'submit', className: 'btn btn-success form-control' },
      'Log In'
    )
  );
};

// Renders the navbar account info
var renderNavbarAccountInfo = function renderNavbarAccountInfo() {
  return React.createElement(
    'ul',
    { className: 'nav navbar-nav' },
    React.createElement(
      'li',
      { className: 'dropdown' },
      React.createElement(
        'a',
        { href: '#',
          className: 'dropdown-toggle',
          'data-toggle': 'dropdown',
          role: 'button',
          'aria-haspopup': 'true',
          'aria-expanded': 'false' },
        'Hello, ',
        this.state.username,
        ' ',
        React.createElement('span', { className: 'caret' })
      ),
      React.createElement(
        'ul',
        { className: 'dropdown-menu' },
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: this.getProfileHref() },
            'Profile'
          )
        ),
        React.createElement('li', { role: 'separator', className: 'divider' }),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: '/logout' },
            'Log Out'
          )
        )
      )
    )
  );
};

// Sets up the navbar sign-in form
var initNavbar = function initNavbar(token) {
  var target = document.querySelector('#navbar-data');
  var csrf = token;

  // If the target doesn't exist, then just stop what we're doing
  if (!target) {
    return;
  }

  // Initializes the navbar sign-in form
  var initNavbarSignIn = function initNavbarSignIn() {
    // Create the sign in form
    var NavbarSignIn = React.createClass({
      displayName: 'NavbarSignIn',

      handleSubmit: handleSignIn,
      render: renderNavbarSignInForm
    });

    // Render the sign in form
    ReactDOM.render(React.createElement(NavbarSignIn, { csrf: csrf }), target);
  };

  // Initializes the navbar account menu
  var initNavbarAccount = function initNavbarAccount(username, id) {
    var NavbarAccount = React.createClass({
      displayName: 'NavbarAccount',

      render: renderNavbarAccountInfo,

      // Gets the initial state
      getInitialState: function getInitialState() {
        return { username: username, id: id };
      },

      // Gets this user's profile link
      getProfileHref: function getProfileHref() {
        return '/profile/' + this.state.username;
      }
    });

    // Render the user account info
    ReactDOM.render(React.createElement(NavbarAccount, null), target);
  };

  /////////////////////////////////////////////////////////////////////////////

  var accountInfo = $('#account-info');
  var username = accountInfo.attr('data-username');
  var id = accountInfo.attr('data-id');

  if (username && id) {
    initNavbarAccount(username, id);
  } else {
    initNavbarSignIn();
  }
};
"use strict";

// Renders the list of posts
var renderPostList = function renderPostList() {
  // Define the post list
  var postList = this.state.posts.map(function (post) {
    console.log(post);
    return React.createElement(
      "div",
      { className: "post" },
      React.createElement(
        "p",
        null,
        "That sure is a post!"
      )
    );
  });

  // Return the rendered post list
  return React.createElement(
    "div",
    { className: "postList" },
    postList
  );
};

// Renders the posts
var renderPosts = function renderPosts() {
  console.log('post list state:', this.state);

  // If there are no posts, then the dashboard is empty!
  if (this.state.posts.length === 0) {
    return renderEmptyPosts();
  }

  return renderPostList();
};
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Dismisses the current error message
var dismissError = function dismissError() {
  var container = $('#error-container');
  if (container) {
    container.css({
      display: 'none',
      visibility: 'hidden'
    });
  }
};

// Handles an error message
var displayError = function displayError(msg) {
  var message = msg || 'Oops! An error occurred.';
  console.log(message);

  // Show the container
  var container = $('#error-container');
  if (container) {
    container.css({
      display: 'block',
      visibility: 'visible'
    });
  }

  // Set the error message
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
      displayError(xhr.responseText);
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

      if (response.data.redirect) {
        window.location = response.data.redirect;
      } else {
        callback(response);
      }
    },
    error: function error(xhr, status, _error) {
      try {
        var message = JSON.parse(xhr.responseText);
        displayError(message.error);
      } catch (ex) {
        displayError(xhr.responseText);
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

// Checks to see if a username is valid
var isValidUsername = function isValidUsername(name) {
  var regex = /^[a-zA-Z0-9_\-]+$/;
  return regex.test(name) && name.length >= 4 && name.length <= 16;
};

// Checks to see if an email is valid
var isValidEmail = function isValidEmail(email) {
  // Regex from http://stackoverflow.com/a/46181
  var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

// Shared functionality for when the page loads
$(document).ready(function () {
  // See if there's an initial error message
  var initialError = $('#initial-error').attr('data-message');
  if (initialError) {
    displayError(initialError);
  }

  // Handle the error alert button being clicked
  $('button.error-close').click(function () {
    dismissError();
  });

  getCsrfToken(initNavbar);
});
