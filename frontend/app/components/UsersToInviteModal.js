import "../styles/InviteUsersModal.css";

export default function InviteUsersModal({
  users = [],
  onClose,
  onInvite,
  groupId,
}) {
  const hasUsers = users && users.length > 0;

  console.log("Users to invite:", users);

  return (
    <div className="modal-overlay">
      <div className="invite-modal-content">
        <div className="invite-modal-header">
          <h4 className="invite-text">Invite Users</h4>
          <span className="invite-close-btn" onClick={onClose}>
            &times;
          </span>
        </div>
        {hasUsers ? (
          <ul className="users-list">
            {users.map((user) => (
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
                    onClick={() => onInvite(user.user_id, groupId)}
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
