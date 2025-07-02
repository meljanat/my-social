import styles from "../styles/PostCard.module.css";

export default function PostCard({ post }) {
  return (
    <div className={styles.postCard}>
      <div className={styles.postHeader}>
        <img
          src={post.avatar}
          alt={post.username}
          className={styles.userAvatar}
        />
        <div className={styles.userInfo}>
          <h4 className={styles.userName}>{post.author}</h4>
          <span className={styles.postTime}>{post.created_at}</span>
        </div>
      </div>

      <h3 className={styles.postTitle}>{post.title}</h3>
      <p className={styles.postContent}>{post.content}</p>

      {/* {post.image && (
        <div className={styles.postImage}>
          <img src={post.image} alt="Post" />
        </div>
      )} */}

      <div className={styles.postActions}>
        <button className={styles.actionBtn}>
          <svg
            className={styles.actionIcon}
            width="18"
            height="16"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.44 0.0999756C12.63 0.0999756 11.01 0.979976 10 2.32998C8.99 0.979976 7.37 0.0999756 5.56 0.0999756C2.49 0.0999756 0 2.59998 0 5.68998C0 6.87998 0.19 7.97998 0.52 8.99998C2.1 14 6.97 16.99 9.38 17.81C9.72 17.93 10.28 17.93 10.62 17.81C13.03 16.99 17.9 14 19.48 8.99998C19.81 7.97998 20 6.87998 20 5.68998C20 2.59998 17.51 0.0999756 14.44 0.0999756Z"
              fill="currentColor"
            />
          </svg>
          {post.likes} Likes
        </button>

        <button className={styles.actionBtn}>
          <svg
            className={styles.actionIcon}
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
          {post.comments} Comments
        </button>
      </div>
    </div>
  );
}
