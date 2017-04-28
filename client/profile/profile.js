let user;
let userExists;
let userHasPosts;

// Renders the empty post list
const renderEmptyPosts = function() {
  return (
    <div className="empty-posts">
      <h1>Uh-oh!</h1>
      <p>Looks like there aren't any posts!</p>
      <p>Go tell {user} to say something!</p>
    </div>
  );
};

// Renders the page for a non-existent user
const renderNonexistentUser = function() {
  return (
    <div className="empty-posts">
      <h1>Uh-oh!</h1>
      <p>Looks like this user doesn't exist!</p>
    </div>
  );
};

// Handles when the document is ready
$(document).ready(() => {
  const profileInfo = $('#profile-info');
  user = profileInfo.attr('data-user');
  userExists = (profileInfo.attr('data-exists').toLowerCase() === 'true');
  userHasPosts = (profileInfo.attr('data-has-posts').toLowerCase() === 'true');

  // Create the post list class
  const PostListClass = createPostListClass({
    getPostsUrl: `/get-posts?user=${user}`,
    getState: () => ({ user }),
    hasPosts: userExists && userHasPosts,
    render: userExists ? undefined : renderNonexistentUser,
  });

  // Get the list target and create the renderer
  const postListTarget = document.querySelector('#posts');
  const listRenderer = ReactDOM.render(<PostListClass />, postListTarget);

  listRenderer.getPosts();
});
