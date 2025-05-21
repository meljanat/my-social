"use client";
import { useState, useEffect, useRef } from "react";
import "../styles/PostComponent.css";

export default function PostComponent({ posts: initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [savedMessage, setSavedMessage] = useState("");
  const [commentDiv, setCommentDiv] = useState(false);
  const [activeLikesPopup, setActiveLikesPopup] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActiveLikesPopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleComment(postId) {
    try {
      const response = await fetch("http://localhost:8404/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(postId),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data);
      }
      if (response.ok) {
        const updatedPost = await response.json();

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === postId
              ? {
                  ...post,
                  total_comments: updatedPost.total_comments,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSave(postId) {
    try {
      const response = await fetch(`http://localhost:8404/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ post_id: postId, group_id: 0 }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(error);
      } else {
        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === postId
              ? {
                  ...post,
                  saved: updatedPost.saved,
                  total_saves: updatedPost.total_saves,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLike(postId) {
    try {
      const response = await fetch("http://localhost:8404/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ post_id: postId, group_id: 0 }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error(data);
      }
      if (response.ok) {
        const updatedPost = await response.json();
        console.log("Updated post: ", updatedPost);

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === postId
              ? {
                  ...post,
                  total_likes: updatedPost.total_likes,
                  is_liked: updatedPost.is_liked,
                  who_liked: updatedPost.who_liked || post.who_liked,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  function toggleLikesPopup(postId) {
    if (activeLikesPopup === postId) {
      setActiveLikesPopup(null);
    } else {
      setActiveLikesPopup(postId);
    }
  }

  return (
    <div className="posts-container">
      {posts?.map((post) => (
        <div key={post.post_id} className="post-card">
          <div className="header">
            <div className="post-header">
              <img
                src={post.avatar || "avatar.jpg"}
                alt={post.author}
                className="author-avatar"
              />
              <div className="author-info">
                <h4 className="author-name">{post.author}</h4>
                <div className="timestamp">
                  <img src="./icons/created_at.svg" alt="Time" />
                  <p className="created-at">{post.created_at}</p>
                </div>
              </div>
            </div>
            <div className="post-privacy">
              <img
                src={`./icons/${post.privacy}.svg`}
                width="32"
                height="32"
                className="privacy-icon"
                alt={post.privacy}
              />
            </div>
          </div>

          <div className="post-content">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-text">{post.content}</p>

            {post.image && (
              <div className="post-image-container">
                <img
                  src={post.image}
                  alt="Post content"
                  className="post-image"
                />
              </div>
            )}

            <div
              className="post-category"
              style={{
                color: post.category_color,
                backgroundColor: post.category_background,
              }}
            >
              {post.category}
            </div>
          </div>

          <div className="post-actions">
            <div className="like-action-container">
              <button
                className={`action-button action-like ${
                  post.is_liked ? "liked" : ""
                }`}
                onClick={() => handleLike(post.post_id)}
              >
                <svg
                  className="like-icon"
                  width="20"
                  height="18"
                  viewBox="0 0 20 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.44 0.0999756C12.63 0.0999756 11.01 0.979976 10 2.32998C8.99 0.979976 7.37 0.0999756 5.56 0.0999756C2.49 0.0999756 0 2.59998 0 5.68998C0 6.87998 0.19 7.97998 0.52 8.99998C2.1 14 6.97 16.99 9.38 17.81C9.72 17.93 10.28 17.93 10.62 17.81C13.03 16.99 17.9 14 19.48 8.99998C19.81 7.97998 20 6.87998 20 5.68998C20 2.59998 17.51 0.0999756 14.44 0.0999756Z"
                    fill={post.is_liked ? "#2563EB" : "white"}
                  />
                </svg>
                <span>{post.total_likes} Likes</span>
              </button>

              {post.total_likes > 0 && (
                <button
                  className="view-likes-button"
                  onClick={() => toggleLikesPopup(post.post_id)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 16.5C9.51 16.5 7.5 14.49 7.5 12C7.5 9.51 9.51 7.5 12 7.5C14.49 7.5 16.5 9.51 16.5 12C16.5 14.49 14.49 16.5 12 16.5ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                      fill="#555"
                    />
                    <path
                      d="M12 21C7.31 21 3.07 17.96 1.28 13.28C0.920005 12.46 0.920005 11.54 1.28 10.72C3.07 6.04 7.31 3 12 3C16.69 3 20.93 6.04 22.72 10.72C23.08 11.54 23.08 12.46 22.72 13.28C20.93 17.96 16.69 21 12 21ZM2.71 11.58C2.52 11.94 2.5 12.35 2.67 12.7C4.24 16.67 7.91 19.2 12 19.2C16.09 19.2 19.76 16.67 21.33 12.7C21.5 12.35 21.48 11.94 21.29 11.58C19.72 7.59 16.08 4.8 12 4.8C7.92 4.8 4.28 7.59 2.71 11.58Z"
                      fill="#555"
                    />
                  </svg>
                </button>
              )}
            </div>

            <button
              className="action-button action-comment"
              onClick={() => setCommentDiv(!commentDiv)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.19 6H6.79C6.53 6 6.28 6.01 6.04 6.04C3.35 6.27 2 7.86 2 10.79V14.79C2 18.79 3.6 19.58 6.79 19.58H7.19C7.41 19.58 7.7 19.73 7.83 19.9L9.03 21.5C9.56 22.21 10.42 22.21 10.95 21.5L12.15 19.9C12.3 19.7 12.54 19.58 12.79 19.58H13.19C16.12 19.58 17.71 18.24 17.94 15.54C17.97 15.3 17.98 15.05 17.98 14.79V10.79C17.98 7.6 16.38 6 13.19 6ZM6.5 14C5.94 14 5.5 13.55 5.5 13C5.5 12.45 5.95 12 6.5 12C7.05 12 7.5 12.45 7.5 13C7.5 13.55 7.05 14 6.5 14ZM9.99 14C9.43 14 8.99 13.55 8.99 13C8.99 12.45 9.44 12 9.99 12C10.54 12 10.99 12.45 10.99 13C10.99 13.55 10.55 14 9.99 14ZM13.49 14C12.93 14 12.49 13.55 12.49 13C12.49 12.45 12.94 12 13.49 12C14.04 12 14.49 12.45 14.49 13C14.49 13.55 14.04 14 13.49 14Z"
                  fill="#fff"
                />
                <path
                  d="M21.98 6.79V10.79C21.98 12.79 21.36 14.15 20.12 14.9C19.82 15.08 19.47 14.84 19.47 14.49L19.48 10.79C19.48 6.79 17.19 4.5 13.19 4.5L7.1 4.51C6.75 4.51 6.51 4.16 6.69 3.86C7.44 2.62 8.8 2 10.79 2H17.19C20.38 2 21.98 3.6 21.98 6.79Z"
                  fill="#fff"
                />
              </svg>
              <span>{post.total_comments} Comments</span>
            </button>

            <button
              className={`action-button action-save ${
                post.saved ? "saved" : ""
              }`}
              onClick={() => handleSave(post.post_id)}
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
                  fill={post.saved ? "#2563EB" : "white"}
                ></path>
              </svg>
              <span>{post.total_saves} Saves</span>
            </button>
          </div>

          {savedMessage && (
            <div
              className="saved-message"
              style={{ color: "green", paddingLeft: "20px" }}
            >
              <p style={{ fontSize: "14px" }}>{savedMessage}</p>
            </div>
          )}

          <div
            className="comment-div"
            style={{
              display: commentDiv ? "block" : "none",
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
          >
            <input
              style={{
                width: "100%",
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
              type="text"
              className="comment-input"
              placeholder="Write a comment..."
            />
            <button
              style={{
                backgroundColor: "#2563EB",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "400",
              }}
              className="comment-button"
              onClick={() => handleComment(post.post_id)}
            >
              Comment
            </button>
          </div>

          <a href={`/post/${post.post_id}/0`} className="post-link">
            <button className="see-post-button">
              See post <span className="arrow">→</span>
            </button>
          </a>
        </div>
      ))}

      {/* Modal popup for likes */}
      {activeLikesPopup !== null &&
        posts.find((p) => p.post_id === activeLikesPopup)?.who_liked && (
          <div
            className="modal-overlay"
            onClick={() => setActiveLikesPopup(null)}
          >
            <div
              className="likes-modal"
              ref={popupRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="likes-modal-header">
                <h4>People who liked this post</h4>
                <button
                  className="close-modal-button"
                  onClick={() => setActiveLikesPopup(null)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="#555"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="#555"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="likes-modal-list">
                {posts
                  .find((p) => p.post_id === activeLikesPopup)
                  ?.who_liked.map((user, index) => (
                    <div key={index} className="likes-modal-user-item">
                      <img
                        src={user.avatar || "avatar.jpg"}
                        alt={user.username}
                        className="likes-modal-user-avatar"
                      />
                      <div className="likes-modal-user-info">
                        <span className="likes-modal-username">
                          {user.username}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
