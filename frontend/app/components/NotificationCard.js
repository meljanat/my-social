import "../styles/NotificationCard.css";

export default function NotificationCard({ notification }) {
  function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diff = now - past;

    if (isNaN(past)) return "Invalid date";

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    if (weeks < 5) return `${weeks} weeks ago`;
    if (months < 12) return `${months} months ago`;
    return `${years} years ago`;
  }

  const notificationTime = timeAgo(notification.created_at);

  return (
    <div className="notification-item">
      <div className="notification-content">
        {notification.unread && (
          <div className="unread-indicator-container">
            <div className="unread-indicator"></div>
          </div>
        )}

        <div className="avatar-container">
          <img
            src={notification.avatar}
            alt={notification.username}
            className="avatar-image"
          />
        </div>

        <div className="notification-text">
          <div className="notification-message">
            <span className="user-name">{notification.username}</span>
            <span className="action-text">
              {notification.type_notification === "invite"
                ? " requests to follow your profile"
                : "like"
                ? " liked your post"
                : " accept your request"}
            </span>
          </div>

          <div className="notification-time">{notificationTime}</div>

          {notification.hasActions && (
            <div className="action-buttons">
              {/* <button
                onClick={() => {

                }} */}
              <button className="accept-button">Accept</button>
              <button className="deny-button">Deny</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
