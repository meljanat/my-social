"use client";
import "../styles/NotificationCard.css";

export default function NotificationCard({ notification, onClick }) {
  return (
    <div className="notification-item" onClick={onClick}>
      <div className="notification-content">
        {!notification.read && (
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
              {` ${notification.notification_message}`}
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
