import React, { useState } from "react";
import styles from "../styles/InvitationCard.module.css";

export default function InvitationCard({ invitation, onAccept, onDecline }) {
  const [status, setStatus] = useState("pending");

  const handleAccept = () => {
    setStatus("accepted");
    onAccept(invitation.id);
  };

  const handleDecline = () => {
    setStatus("declined");
    onDecline(invitation.id);
  };

  if (status === "accepted" || status === "declined") {
    return null;
  }

  return (
    <div className={styles.invitationCard}>
      <div className={styles.invitationCardContent}>
        <div className={styles.invitationHeader}>
          <div className={styles.invitationAvatar}>
            <img src={invitation.user.avatar} alt={invitation.user.username} />
          </div>
          <div className={styles.invitationRequester}>
            <h4 className={styles.invitationSender}>
              @{invitation.user.username}
            </h4>
            <span className={styles.invitationLabel}>
              {invitation.created_at || "2 hours ago"}
            </span>
          </div>
        </div>

        <div className={styles.invitationGroupInfo}>
          <h3 className={styles.invitationTitle}>
            {invitation.group.name} ({invitation.group.total_members || 0}{" "}
            members)
          </h3>
        </div>

        <div className={styles.invitationActions}>
          <button className={styles.invitationAcceptBtn} onClick={handleAccept}>
            Accept
          </button>
          <button
            className={styles.invitationDeclineBtn}
            onClick={handleDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}