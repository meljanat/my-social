import "../styles/NotificationCard.css";
export default function NotificationCard({ notification }) {
  return (
    <div className="notification-item">
      <div className="notification-content">
        {notification.unread && (
          <div className="unread-indicator-container">
            <div className="unread-indicator"></div>
          </div>
        )}

        <div className="avatar-container">
          <img src={notification.avatar} alt="" className="avatar-image" />
        </div>

        <div className="notification-text">
          <div className="notification-message">
            <span className="user-name">{notification.name}</span>{" "}
            <span className="action-text">{notification.action}</span>{" "}
            <span className="target-text">{notification.target}</span>
          </div>

          <div className="notification-time">{notification.time}</div>

          {notification.hasActions && (
            <div className="action-buttons">
              <button 
            //   onClick={() => {
                
            //   }}
              className="accept-button">Accept</button>
              <button className="deny-button">Deny</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
