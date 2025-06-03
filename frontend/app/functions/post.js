async function handleLike(postId, setPosts) {
  try {
    const response = await fetch("http://localhost:8404/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ post_id: postId}),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error(data);
    }
    if (response.ok) {
      const updatedPost = await response.json();

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                total_likes: updatedPost.total_likes,
                is_liked: updatedPost.is_liked,
              }
            : post
        )
      );

      //   console.log(updatedPost);
    }
  } catch (error) {
    console.error(error);
  }
}

export { handleLike };
