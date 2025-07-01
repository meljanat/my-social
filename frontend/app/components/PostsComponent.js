import React from "react"; 
import styles from "../styles/PostsComponent.module.css";
import { handleLike } from "../functions/post";

export default function PostsComponent({ post, setPosts }) {
  console.log("setPosts:", setPosts);

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

        {post.image && (
          <div className={styles.postImageContainer}>
            <img
              src={post.image}
              alt={post.title}
              className={styles.postImageModern}
            />
          </div>
        )}
      </div>

      <div className={styles.postCardFooter}>
        <div className={styles.postEngagement}>
          <div
            className={styles.postStat}
            onClick={() => handleLike(post.post_id, setPosts)}
          >
            <img src="/icons/like.svg" alt="Like" />
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
