import "../styles/NotificationCard.css";

export default function NotificationCard({ notification }) {
  console.log(notification);

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
                ? " requested to follow you"
                : notification.type_notification === "like"
                ? " liked your post"
                : notification.type_notification === "comment"
                ? "commented on your post"
                : notification.type_notification === "event"
                ? " invited you to an event"
                : " accepted your request"}
            </span>
          </div>

          <div className="notification-time">{notification.created_at}</div>

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
