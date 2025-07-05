"use client";
import React from "react";
import styles from "../styles/RemoveGroupModal.module.css";

export default function RemoveGroupModal({ group, onClose, onRemove, onLeave, action }) {
  function handleGroupAction() {
    if (action === "remove") {
      onRemove(group.group_id);
    } else if (action === "leave") {
      onLeave(group.group_id);
    }
    onClose();
  }

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
            onClick={() => handleGroupAction()}
            className={`${styles.actionButton} ${action === "remove" ? styles.removeButton : styles.leaveButton
              }`}
          >
            {action === "remove"
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
