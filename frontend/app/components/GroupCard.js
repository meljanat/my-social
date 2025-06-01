import {React, useState} from "react";
import "../../styles/GroupsPage.css";
import { handleFollow } from "../functions/user";

export default function GroupCard({
  group,
  onClick,
  isJoined,
  onDelete,
  onJoin,
  onLeave,
}) {
  const [localIsJoined, setLocalIsJoined] = useState(isJoined);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);

    try {
      if (group.role === "admin") {
        await handleDelete(e);
      } else if (localIsJoined) {
        await handleLeave(e);
      } else {
        await handleJoin(e);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await handleFollow(0, group.group_id);
      onDelete?.(group.group_id);
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleJoin = async (e) => {
    e.stopPropagation();
    try {
      await handleFollow(0, group.group_id);
      setLocalIsJoined(true);
      onJoin?.(group);
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleLeave = async (e) => {
    e.stopPropagation();
    try {
      await handleFollow(0, group.group_id);
      setLocalIsJoined(false);
      onLeave?.(group);
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

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
          <p className="group-meta">{`${group.total_members || 0} members - ${
            group.total_posts
          } posts - ${group.privacy}`}</p>
        </div>

        <div className="group-actions">
          <button
            className={`group-join-btn ${localIsJoined ? "joined" : ""}`}
            onClick={handleAction}
            disabled={isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : group.role === "admin" ? (
              "Delete Group"
            ) : localIsJoined ? (
              "Leave"
            ) : (
              "Join Group"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
