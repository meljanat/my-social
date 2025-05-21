// pages/post/[id].js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

// import { useRouter } from "next/router";
import Navbar from "../../../components/NavBar";
import "../../../styles/PostPage.css";

export default function PostPage() {
  //   const router = useRouter();
  let { id, group_id } = useParams();
  const post_id = parseInt(id);
  group_id = parseInt(group_id);
  // const router = useRouter();
  // const { id, group_id } = router.query;
  const router = useRouter();

  const goToHome = () => {
    router.push("/");
  };

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupImage, setGroupImage] = useState(null);
  const [homeData, setHomeData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postSaved, setPostSaved] = useState();

  // const [commentText, setCommentText] = useState("");
  // const [imageFile, setImageFile] = useState(null);

  const params = useParams();
  const postId = params.id;

  async function handleSave(postId) {
    try {
      const response = await fetch(`http://localhost:8404/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: postId, group_id: 0 }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(error);
      } else {
        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  saved: updatedPost.saved,
                  total_saves: updatedPost.total_saves,
                }
              : post
          )
        );
        console.log(updatedPost);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8404/post?post_id=${id}&group_id=${group_id}&offset=0`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }

        const data = await response.json();
        setPost(data);
        console.log(data);
        if (post) {
          console.log(data);
        }

        setComments(data.comments || []);
      } catch (err) {
        console.log("Error fetching post:", err);
        setError("Failed to load post. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const formData = new FormData();
    formData.append("post_id", postId);
    formData.append("group_id", group_id);

    formData.append("content", newComment);
    if (groupImage) {
      formData.append("commentImage", groupImage);
    }
    try {
      const response = await fetch("http://localhost:8404/comment", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data = await response.json();

      // setComments([...comments, data]);
      setComments([data, ...comments]);

      setPost({
        ...post,
        TotalComments: post.TotalComments + 1,
      });

      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment. Please try again.");
    }
  };

  const handleLike = async () => {
    console.log("Post id: ", post_id);

    try {
      const response = await fetch(`http://localhost:8404/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ post_id: post_id, group_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      if (response.ok) {
        const updatedPost = await response.json();
        setPost({
          // ...post,
          // TotalLikes: post.TotalLikes + 1,
          ...post,
          total_likes: updatedPost.total_likes,
          is_liked: updatedPost.is_liked,
        });
      }
    } catch (err) {
      console.error("Error liking post:", err);
      alert("Failed to like post. Please try again.");
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:8404/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data === true) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        setError(true);
        console.error("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchHomeData();
    }
  }, [isLoggedIn]);

  const fetchHomeData = async () => {
    try {
      const response = await fetch("http://localhost:8404/home", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setHomeData(data);
        setPosts(data.posts);
        console.log("Data received: ", data);
      }
    } catch (error) {
      setError(true);

      console.error("Error fetching posts:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-wrapper">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-page-container">
        {/* <Navbar /> */}
        <div className="post-page-content">
          <img
            src="/icons/no-post-state.svg"
            alt="Error"
            className="error-icon"
          />
          <div className="error-message">{error}</div>
          {/* <button className="back-button" onClick={() => router.push("/")}>
            Back to Home
          </button> */}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-page-container">
        {/* <Navbar /> */}
        <div className="post-page-content">
          <div className="error-message">Post not found</div>
          {/* <button className="back-button" onClick={() => router.push("/")}>
            Back to Home
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="post-page-container">
      {homeData && <Navbar user={homeData.user} />}
      <button onClick={goToHome} className="back-button">
        Go to Home
      </button>
      {/* <Navbar /> */}
      <div className="post-page-content">
        <div className="post-page-card">
          <div className="post-page-header">
            <div className="post-author-info">
              <img
                src={post.avatar}
                alt={post.avatar}
                className="author-avatar"
              />
              <div className="author-details">
                <a href={`/profile/${post.user_id}`} className="author-link">
                  <h4 className="author-name">{post.author}</h4>
                </a>
                <div className="timestamp">
                  <img src="/icons/created_at.svg" alt="Created at" />
                  <p className="created-at">{post.created_at}</p>
                </div>
              </div>
            </div>
            <div className="post-privacy">
              <img
                src={`/icons/${post.privacy}.svg`}
                width={"32px"}
                height={"32px"}
                className="privacy-icon"
                alt={post.privacy}
              />
            </div>
          </div>

          <div className="post-page-body">
            <h2 className="post-title">{post.title}</h2>
            <p className="post-content">{post.content}</p>

            {post.image && (
              <div className="post-image-container">
                <img src={post.image} alt="Post image" className="post-image" />
              </div>
            )}

            <div className="post-category">{post.category}</div>
          </div>

          <div className="post-actions">
            <div
              className={`action-like ${post.is_liked ? "liked-post" : ""}`}
              onClick={handleLike}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="18"
                fill="none"
                viewBox="0 0 20 18"
              >
                <path
                  fill={post.is_liked ? "#2563EB" : "#B8C3E1"}
                  d="M14.44.1C12.63.1 11.01.98 10 2.33A5.55 5.55 0 0 0 5.56.1C2.49.1 0 2.6 0 5.69 0 6.88.19 7.98.52 9c1.58 5 6.45 7.99 8.86 8.81.34.12.9.12 1.24 0C13.03 16.99 17.9 14 19.48 9c.33-1.02.52-2.12.52-3.31C20 2.6 17.51.1 14.44.1"
                ></path>
              </svg>
              <p
              // className={`${post.is_liked ? "liked-post" : ""}`}
              >
                {post.total_likes} Likes
              </p>
            </div>
            <div className="action-comment">
              <img src="/icons/comment.svg" alt="Comment" />
              <p>{post.total_comments} Comments</p>
            </div>
            <div
              className={`action-save ${post.saved ? "saved-post" : ""}`}
              onClick={handleSave}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="20"
                fill="none"
                viewBox="0 0 18 20"
              >
                <path
                  d="M13.5 0H3.86C1.73 0 0 1.74 0 3.86v14.09c0 1.8 1.29 2.56 2.87 1.69l4.88-2.71c.52-.29 1.36-.29 1.87 0l4.88 2.71c1.58.88 2.87.12 2.87-1.69V3.86C17.36 1.74 15.63 0 13.5 0m-1.81 7.75c-.97.35-1.99.53-3.01.53s-2.04-.18-3.01-.53a.75.75 0 0 1-.45-.96c.15-.39.58-.59.97-.45 1.61.58 3.38.58 4.99 0a.75.75 0 1 1 .51 1.41"
                  fill={post.saved ? "#2563EB" : "#B8C3E1"}
                ></path>
              </svg>
              {/* <img src="/icons/comment.svg" alt="Comment" /> */}
              <span>{post.total_saves} Saves</span>
            </div>
          </div>
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              className="comment-input"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />

            <div className="file-input-container">
              <label className="file-input-label">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 22 22"
                >
                  <path
                    fill="#3555F9"
                    d="M1.67 18.7a.746.746 0 0 1-.41-1.37l4.93-3.31c1.08-.73 2.57-.64 3.55.19l.33.29c.5.43 1.35.43 1.84 0l4.16-3.57c1.06-.91 2.73-.91 3.8 0l1.63 1.4c.31.27.35.74.08 1.06-.27.31-.74.35-1.06.08l-1.63-1.4c-.5-.43-1.35-.43-1.85 0l-4.16 3.57c-1.06.91-2.73.91-3.8 0l-.33-.29c-.46-.39-1.22-.43-1.73-.08l-4.93 3.31c-.13.08-.28.12-.42.12M8 9.75C6.48 9.75 5.25 8.52 5.25 7S6.48 4.25 8 4.25 10.75 5.48 10.75 7 9.52 9.75 8 9.75m0-4a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5"
                  ></path>
                  <path
                    fill="#3555F9"
                    d="M14 21.75H8C2.57 21.75.25 19.43.25 14V8C.25 2.57 2.57.25 8 .25h6c5.43 0 7.75 2.32 7.75 7.75v6c0 5.43-2.32 7.75-7.75 7.75m-6-20C3.39 1.75 1.75 3.39 1.75 8v6c0 4.61 1.64 6.25 6.25 6.25h6c4.61 0 6.25-1.64 6.25-6.25V8c0-4.61-1.64-6.25-6.25-6.25z"
                  ></path>
                </svg>
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setGroupImage(e.target.files[0])}
                  className="file-input"
                />
              </label>
            </div>

            {groupImage && (
              <div className="image-preview">
                <img
                  src={URL.createObjectURL(groupImage)}
                  alt="Preview"
                  className="preview-image"
                />
                <span
                  className="remove-image"
                  onClick={() => setGroupImage(null)}
                >
                  ×
                </span>
              </div>
            )}

            <button type="submit" className="comment-submit-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 18 18"
              >
                <path
                  fill="#fff"
                  d="M15.07 5.51 6.51 1.23C.76-1.65-1.6.71 1.28 6.46l.87 1.74c.25.51.25 1.1 0 1.61l-.87 1.73c-2.88 5.75-.53 8.11 5.23 5.23l8.56-4.28c3.84-1.92 3.84-5.06 0-6.98m-3.23 4.24h-5.4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h5.4c.41 0 .75.34.75.75s-.34.75-.75.75"
                ></path>
              </svg>
              Comment
            </button>
          </form>
          <div className="post-comments-section">
            <h3 className="comments-title">Comments</h3>

            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => {
                  console.log(comment);
                  const key = `${comment.comment_id || "defaultID"}-${
                    comment.created_at || "defaultCreatedAt"
                  }`;

                  return (
                    <div key={key} className="comment-item">
                      <div className="comment-header">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="comment-avatar"
                        />
                        <div className="comment-author-info">
                          <h4 className="comment-author">{comment.author}</h4>
                          <p className="comment-time">{comment.created_at}</p>
                        </div>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                      {comment.image && (
                        <img
                          src={comment.image}
                          alt="Comment image"
                          className="comment-image"
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="no-comments">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* <button className="back-button" onClick={() => router.push("/")}>
          Back to Home
        </button> */}
      </div>
    </div>
  );
}
