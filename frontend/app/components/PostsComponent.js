import React from "react";
import styles from "../styles/PostsComponent.module.css";
import { handleLike } from "../functions/post";

export default function PostsComponent({ post, setPosts }) {
  return (
    <div key={post.id} className={styles.postCardModern}>
      <div className={styles.postCardHeader}>
        <div className={styles.postAuthorInfo}>
          <img
            src={post.avatar || "/inconnu/avatar.png"}
            alt={post.author}
            className={styles.postAuthorAvatar}
          />
          <div>
            <h4
              className={styles.postAuthorName}
              onClick={() => {
                window.location.href = `/profile?id=${post.user.user_id}`;
              }}
            >
              {post.author}
            </h4>
            <div className={styles.postMeta}>
              <span className={styles.postDate}>{post.created_at}</span>
              <span className={styles.postVisibility}>
                <img
                  src={`/icons/${post.privacy}.svg`}
                  alt={post.privacy}
                  className={styles.postVisibilityIcon}
                />
              </span>
            </div>
          </div>
        </div>
        <div className={styles.postCategoryBadge}>{post.category}</div>
      </div>

      <div className={styles.postCardContent}>
        <h3 className={styles.postTitleModern}>{post.title}</h3>
        <p className={styles.postTextModern}>{post.content}</p>
        {/* 
        {post.image && (
          <div className={styles.postImageContainer}>
            <img
              src={post.image}
              alt={post.title}
              className={styles.postImageModern}
            />
          </div>
        )} */}
      </div>

      <div className={styles.postCardFooter}>
        <div className={styles.postEngagement}>
          <div
            className={`${styles.postStat} ${
              post.is_liked ? styles.liked : ""
            }`}
            onClick={() => handleLike(post.post_id, setPosts)}
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
                fill={post.is_liked ? "#667eea" : "#64748b"}
              />
            </svg>
            <span>{post.total_likes}</span>
          </div>
          <div className={styles.postStat}>
            <img src="/icons/comment.svg" alt="Comment" />
            <span>{post.total_comments}</span>
          </div>
        </div>
        <button
          className={styles.postViewButton}
          onClick={() => {
            window.location.href = `/post?id=${post.post_id}`;
          }}
        >
          View Post
        </button>
      </div>
    </div>
  );
}
