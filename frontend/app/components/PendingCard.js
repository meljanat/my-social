import { handleFollow } from "../functions/user";
import "../styles/PendingGroupRequestCard.css";
export default function PendingGroupRequestCard({
  group,
  onClick,
}) {
  return (
    <div className="pending-group-card" onClick={onClick}>
      <div className="pending-group-content">
        <div className="pending-group-header">
          <div className="pending-group-info">
            <img
              src={`.${group.image}`}
              alt={group.name}
              className="pending-group-avatar"
            />

            <div className="pending-group-name">
              <h3>{group.name}</h3>
              <div className="pending-group-status">
                <span>Request Pending</span>
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      handleFollow(group.admin_id, group.group_id);
                    }}
                    className="pending-group-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {group.description && (
          <p className="pending-group-description">{group.description}</p>
        )}

        <div className="pending-group-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#3555F9"
                width="14"
                height="14"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span className="stat-label">{group.total_members || 1}</span>
            <span className="stat-text">members</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#3555F9"
                width="14"
                height="14"
              >
                <path
                  fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                  clipRule="evenodd"
                />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
              </svg>
            </div>
            <span className="stat-label">{group.total_posts || 0}</span>
            <span className="stat-text">posts</span>
          </div>
        </div>

        <div className="pending-group-request-date">
          Requested on {group.created_at || "2 hours ago"}
        </div>
      </div>
    </div>
  );
}
