// Renders the list of posts
const renderPostList = function() {
  // Define the post list
  const postList = this.state.posts.map((post) => {
    console.log(post);
    return (
      <div className="post">
        <p>That sure is a post!</p>
      </div>
    );
  });

  // Return the rendered post list
  return (<div className="postList">{postList}</div>);
};

// Renders the posts
const renderPosts = function() {
  console.log('post list state:', this.state);

  // If there are no posts, then the dashboard is empty!
  if (this.state.posts.length === 0) {
    return renderEmptyPosts();
  }

  return renderPostList();
};
