import React from "react";
import styles from "../styles/MemberCard.module.css";

export default function MemberCard({ member }) {
  return (
    <div className={styles.memberCard}>
      <div className={styles.memberCardContent}>
        <div className={styles.memberAvatarContainer}>
          <img
            src={member.avatar}
            alt={`${member.first_name} ${member.last_name}`}
            className={styles.memberAvatar}
          />
          {member.isAdmin && <span className={styles.adminBadge}>Admin</span>}
        </div>

        <div className={styles.memberInfo}>
          <h4 className={styles.memberName}>
            {member.first_name} {member.last_name}
          </h4>
          <p className={styles.memberUsername}>@{member.username}</p>
        </div>
      </div>

      <button
        className={styles.viewProfileButton}
        onClick={() => {
          window.location.href = `/profile?id=${member.user_id}`;
        }}
      >
        View Profile
      </button>
    </div>
  );
}
