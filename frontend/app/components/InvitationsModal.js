  import styles from "../style/InvitationsModal.module.css";
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
      <div className={styles.modalOverlay}>
        <div className={styles.invitationModalContent}>
          <div className={styles.invitationsModalHeader}>
            <h4 className={styles.invitationsText}>Invitations</h4>
            <span className={styles.invitationsCloseBtn} onClick={onClose}>
              &times;
            </span>
          </div>
          {hasInvitations ? (
            <ul className={styles.invitationsList}>
              {invit.map((invitation) => (
                <li
                  key={invitation.invitation_id}
                  className={styles.invitationItem}
                >
                  <div className={styles.invitationInfo}>
                    <div className={styles.invitationAvatar}>
                      {invitation.user?.avatar && (
                        <img
                          src={invitation.user.avatar}
                          alt={`${invitation.user.username || "User"}'s avatar`}
                          className={styles.avatarImg}
                        />
                      )}
                    </div>
                    <h3 className={styles.invitationText}>
                      <strong>{invitation.user?.username}</strong> requested to
                      join the group
                    </h3>
                  </div>
                  <div className={styles.invitationActions}>
                    <button
                      className={styles.acceptButton}
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
                      className={styles.declineBtn}
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
            <p className={styles.noInvitations}>No pending invitations</p>
          )}
        </div>
      </div>
    );
  }
