// Renders the list of posts
const renderPostList = function() {
  // Define the post list
  const postList = this.state.posts.map((post) => {
    // Gets the current post's date string
    const getDateString = () => {
      const date = new Date(post.date);
      const ds = date.toLocaleDateString();
      const ts = date.toLocaleTimeString();
      return `on ${ds} at ${ts}`;
    };

    // Gets the link to the author's profile
    const getAuthorHref = () => `/profile/${post.ownerName}`;

    return (
      <div className="post">
        <h4>{post.text}</h4>
        <p className="info">
          by <a href={getAuthorHref()}>{post.ownerName}</a> {getDateString()}.
        </p>
      </div>
    );
  });

  // Return the rendered post list
  return (<div className="postList">{postList}</div>);
};

// Renders the posts
const renderPosts = function() {
  // If there are no posts, then the dashboard is empty!
  if (this.state.posts.length === 0) {
    return renderEmptyPosts();
  }

  // Fuck JavaScript's notion of "this"
  return renderPostList.bind(this)();
};

// Retrieves posts
const retrievePosts = (self, url, callback) => {
  getCsrfToken((token) => {
    // Create the post data
    const data = {
      _csrf: token,
      offset: self.state.offset || 0,
      count: self.state.count || 10,
    };

    // Send the request
    sendRequest('POST', url, data, (response) => {
      const posts = response.data.posts;
      callback(posts);
    });
  });
};

// Creates a post list class
const createPostListClass = (conf) => {
  const defaultGetState = () => ({ posts: [], offset: 0 });
  const defaultGetPosts = (self) => ({ posts: [] });
  const config = conf;

  if (typeof config.getPostsUrl !== 'string') {
    throw new Error('Need a URL to retrieve posts from!');
  }

  // Edit the config
  config.render = config.render || renderPosts;
  config.getPosts = (self, callback) => {
    const cb = callback.bind(self);
    retrievePosts(self, config.getPostsUrl, cb);
  };
  config.getInitialState = () => {
    const state = (config.getState || defaultGetState)();
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
    getPosts: function() {
      if (!config.hasPosts) {
        return;
      }

      config.getPosts(this, (newPosts) => {
        // Only do anything if there are new posts
        if (newPosts.length > 0) {
          const posts = this.state.posts.concat(newPosts);
          const offs = this.state.offset = posts.length;

          const newState = config.getInitialState();
          newState.posts = posts;
          newState.offset = offs;

          this.setState(newState);
        }
      });
    },

    // Gets this class's initial state
    getInitialState: function() {
      return config.getInitialState();
    },
  });
};
