import "../styles/ProfilePage.css";
import { handleLike } from "../functions/post";

export default function PostsComponent({ post, setPosts }) {

  console.log("setPosts:" ,setPosts);
  
  return (
    <div key={post.id} className="post-card-modern">
      <div className="post-card-header">
        <div className="post-author-info">
          <img
            src={post.avatar || "./inconnu/avatar.png"}
            alt={post.author}
            className="post-author-avatar"
          />
          <div>
            <h4
              className="post-author-name"
              onClick={() => {
                window.location.href = `/profile?id=${post.user.user_id}`;
              }}
            >
              {post.author}
            </h4>
            <div className="post-meta">
              <span className="post-date">{post.created_at}</span>
              <span className="post-visibility">
                <img
                  src={`/icons/${post.privacy}.svg`}
                  alt={post.privacy}
                  className="post-visibility-icon"
                />
              </span>
            </div>
          </div>
        </div>
        <div className="post-category-badge">{post.category}</div>
      </div>

      <div className="post-card-content">
        <h3 className="post-title-modern">{post.title}</h3>
        <p className="post-text-modern">{post.content}</p>

        {post.image && (
          <div className="post-image-container">
            <img
              src={post.image}
              alt={post.title}
              className="post-image-modern"
            />
          </div>
        )}
      </div>

      <div className="post-card-footer">
        <div className="post-engagement">
          <div className="post-stat" onClick={() => handleLike(post.post_id, setPosts)}>
            <img src="/icons/like.svg" alt="Like" />
            <span>{post.total_likes}</span>
          </div>
          <div className="post-stat">
            <img src="/icons/comment.svg" alt="Comment" />
            <span>{post.total_comments}</span>
          </div>
        </div>
        <button
          className="post-view-button"
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
