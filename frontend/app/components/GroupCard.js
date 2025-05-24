import React from "react";
import "../../styles/GroupsPage.css";
import { handleFollow } from "../functions/user";

export default function GroupCard({ group, onClick, isJoined }) {
  return (
    <div className="group-card" onClick={onClick}>
      <div className="group-card-content">
        <div className="group-header">
          <div className="group-avatar">
            <img src={group.image} alt={group.name} />
          </div>
          <div className="group-info">
            <h4 className="group-name">{group.name}</h4>
            <span className="group-label">
              {group.created_at || "Created recently"}
            </span>
          </div>
        </div>

        <div className="group-details">
          {/* <h3 className="group-title">{group.description}</h3> */}
          <p className="group-meta">{`${group.total_members || 0} members - ${
            group.total_posts
          } posts - ${group.privacy}`}</p>
        </div>

        <div className="group-actions">
          <button
            className={`group-join-btn ${isJoined ? "joined" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleFollow(0, group.group_id);
            }}
          >
            {group.role === "admin"
              ? "Delete Group"
              : isJoined
              ? "Leave"
              : "Join Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
