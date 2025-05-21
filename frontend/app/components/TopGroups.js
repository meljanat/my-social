"use client";
import "../styles/TopGroups.css";

export default function TopGroups({ groups }) {
  async function handleJoinGroupt(group_id) {
    try {
      const response = await fetch(`http://localhost:8404/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(parseInt(group_id)),
      });
      console.log(group_id);

      if (response.ok) {
        console.log("Joined group successfully");
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="top-groups">
      <div className="section-header">
        <h3>Suggested Groups</h3>
        <button className="see-all-btn">
          <a href="/groups">
            See all <span className="arrow">→</span>
          </a>
        </button>
      </div>

      {groups?.length === 0 || groups == null ? (
        <div className="empty-state">
          <p className="empty-title">No suggested groups yet</p>
        </div>
      ) : (
        <ul className="group-list">
          {groups?.map((group) => (
            <li key={group.group_id} className="group-item">
              <div className="group-image">
                <img
                  src={group.image || "/images/default-group.png"}
                  alt={group.name}
                />
              </div>
              <div className="group-info">
                <span className="group-name">{group.name}</span>
                <span className="group-members">
                  {group.total_members || 0} members
                </span>
              </div>
              <button
                className="join-button"
                onClick={() => handleJoinGroupt(group.group_id)}
              >
                Join
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
