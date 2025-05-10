import "../../styles/GroupsPage.css";

export default function PostCard({ post }) {
  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={post.user_avatar}
          alt={post.username}
          className="post-user-avatar"
        />
        <div className="post-user-info">
          <h4>{post.user_name}</h4>
          <span className="post-time">{post.created_at}</span>
        </div>
      </div>
      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>
      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="Post" />
        </div>
      )}
      <div className="post-actions">
        <button className="post-action-btn">
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
              //   fill={post.is_liked ? "#2563EB" : "white"}
              fill={"#2563EB"}
            />
          </svg>
          {post.likes} Likes
        </button>
        <button className="post-action-btn">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.19 6H6.79C6.53 6 6.28 6.01 6.04 6.04C3.35 6.27 2 7.86 2 10.79V14.79C2 18.79 3.6 19.58 6.79 19.58H7.19C7.41 19.58 7.7 19.73 7.83 19.9L9.03 21.5C9.56 22.21 10.42 22.21 10.95 21.5L12.15 19.9C12.3 19.7 12.54 19.58 12.79 19.58H13.19C16.12 19.58 17.71 18.24 17.94 15.54C17.97 15.3 17.98 15.05 17.98 14.79V10.79C17.98 7.6 16.38 6 13.19 6ZM6.5 14C5.94 14 5.5 13.55 5.5 13C5.5 12.45 5.95 12 6.5 12C7.05 12 7.5 12.45 7.5 13C7.5 13.55 7.05 14 6.5 14ZM9.99 14C9.43 14 8.99 13.55 8.99 13C8.99 12.45 9.44 12 9.99 12C10.54 12 10.99 12.45 10.99 13C10.99 13.55 10.55 14 9.99 14ZM13.49 14C12.93 14 12.49 13.55 12.49 13C12.49 12.45 12.94 12 13.49 12C14.04 12 14.49 12.45 14.49 13C14.49 13.55 14.04 14 13.49 14Z"
              fill="#2563EB"
            />
            <path
              d="M21.98 6.79V10.79C21.98 12.79 21.36 14.15 20.12 14.9C19.82 15.08 19.47 14.84 19.47 14.49L19.48 10.79C19.48 6.79 17.19 4.5 13.19 4.5L7.1 4.51C6.75 4.51 6.51 4.16 6.69 3.86C7.44 2.62 8.8 2 10.79 2H17.19C20.38 2 21.98 3.6 21.98 6.79Z"
              fill="#2563EB"
            />
          </svg>
          {post.comments} Comments
        </button>
      </div>
    </div>
  );
}
