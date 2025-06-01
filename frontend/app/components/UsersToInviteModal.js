import { useState, useEffect } from "react";
import "../styles/InviteUsersModal.css";

export default function InviteUsersModal({
  users = [],
  onClose,
  onInvite,
  groupId,
}) {
  const [localUsers, setLocalUsers] = useState(users);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleInvite = async (userId) => {
    try {
      await onInvite(userId, groupId);
      setLocalUsers(prevUsers =>
        prevUsers.filter(user => user.user_id !== userId)
      );
    } catch (err) {
      console.error("Error inviting user:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="invite-modal-content">
        <div className="invite-modal-header">
          <h4 className="invite-text">Invite Users</h4>
          <span className="invite-close-btn" onClick={onClose}>
            &times;
          </span>
        </div>

        {localUsers && localUsers.length > 0 ? (
          <ul className="users-list">
            {localUsers.map((user) => (
              <li key={user.user_id} className="user-item">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={`${user.username || "User"}'s avatar`}
                        className="avatar-img"
                      />
                    )}
                  </div>
                  <h3 className="user-text">
                    <strong>{user.username}</strong>
                  </h3>
                </div>
                <div className="user-actions">
                  <button
                    className="invite-button"
                    onClick={() => handleInvite(user.user_id)}
                  >
                    Invite
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-users">No users available to invite</p>
        )}
      </div>
    </div>
  );
}
