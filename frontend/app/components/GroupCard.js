import {React, useState} from "react";
import styles from"../styles/GroupCard.module.css";
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
    <div className={styles.groupCard} onClick={onClick}>
      <div className={styles.groupCardContent}>
        <div className={styles.groupHeader}>
          <div className={styles.groupAvatar}>
            <img src={group.image} alt={group.name} />
          </div>
          <div className={styles.groupInfo}>
            <h4 className={styles.groupName}>{group.name}</h4>
            <span className={styles.groupLabel}>
              {group.created_at || "Created recently"}
            </span>
          </div>
        </div>

        <div className={styles.groupDetails}>
          <p className={styles.groupMeta}>{`${group.total_members || 0} members - ${
            group.total_posts
          } posts - ${group.privacy}`}</p>
        </div>

        <div className={styles.groupActions}>
          <button
            className={`${styles.groupJoinBtn} ${localIsJoined ? "joined" : ""}`}
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
