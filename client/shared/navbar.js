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
          <li><a href={this.getProfileHref()}>Profile</a></li>
          <li><a href="/change-password">Change Password</a></li>
          <li role="separator" className="divider"></li>
          <li><a href="/logout">Log Out</a></li>
        </ul>
      </li>
    </ul>
  );
};

// Renders the navbar follow form
const renderNavbarFollowForm = function() {
  const baseText = this.state.follows ? "Unfollow" : "Follow";
  const text = `${baseText} ${user}`;
  return (
    <form className="navbar-form"
          name="follow-form"
          id="follow-form"
          onSubmit={this.handleSubmit}
          method="POST"
          action="/follow">
      <button type="submit" className="btn btn-primary form-control">{text}</button>
    </form>
  );
};

// Sets up the navbar sign-in form
const initNavbar = (token) => {
  const csrf = token;
  const target = document.querySelector('#navbar-data');

  // If the target doesn't exist, then just stop what we're doing
  if (!target) {
    return;
  }

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

      // Gets this user's profile link
      getProfileHref: function() {
        return `/profile/${this.state.username}`;
      },
    });

    // Render the user account info
    ReactDOM.render(<NavbarAccount/>, target);
  };

  // Initializes the navbar follow form
  const initNavbarFollowForm = (username) => {
    // If we're not on a profile page, then we don't need to do anything
    if (typeof user === 'undefined' && typeof userExists === 'undefined') {
      return;
    }

    // If the user is viewing their own profile, then we don't need to do anything
    if (user === username) {
      return;
    }

    // And now we enter callback hell...

    getCsrfToken((token) => {
      const data = {
        follower: username,
        followee: user,
        _csrf: token,
      };

      // Check to see if the signed in user follows the viewing user
      sendRequest('POST', '/follows', data, (response) => {
        let follows = response.data.follows;

        // Define the follow form
        const NavbarFollowForm = React.createClass({
          // Renders the follow form
          render: renderNavbarFollowForm,

          // Gets the follow form's initial state
          getInitialState: () => ({ follows }),

          // Handles the follow form being submitted
          handleSubmit: function(e) {
            e.preventDefault();

            const action = this.state.follows ? '/unfollow' : '/follow';

            // Send the follow or unfollow request
            getCsrfToken((token2) => {
              const data2 = {
                username: user,
                _csrf: token2,
              };

              sendRequest('POST', action, data2, (response) => {
                follows = !follows;
                this.setState({ follows });
              });
            });
          },
        });

        // Render the follow form
        ReactDOM.render(<NavbarFollowForm />, document.querySelector('#navbar-follow'));
      });
    });
  };

  /////////////////////////////////////////////////////////////////////////////

  const accountInfo = $('#account-info');
  const username = accountInfo.attr('data-username');
  const id = accountInfo.attr('data-id');

  if (username && id) {
    initNavbarAccount(username, id);
    initNavbarFollowForm(username);
  } else {
    initNavbarSignIn();
  }
};
