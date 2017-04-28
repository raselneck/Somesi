let PostFormClass;
let PostListClass;
let formRenderer;
let listRenderer;

// Renders the empty dashboard post list
const renderEmptyPosts = function() {
  return (
    <div className="empty-posts">
      <h1>Uh oh!</h1>
      <p>Looks like there aren't any posts!</p>
      <p>Maybe you should try following some people to spice things up.</p>
      <p>If you already follow people, maybe think about following some more
      interesting people...</p>
    </div>
  );
};

// Renders the create post form
const renderPostForm = function() {
  return (
    <div>
      <h4>What's on your mind?</h4>
      <form name="post-form"
            id="post-form"
            className="post-form"
            onSubmit={this.handleSubmit}
            method="POST"
            action="/post">
        <textarea name="text"
                  id="post-text"
                  form="post-form"
                  rows="3"
                  maxLength="260">
        </textarea>
        <input type="submit" className="btn btn-primary" value="Post"/>
      </form>
      <div className="clearfix"></div>
    </div>
  );
};

// Handles making a post
const handlePost = (e) => {
  e.preventDefault();

  // Get the text element and the text itself
  const textElem = $('#post-text');
  const text = textElem.val();

  // Ensure the user said something
  if (text.length === 0) {
    return displayError('You need to say something, silly!');
  } else if (text.length > 260) {
    return displayError('Hey... Posts can only be 260 characters max!');
  }

  // We need to get a CSRF token to make the post
  getCsrfToken((_csrf) => {
    // Create the post data
    const data = {
      _csrf,
      text,
    };

    // Send the request
    sendRequest('POST', '/post', data, () => {
      textElem.val('');
    });
  });
};

// Handles when the page has loaded
$(document).ready(() => {
  // Define the post form class
  PostFormClass = React.createClass({
    render: renderPostForm,
    handleSubmit: handlePost,
  });

  // Defines the post list class
  PostListClass = createPostListClass({
    getPostsUrl: '/get-dashboard',
  });

  // Get the containers
  const postFormTarget = document.querySelector('#post-form-container');
  const postListTarget = document.querySelector('#post-list-container');

  // Render the two classes
  formRenderer = ReactDOM.render(<PostFormClass />, postFormTarget);
  listRenderer = ReactDOM.render(<PostListClass />, postListTarget);

  // Get the posts
  listRenderer.getPosts();
});
