"use client";
import React, { useState } from "react"; 
import styles from "../styles/RemoveGroupModal.module.css"; 
import { handleFollow } from "../functions/user"; 

export default function RemoveGroupModal({ group, onClose, onRemove, action }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemoveGroup = async () => {
    setIsProcessing(true);

    try {
      await handleFollow(group.admin_id, group.group_id);

      if (onRemove) {
        onRemove(group.group_id); 
      }
      onClose(); 
    } catch (error) {
      console.error(`Error ${action}ing group:`, error);
    } finally {
      setIsProcessing(false); 
    }
  };

  return (
    <div className={styles.modalOverlay}>
      {" "}
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2>{action === "remove" ? "Remove Group" : "Leave Group"}</h2>
        <p>{`Are you sure you want to ${action} the group "${group.name}"?`}</p>
        <div className={styles.modalActions}>
          <button
            onClick={handleRemoveGroup}
            className={`${styles.actionButton} ${
              action === "remove" ? styles.removeButton : styles.leaveButton
            }`}
            disabled={isProcessing} 
          >
            {isProcessing
              ? "Processing..."
              : action === "remove"
              ? "Remove Group"
              : "Leave Group"}
          </button>
          <button
            onClick={onClose}
            className={`${styles.actionButton} ${styles.cancelButton}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
