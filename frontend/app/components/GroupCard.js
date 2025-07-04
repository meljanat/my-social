import {React, useState} from "react";
import styles from"../styles/GroupCard.module.css";

export default function GroupCard({
  group,
  isJoined,
  onClick,
  onAction,
  onJoin,
}) {
  const [localIsJoined, setLocalIsJoined] = useState(isJoined);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = (id) => {
    setIsProcessing(true);
    try {
      if (group.role === "admin" || onAction) {
        onAction(id);
      } else {
        onJoin(id);
      }
    } finally {
      setIsProcessing(false);
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
            onClick={(e) => {
              e.stopPropagation();
              setLocalIsJoined(!localIsJoined);
              handleAction(group.group_id);
            }}
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
