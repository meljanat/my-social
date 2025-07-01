"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/PostComponent.module.css";

export default function PostComponent({ posts: initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [activeLikesPopup, setActiveLikesPopup] = useState(null);
  const popupRef = useRef(null);
  const router = useRouter();

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
    <div className={styles.postsContainer}>
      {posts?.map((post) => (
        <div key={post.post_id} className={styles.postCard}>
          <div className={styles.header}>
            <div className={styles.postHeader}>
              <img
                src={post.avatar || "avatar.jpg"}
                alt={post.author}
                className={styles.authorAvatar}
              />
              <div className={styles.authorInfo}>
                <h4 className={styles.authorName}>{post.author}</h4>
                <div className={styles.timestamp}>
                  <img src="./icons/created_at.svg" alt="Time" />
                  <p className={styles.createdAt}>{post.created_at}</p>
                </div>
              </div>
            </div>
            <div className={styles.postPrivacy}>
              <img
                src={`./icons/${post.privacy}.svg`}
                width="32"
                height="32"
                className={styles.privacyIcon}
                alt={post.privacy}
              />
            </div>
          </div>

          <div className={styles.postContent}>
            <h3 className={styles.postTitle}>{post.title}</h3>
            <p className={styles.postText}>{post.content}</p>

            {post.image && (
              <div className={styles.postImageContainer}>
                <img
                  src={post.image}
                  alt="Post content"
                  className={styles.postImage}
                />
              </div>
            )}

            <div
              className={styles.postCategory}
              style={{
                color: post.category_color,
                backgroundColor: post.category_background,
              }}
            >
              {post.category}
            </div>
          </div>

          <div className={styles.postActions}>
            <div className={styles.likeActionContainer}>
              <button
                className={`${styles.actionButton} ${styles.actionLike} ${
                  post.is_liked ? styles.liked : ""
                }`}
                onClick={() => handleLike(post.post_id)}
              >
                <svg
                  className={styles.likeIcon}
                  width="20"
                  height="18"
                  viewBox="0 0 20 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.44 0.0999756C12.63 0.0999756 11.01 0.979976 10 2.32998C8.99 0.979976 7.37 0.0999756 5.56 0.0999756C2.49 0.0999756 0 2.59998 0 5.68998C0 6.87998 0.19 7.97998 0.52 8.99998C2.1 14 6.97 16.99 9.38 17.81C9.72 17.93 10.28 17.93 10.62 17.81C13.03 16.99 17.9 14 19.48 8.99998C19.81 7.97998 20 6.87998 20 5.68998C20 2.59998 17.51 0.0999756 14.44 0.0999756Z"
                    fill={post.is_liked ? "#667eea" : "currentColor"}
                  />
                </svg>
                <span>{post.total_likes} Likes</span>
              </button>

              {post.total_likes > 0 && (
                <button
                  className={styles.viewLikesButton}
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
                      fill="currentColor"
                    />
                    <path
                      d="M12 21C7.31 21 3.07 17.96 1.28 13.28C0.920005 12.46 0.920005 11.54 1.28 10.72C3.07 6.04 7.31 3 12 3C16.69 3 20.93 6.04 22.72 10.72C23.08 11.54 23.08 12.46 22.72 13.28C20.93 17.96 16.69 21 12 21ZM2.71 11.58C2.52 11.94 2.5 12.35 2.67 12.7C4.24 16.67 7.91 19.2 12 19.2C16.09 19.2 19.76 16.67 21.33 12.7C21.5 12.35 21.48 11.94 21.29 11.58C19.72 7.59 16.08 4.8 12 4.8C7.92 4.8 4.28 7.59 2.71 11.58Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              )}
            </div>

            <button
              className={`${styles.actionButton} ${styles.actionComment}`}
              onClick={() => router.push(`/post?id=${post.post_id}`)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.19 8H6.79C3.6 8 2 9.6 2 12.79V16.79C2 19.98 3.6 21.58 6.79 21.58H7.19C7.48 21.58 7.84 21.75 8.03 21.97L9.23 23.57C9.76 24.28 10.62 24.28 11.15 23.57L12.35 21.97C12.57 21.72 12.86 21.58 13.19 21.58C16.38 21.58 17.98 19.98 17.98 16.79V12.79C17.98 9.6 16.38 8 13.19 8ZM7 15C6.45 15 6 14.55 6 14C6 13.45 6.45 13 7 13C7.55 13 8 13.45 8 14C8 14.55 7.55 15 7 15ZM10 15C9.45 15 9 14.55 9 14C9 13.45 9.45 13 10 13C10.55 13 11 13.45 11 14C11 14.55 10.55 15 10 15ZM13 15C12.45 15 12 14.55 12 14C12 13.45 12.45 13 13 13C13.55 13 14 13.45 14 14C14 14.55 13.55 15 13 15Z"
                  fill="currentColor"
                />
              </svg>
              <span>{post.total_comments} Comments</span>
            </button>

            <button
              className={`${styles.actionButton} ${styles.actionSave} ${
                post.saved ? styles.saved : ""
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
                  fill={post.saved ? "#667eea" : "currentColor"}
                />
              </svg>
              <span>{post.total_saves} Saves</span>
            </button>
          </div>

          <a href={`/post?id=${post.post_id}`} className={styles.postLink}>
            <button className={styles.seePostButton}>
              See post <span className={styles.arrow}>→</span>
            </button>
          </a>
        </div>
      ))}

      {activeLikesPopup !== null &&
        posts.find((p) => p.post_id === activeLikesPopup)?.who_liked && (
          <div
            className={styles.modalOverlay}
            onClick={() => setActiveLikesPopup(null)}
          >
            <div
              className={styles.likesModal}
              ref={popupRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.likesModalHeader}>
                <h4>People who liked this post</h4>
                <button
                  className={styles.closeModalButton}
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
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className={styles.likesModalList}>
                {posts
                  .find((p) => p.post_id === activeLikesPopup)
                  ?.who_liked.map((user, index) => (
                    <div key={index} className={styles.likesModalUserItem}>
                      <img
                        src={user.avatar || "avatar.jpg"}
                        alt={user.username}
                        className={styles.likesModalUserAvatar}
                      />
                      <div className={styles.likesModalUserInfo}>
                        <span className={styles.likesModalUsername}>
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
