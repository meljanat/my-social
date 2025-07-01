"use client";
import React from "react"; 
import styles from "../styles/TopGroups.module.css"; 

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
      } else {
        console.error("Failed to join the group.");
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  }
  return (
    <div className={styles.topGroups}>
      <div className={styles.sectionHeader}>
        <h3>Suggested Groups</h3>
        <button className={styles.seeAllBtn}>
          <a href="/groups">
            See all <span className={styles.arrow}>→</span>
          </a>
        </button>
      </div>

      {groups?.length === 0 || groups == null ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No suggested groups yet</p>
        </div>
      ) : (
        <ul className={styles.groupList}>
          {groups?.map((group) => (
            <li key={group.group_id} className={styles.groupItem}>
              <div className={styles.groupImage}>
                <img
                  src={group.image || "/images/default-group.png"}
                  alt={group.name}
                />
              </div>
              <div className={styles.groupInfo}>
                <span className={styles.groupName}>{group.name}</span>
                <span className={styles.groupMembers}>
                  {group.total_members || 0} members
                </span>
              </div>
              <button
                className={styles.joinButton}
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
