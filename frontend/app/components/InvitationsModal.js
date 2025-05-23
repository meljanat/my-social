import "../style/InvitationsModal.css";

export default function InvitationsModal({
  invitations = [],
  onClose,
  onAccept,
  onReject,
}) {
  const hasInvitations = invitations && invitations.length > 0;

  console.log("Invitations in modal:", invitations);

  return (
    <div className="modal-overlay">
      <div className="invitation-modal-content">
        <div className="invitations-modal-header">
          <h4 className="invitations-text">Invitations</h4>
          <span className="invitations-close-btn" onClick={onClose}>
            &times;
          </span>
        </div>
        {hasInvitations ? (
          <ul className="invitations-list">
            {invitations.map((invitation) => (
              <li key={invitation.id} className="invitation-item">
                <div className="invitation-info">
                  <div className="invitation-avatar">
                    {invitation.user?.avatar && (
                      <img
                        src={invitation.user.avatar}
                        alt={`${invitation.user.username || "User"}'s avatar`}
                        className="avatar-img"
                      />
                    )}
                  </div>
                  <h3 className="invitation-text">
                    <strong>{invitation.user?.username}</strong> requested to
                    join the group
                  </h3>
                </div>
                <div className="invitation-actions">
                  <button
                    className="accept-button"
                    onClick={() =>
                      onAccept(invitation.id, invitation.user.user_id)
                    }
                  >
                    Accept
                  </button>
                  <button
                    className="decline-btn"
                    onClick={() =>
                      onReject(invitation.id, invitation.user.user_id)
                    }
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-invitations">No pending invitations</p>
        )}
      </div>
    </div>
  );
}
