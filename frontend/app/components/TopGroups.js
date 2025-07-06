"use client";
import React from "react";
import styles from "../styles/TopGroups.module.css";
import { handleFollow } from "../functions/user";

export default function TopGroups({ groups }) {
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
                onClick={() => handleFollow(0, group.group_id)}
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
