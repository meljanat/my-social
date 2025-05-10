"use client";
import "../styles/SuggestedCommunities.css";

export default function SuggestedCommunities() {
  return (
    <div className="suggested-communities">
      <h3>Community</h3>
      <ul className="community-list">
        {communities.map((community) => (
          <li key={community.id} className="community-item">
            <img
              src={community.avatar}
              alt={community.name}
              className="avatar"
            />
            <span className="community-name">{community.name}</span>
          </li>
        ))}
      </ul>
      <button className="view-more-btn">View more</button>
    </div>
  );
}
