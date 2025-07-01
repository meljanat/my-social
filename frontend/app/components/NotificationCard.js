"use client";
import styles from "../styles/NotificationCard.module.css";

export default function NotificationCard({ notification, onClick }) {
  console.log("NotificationCard props:", notification, onClick);

  return (
    <div className={styles.notificationItem} onClick={onClick}>
      <div className={styles.notificationContent}>
        {!notification.read && (
          <div className={styles.unreadIndicatorContainer}>
            <div className={styles.unreadIndicator}></div>
          </div>
        )}

        <div className={styles.avatarContainer}>
          <img
            src={notification.avatar}
            alt={notification.username}
            className={styles.avatarImage}
          />
        </div>

        <div className={styles.notificationText}>
          <div className={styles.notificationMessage}>
            <span className={styles.userName}>{notification.username}</span>
            <span className={styles.actionText}>
              {` ${notification.notification_message}`}
            </span>
          </div>

          <div className={styles.notificationTime}>
            {notification.created_at}
          </div>

          {notification.hasActions && (
            <div className={styles.actionButtons}>
              <button className={styles.acceptButton}>Accept</button>
              <button className={styles.denyButton}>Deny</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
