"use client";
import React, { useState, useEffect } from "react";
import AuthForm from "../components/AuthForm";
import { useSearchParams } from "next/navigation";
import styles from "../styles/PostPage.module.css";

export default function PostPage() {
  const searchParams = useSearchParams();
  const post_id = searchParams.get("id");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentImageFile, setCommentImageFile] = useState(null); // Renamed from groupImage for clarity
  // const [homeData, setHomeData] = useState(null); // Unused
  // const [posts, setPosts] = useState([]); // Unused
  // const [postSaved, setPostSaved] = useState(); // Unused

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
          setIsLoggedIn(data);
        }
      } catch (error) {
        console.log("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [isLoggedIn]);

  async function handleSave(postIdToSave) {
    try {
      const response = await fetch(`http://localhost:8404/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ post_id: parseInt(postIdToSave) }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost({
          ...post,
          saved: updatedPost.saved,
          total_saves: updatedPost.total_saves,
        });
      }
    } catch (error) {
      console.error("Error saving post:", error);
      setError("Network error while saving post.");
    }
  }

  useEffect(() => {
    const fetchPost = async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8404/post?post_id=${id}&offset=0`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch post.");
        }

        const data = await response.json();
        setPost(data);
        setComments(data.comments || []);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to load post. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (post_id) {
      fetchPost(post_id);
    } else {
      setIsLoading(false);
      setError("No post ID provided.");
    }
  }, [post_id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const formData = new FormData();
    formData.append("post_id", post_id);
    formData.append("content", newComment);
    if (commentImageFile) {
      formData.append("commentImage", commentImageFile);
    }
    try {
      const response = await fetch("http://localhost:8404/comment", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add comment.");
      }

      const data = await response.json();

      setComments([data, ...comments]);

      setPost((prevPost) => ({
        ...prevPost,
        total_comments: prevPost.total_comments + 1,
      }));

      setNewComment("");
      setCommentImageFile(null);
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err.message || "Failed to add comment. Please try again.");
    }
  };

  const handleLike = async (postIdToLike) => {
    try {
      const response = await fetch(`http://localhost:8404/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ post_id: parseInt(postIdToLike) }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost({
          ...post,
          total_likes: updatedPost.total_likes,
          is_liked: updatedPost.is_liked,
        });
      }
    } catch (err) {
      console.error("Error liking post:", err);
      setError(err.message || "Failed to like post. Please try again.");
    }
  };

  if (!isLoggedIn) {
    return <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinnerWrapper}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading Post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.postPageContainer}>
        <div className={styles.postPageContent}>
          <img
            src="/icons/no-post-state.svg" // Ensure this SVG exists
            alt="Error"
            className={styles.errorIcon}
          />
          <div className={styles.errorMessage}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton} // Reusing retry button style
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.postPageContainer}>
        <div className={styles.postPageContent}>
          <div className={styles.errorMessage}>Post not found</div>
          {/* <button className={styles.backButton} onClick={() => router.push("/")}>
            Back to Home
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.postPageContainer}>
      <div className={styles.postPageContent}>
        <div className={styles.postPageCard}>
          <div className={styles.postPageHeader}>
            <div className={styles.postAuthorInfo}>
              <img
                src={post.avatar || "/inconnu/avatar.png"} // Added fallback
                alt={post.author}
                className={styles.authorAvatar}
              />
              <div className={styles.authorDetails}>
                <a
                  href={`/profile?id=${post.user_id}`}
                  className={styles.authorLink}
                >
                  <h4 className={styles.authorName}>{post.author}</h4>
                </a>
                <div className={styles.timestamp}>
                  {/* Assuming created_at.svg exists or use emoji/text */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.timestampIcon}
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <p className={styles.createdAt}>{post.created_at}</p>
                </div>
              </div>
            </div>
            <div className={styles.postPrivacy}>
              <img
                src={`/icons/${post.privacy}.svg`}
                width={"32px"}
                height={"32px"}
                className={styles.privacyIcon}
                alt={post.privacy}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/icons/default-privacy.svg";
                }}
              />
            </div>
          </div>

          <div className={styles.postPageBody}>
            <h2 className={styles.postTitle}>{post.title}</h2>
            <p className={styles.postContent}>{post.content}</p>

            {post.image && (
              <div className={styles.postImageContainer}>
                <img
                  src={post.image}
                  alt="Post image"
                  className={styles.postImage}
                />
              </div>
            )}

            <div className={styles.postCategory}>{post.category}</div>
          </div>

          <div className={styles.postActions}>
            <div
              className={`${styles.actionLike} ${post.is_liked ? styles.likedPost : ""
                }`}
              onClick={() => handleLike(post_id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="18"
                fill="none"
                viewBox="0 0 20 18"
              >
                <path
                  fill={post.is_liked ? "#667eea" : "#B8C3E1"} // Changed fill color to match gradient
                  d="M14.44.1C12.63.1 11.01.98 10 2.33A5.55 5.55 0 0 0 5.56.1C2.49.1 0 2.6 0 5.69 0 6.88.19 7.98.52 9c1.58 5 6.45 7.99 8.86 8.81.34.12.9.12 1.24 0C13.03 16.99 17.9 14 19.48 9c.33-1.02.52-2.12.52-3.31C20 2.6 17.51.1 14.44.1"
                ></path>
              </svg>
              <p>{post.total_likes} Likes</p>
            </div>
            <div className={styles.actionComment}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B8C3E1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.commentIcon}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>{post.total_comments} Comments</p>
            </div>
            <div
              className={`${styles.actionSave} ${post.saved ? styles.savedPost : ""
                }`}
              onClick={() => handleSave(post_id)}
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
                  fill={post.saved ? "#667eea" : "#B8C3E1"} // Changed fill color to match gradient
                ></path>
              </svg>
              <span>{post.total_saves} Saves</span>
            </div>
          </div>
          <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
            <textarea
              className={styles.commentInput}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />

            <div className={styles.fileInputContainer}>
              <label className={styles.fileInputLabel}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 22 22"
                >
                  <path
                    fill="#667eea" // Changed fill color
                    d="M1.67 18.7a.746.746 0 0 1-.41-1.37l4.93-3.31c1.08-.73 2.57-.64 3.55.19l.33.29c.5.43 1.35.43 1.84 0l4.16-3.57c1.06-.91 2.73-.91 3.8 0l1.63 1.4c.31.27.35.74.08 1.06-.27.31-.74.35-1.06.08l-1.63-1.4c-.5-.43-1.35-.43-1.85 0l-4.16 3.57c-1.06.91-2.73.91-3.8 0l-.33-.29c-.46-.39-1.22-.43-1.73-.08l-4.93 3.31c-.13.08-.28.12-.42.12M8 9.75C6.48 9.75 5.25 8.52 5.25 7S6.48 4.25 8 4.25 10.75 5.48 10.75 7 9.52 9.75 8 9.75m0-4a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5"
                  ></path>
                  <path
                    fill="#667eea" // Changed fill color
                    d="M14 21.75H8C2.57 21.75.25 19.43.25 14V8C.25 2.57 2.57.25 8 .25h6c5.43 0 7.75 2.32 7.75 7.75v6c0 5.43-2.32 7.75-7.75 7.75m-6-20C3.39 1.75 1.75 3.39 1.75 8v6c0 4.61 1.64 6.25 6.25 6.25h6c4.61 0 6.25-1.64 6.25-6.25V8c0-4.61-1.64-6.25-6.25-6.25z"
                  ></path>
                </svg>
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCommentImageFile(e.target.files[0])}
                  className={styles.hiddenFileInput} // Changed class name
                />
              </label>
            </div>

            {commentImageFile && (
              <div className={styles.imagePreview}>
                <img
                  src={URL.createObjectURL(commentImageFile)}
                  alt="Preview"
                  className={styles.previewImage}
                />
                <span
                  className={styles.removeImage}
                  onClick={() => setCommentImageFile(null)}
                >
                  ×
                </span>
              </div>
            )}

            <button type="submit" className={styles.commentSubmitBtn}>
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
          <div className={styles.postCommentsSection}>
            <h3 className={styles.commentsTitle}>Comments</h3>

            <div className={styles.commentsList}>
              {comments.length > 0 ? (
                comments.map((comment) => {
                  const key = `${comment.comment_id}`;

                  return (
                    <div key={key} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <img
                          src={comment.avatar || "/inconnu/avatar.png"}
                          alt={comment.username}
                          className={styles.commentAvatar}
                        />
                        <div className={styles.commentAuthorInfo}>
                          <h4 className={styles.commentAuthor}>
                            {comment.username}
                          </h4>
                          <p className={styles.commentTime}>
                            {comment.created_at}
                          </p>
                        </div>
                      </div>
                      <p className={styles.commentContent}>{comment.content}</p>
                      {comment.image && (
                        <img
                          src={comment.image}
                          alt="Comment image"
                          className={styles.commentImage}
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <p className={styles.noComments}>
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
