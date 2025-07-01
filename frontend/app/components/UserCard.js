import { useState } from "react";
import { handleFollow } from "../functions/user";
import styles from "../styles/UserCard.module.css";

export default function UserCard({ user, action, onClick }) {
  const [newStatus, setNewStatus] = useState("Follow");

  return (
    <li className={styles.userItem} onClick={onClick}>
      <img
        className={styles.userAvatar}
        src={user.avatar || user.image}
        alt={user.username || user.name}
      />
      <div className={styles.userDetails}>
        <div
          className={styles.userInfo}
          onClick={() => {
            window.location.href = `/profile?id=${user.user_id}`;
          }}
        >
          <h4 className={styles.userName}>
            {user.first_name
              ? `${user.first_name} ${user.last_name}`
              : user.name}
          </h4>
          <p className={styles.userUsername}>
            {user.username
              ? `@${user.username}`
              : `(${user.total_members}) Members`}
          </p>
        </div>

        {action === "follow" && (
          <button
            onClick={() => {
              setNewStatus(handleFollow(user.user_id, 0));
            }}
            className={`${styles.followBtn} ${styles[newStatus]}`}
          >
            {newStatus}
          </button>
        )}
      </div>
    </li>
  );
}
