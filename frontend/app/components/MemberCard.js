import "../../styles/GroupsPage.css";

export default function MemberCard({ member }) {
  return (
    <div className="member-card">
      <img
        src={member.avatar}
        alt={member.username}
        className="member-avatar"
      />
      <div className="member-info">
        <h4>
          {member.first_name} {member.last_name}
        </h4>
        <p>@{member.username}</p>
      </div>
      {member.isAdmin && <span className="admin-badge">Admin</span>}
    </div>
  );
}
