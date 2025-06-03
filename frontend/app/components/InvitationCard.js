import React, { useState } from "react";
import "../../styles/GroupsPage.css";

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
    <div className={`invitation-card`}>
      <div className="invitation-card-content">
        <div className="invitation-header">
          <div className="invitation-avatar">
            <img src={invitation.user.avatar} alt={invitation.user.username} />
          </div>
          <div className="invitation-requester">
            <h4 className="invitation-sender">@{invitation.user.username}</h4>
            <span className="invitation-label">
              {invitation.created_at || "2 hours ago"}
            </span>
          </div>
        </div>

        <div className="invitation-group-info">
          <h3 className="invitation-title">
            {invitation.group.name} ({invitation.group.total_members || 0}{" "}
            members)
          </h3>
        </div>

        <div className="invitation-actions">
          <button
            className={`invitation-accept-btn`}
            onClick={handleAccept}
          >
            Accept
          </button>
          <button
            className={`invitation-decline-btn`}
            onClick={handleDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}