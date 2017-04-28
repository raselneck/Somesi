"use strict";

var user = void 0;
var userExists = void 0;
var userHasPosts = void 0;

// Renders the empty post list
var renderEmptyPosts = function renderEmptyPosts() {
  return React.createElement(
    "div",
    { className: "empty-posts" },
    React.createElement(
      "h1",
      null,
      "Uh-oh!"
    ),
    React.createElement(
      "p",
      null,
      "Looks like there aren't any posts!"
    ),
    React.createElement(
      "p",
      null,
      "Go tell ",
      user,
      " to say something!"
    )
  );
};

// Renders the page for a non-existent user
var renderNonexistentUser = function renderNonexistentUser() {
  return React.createElement(
    "div",
    { className: "empty-posts" },
    React.createElement(
      "h1",
      null,
      "Uh-oh!"
    ),
    React.createElement(
      "p",
      null,
      "Looks like this user doesn't exist!"
    )
  );
};

// Handles when the document is ready
$(document).ready(function () {
  var profileInfo = $('#profile-info');
  user = profileInfo.attr('data-user');
  userExists = profileInfo.attr('data-exists').toLowerCase() === 'true';
  userHasPosts = profileInfo.attr('data-has-posts').toLowerCase() === 'true';

  // Create the post list class
  var PostListClass = createPostListClass({
    getPostsUrl: "/get-posts?user=" + user,
    getState: function getState() {
      return { user: user };
    },
    hasPosts: userExists && userHasPosts,
    render: userExists ? undefined : renderNonexistentUser
  });

  // Get the list target and create the renderer
  var postListTarget = document.querySelector('#posts');
  var listRenderer = ReactDOM.render(React.createElement(PostListClass, null), postListTarget);

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

// Renders the navbar follow form
var renderNavbarFollowForm = function renderNavbarFollowForm() {
  var baseText = this.state.follows ? "Unfollow" : "Follow";
  var text = baseText + ' ' + user;
  return React.createElement(
    'form',
    { className: 'navbar-form',
      name: 'follow-form',
      id: 'follow-form',
      onSubmit: this.handleSubmit,
      method: 'POST',
      action: '/follow' },
    React.createElement(
      'button',
      { type: 'submit', className: 'btn btn-primary form-control' },
      text
    )
  );
};

// Sets up the navbar sign-in form
var initNavbar = function initNavbar(token) {
  var csrf = token;
  var target = document.querySelector('#navbar-data');

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

  // Initializes the navbar follow form
  var initNavbarFollowForm = function initNavbarFollowForm(username) {
    // If we're not on a profile page, then we don't need to do anything
    if (typeof user === 'undefined' && typeof userExists === 'undefined') {
      return;
    }

    // If the user is viewing their own profile, then we don't need to do anything
    if (user === username) {
      return;
    }

    // And now we enter callback hell...

    getCsrfToken(function (token) {
      var data = {
        follower: username,
        followee: user,
        _csrf: token
      };

      // Check to see if the signed in user follows the viewing user
      sendRequest('POST', '/follows', data, function (response) {
        var follows = response.data.follows;

        // Define the follow form
        var NavbarFollowForm = React.createClass({
          displayName: 'NavbarFollowForm',

          // Renders the follow form
          render: renderNavbarFollowForm,

          // Gets the follow form's initial state
          getInitialState: function getInitialState() {
            return { follows: follows };
          },

          // Handles the follow form being submitted
          handleSubmit: function handleSubmit(e) {
            var _this = this;

            e.preventDefault();

            var action = this.state.follows ? '/unfollow' : '/follow';

            // Send the follow or unfollow request
            getCsrfToken(function (token2) {
              var data2 = {
                username: user,
                _csrf: token2
              };

              sendRequest('POST', action, data2, function (response) {
                follows = !follows;
                _this.setState({ follows: follows });
              });
            });
          }
        });

        // Render the follow form
        ReactDOM.render(React.createElement(NavbarFollowForm, null), document.querySelector('#navbar-follow'));
      });
    });
  };

  /////////////////////////////////////////////////////////////////////////////

  var accountInfo = $('#account-info');
  var username = accountInfo.attr('data-username');
  var id = accountInfo.attr('data-id');

  if (username && id) {
    initNavbarAccount(username, id);
    initNavbarFollowForm(username);
  } else {
    initNavbarSignIn();
  }
};
"use strict";

// Renders the list of posts
var renderPostList = function renderPostList() {
  // Define the post list
  var postList = this.state.posts.map(function (post) {
    // Gets the current post's date string
    var getDateString = function getDateString() {
      var date = new Date(post.date);
      var ds = date.toLocaleDateString();
      var ts = date.toLocaleTimeString();
      return "on " + ds + " at " + ts;
    };

    // Gets the link to the author's profile
    var getAuthorHref = function getAuthorHref() {
      return "/profile/" + post.ownerName;
    };

    return React.createElement(
      "div",
      { className: "post" },
      React.createElement(
        "h4",
        null,
        post.text
      ),
      React.createElement(
        "p",
        { className: "info" },
        "by ",
        React.createElement(
          "a",
          { href: getAuthorHref() },
          post.ownerName
        ),
        " ",
        getDateString(),
        "."
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
  // If there are no posts, then the dashboard is empty!
  if (this.state.posts.length === 0) {
    return renderEmptyPosts();
  }

  // Fuck JavaScript's notion of "this"
  return renderPostList.bind(this)();
};

// Retrieves posts
var retrievePosts = function retrievePosts(self, url, callback) {
  getCsrfToken(function (token) {
    // Create the post data
    var data = {
      _csrf: token,
      offset: self.state.offset || 0,
      count: self.state.count || 10
    };

    // Send the request
    sendRequest('POST', url, data, function (response) {
      var posts = response.data.posts;
      callback(posts);
    });
  });
};

// Creates a post list class
var createPostListClass = function createPostListClass(conf) {
  var defaultGetState = function defaultGetState() {
    return { posts: [], offset: 0 };
  };
  var defaultGetPosts = function defaultGetPosts(self) {
    return { posts: [] };
  };
  var config = conf;

  if (typeof config.getPostsUrl !== 'string') {
    throw new Error('Need a URL to retrieve posts from!');
  }

  // Edit the config
  config.render = config.render || renderPosts;
  config.getPosts = function (self, callback) {
    var cb = callback.bind(self);
    retrievePosts(self, config.getPostsUrl, cb);
  };
  config.getInitialState = function () {
    var state = (config.getState || defaultGetState)();
    state.posts = [];
    state.offset = 0;
    return state;
  };

  if (typeof config.hasPosts === 'undefined') {
    config.hasPosts = true;
  }

  // Create the React class
  return React.createClass({
    // Renders this class
    render: config.render,

    // Gets more posts for this class to render
    getPosts: function getPosts() {
      var _this = this;

      if (!config.hasPosts) {
        return;
      }

      config.getPosts(this, function (newPosts) {
        // Only do anything if there are new posts
        if (newPosts.length > 0) {
          var posts = _this.state.posts.concat(newPosts);
          var offs = _this.state.offset = posts.length;

          var newState = config.getInitialState();
          newState.posts = posts;
          newState.offset = offs;

          _this.setState(newState);
        }
      });
    },

    // Gets this class's initial state
    getInitialState: function getInitialState() {
      return config.getInitialState();
    }
  });
};
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Dismisses the info message
var dismissInfo = function dismissInfo() {
  $('#info-container').css({
    display: 'none',
    visibility: 'hidden'
  });
};

// Handles an info message
var displayInfo = function displayInfo(msg) {
  if (msg) {
    // Show the container
    $('#info-container').css({
      display: 'block',
      visibility: 'visible'
    });

    // Set the info message
    $('#info-message').text(msg);
  }
};

// Dismisses the current error message
var dismissError = function dismissError() {
  $('#error-container').css({
    display: 'none',
    visibility: 'hidden'
  });
};

// Handles an error message
var displayError = function displayError(msg) {
  var message = msg || 'Oops! An error occurred.';
  console.log(message);

  // Show the container
  $('#error-container').css({
    display: 'block',
    visibility: 'visible'
  });

  // Set the error message
  $('#error-message').text(message);
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
      } else if (response.data.info) {
        displayInfo(response.data.info);
        callback(response);
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

  // Handle the info alert button being clicked
  $('button.info-close').click(function () {
    dismissInfo();
  });

  // Handle the error alert button being clicked
  $('button.error-close').click(function () {
    dismissError();
  });

  getCsrfToken(initNavbar);
});
