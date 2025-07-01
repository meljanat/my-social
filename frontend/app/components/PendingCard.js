import React, { useState } from "react";
import styles from "../styles/PendingGroupRequestCard.module.css";
import { handleFollow } from "../functions/user";

export default function PendingGroupRequestCard({ group, onClick, onCancel }) {
  const [isRemoved, setIsRemoved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = async (e) => {
    e.stopPropagation();
    setIsProcessing(true);

    try {
      await handleFollow(group.admin_id, group.group_id);
      setIsRemoved(true);
      if (onCancel) {
        onCancel(group.group_id);
      }
    } catch (error) {
      console.error("Error canceling group request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isRemoved) {
    return null;
  }

  return (
    <div className={styles.pendingGroupCard} onClick={onClick}>
      <div className={styles.pendingGroupContent}>
        <div className={styles.pendingGroupHeader}>
          <div className={styles.pendingGroupInfo}>
            <img
              src={group.image || "/inconnu/group-placeholder.png"}
              alt={group.name}
              className={styles.pendingGroupAvatar}
            />

            <div className={styles.pendingGroupName}>
              <h3>{group.name}</h3>
              <div className={styles.pendingGroupStatus}>
                <span>Request Pending</span>
                <div>
                  <button
                    onClick={handleCancel}
                    className={styles.pendingGroupCancelBtn}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Canceling..." : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {group.description && (
          <p className={styles.pendingGroupDescription}>{group.description}</p>
        )}

        <div className={styles.pendingGroupStats}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="14"
                height="14"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span className={styles.statLabel}>{group.total_members || 1}</span>
            <span className={styles.statText}>members</span>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="14"
                height="14"
              >
                <path
                  fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                  clipRule="evenodd"
                />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
              </svg>
            </div>
            <span className={styles.statLabel}>{group.total_posts || 0}</span>
            <span className={styles.statText}>posts</span>
          </div>
        </div>

        <div className={styles.pendingGroupRequestDate}>
          Requested on {group.created_at || "2 hours ago"}
        </div>
      </div>
    </div>
  );
}
