import "../style/InvitationsModal.css";
import { useEffect, useState } from "react";

export default function InvitationsModal({
  invitations = [],
  onClose,
  onAccept,
  onReject,
}) {
  const hasInvitations = invitations && invitations.length > 0;
  const [invit, setInvit] = useState([]);

  useEffect(() => {
    const showInvit = () => {
      setInvit(invitations);
    };
    showInvit();
  }, [invitations]);
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
            {invit.map((invitation) => (
              <li key={invitation.invitation_id} className="invitation-item">
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
                    onClick={() => {
                      onAccept(
                        invitation.user.user_id,
                        invitation.group.group_id
                      );
                      setInvit(
                        invit.filter(
                          (el) => el.invitation_id != invitation.invitation_id
                        )
                      );
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-btn"
                    onClick={() => {
                      onReject(
                        invitation.user.user_id,
                        invitation.group.group_id
                      );
                      setInvit(
                        invit.filter(
                          (el) => el.invitation_id != invitation.invitation_id
                        )
                      );
                    }}
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
