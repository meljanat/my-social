import "../styles/ChatContact.css";
const ChatContact = ({ user, onClick, isOnline = false }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="chat-contact" onClick={onClick}>
      <div className="chat-contact-avatar-container">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="chat-contact-avatar"
          />
        ) : (
          <div className="chat-contact-avatar-fallback">
            {`${user.first_name} ${user.last_name}`}
          </div>
        )}
        <div
          className={`status-indicator ${isOnline ? "online" : "offline"}`}
        />
      </div>

      <div className="chat-contact-info">
        <div className="chat-contact-primary">
          <h4 className="chat-contact-name">
            {user.first_name} {user.last_name}
          </h4>
          {user.unread_count > 0 && (
            <span className="unread-badge">{user.unread_count}</span>
          )}
        </div>
        <div className="chat-contact-secondary">
          <p className="chat-contact-username">@{user.username}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatContact;
