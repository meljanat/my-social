// import "../styles/ChatContact.css";
import styles from "../styles/ChatContact.module.css";

const ChatContact = ({ user, onClick, isOnline = false }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className={styles.chatContact} onClick={onClick}>
      <div className={styles.chatContactAvatarContainer}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className={styles.chatContactAvatar}
          />
        ) : (
          <div className={styles.chatContactAvatarFallback}>
            {`${user.first_name} ${user.last_name}`}
          </div>
        )}
        <div
          className={`${styles.statusIndicator} ${isOnline ? "online" : "offline"}`}
        />
      </div>

      <div className={styles.chatContactInfo}>
        <div className={styles.chatContactPrimary}>
          <h4 className={styles.chatContactName}>
            {user.first_name} {user.last_name}
          </h4>
          {user.unread_count > 0 && (
            <span className={styles.unreadBadge}>{user.unread_count}</span>
          )}
        </div>
        <div className={styles.chatContactSecondary}>
          <p className={styles.chatContactUsername}>@{user.username}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatContact;
