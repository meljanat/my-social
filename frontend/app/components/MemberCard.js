import "../../styles/GroupsPage.css";
import React from "react";

export default function MemberCard({ member }) {
  return (
    <div className="member-card">
      <div className="member-card-content">
        <div className="member-avatar-container">
          <img
            src={member.avatar}
            alt={`${member.first_name} ${member.last_name}`}
            className="member-avatar"
          />
          {member.isAdmin && <span className="admin-badge">Admin</span>}
        </div>

        <div className="member-info">
          <h4 className="member-name">
            {member.first_name} {member.last_name}
          </h4>
          <p className="member-username">@{member.username}</p>
        </div>
      </div>

      <button
        className="view-profile-button"
        onClick={() => {
          window.location.href = `/profile/${member.user_id}`;
        }}
      >
        View Profile
      </button>
    </div>
  );
}
