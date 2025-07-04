"use client";
import { useState, useEffect } from "react";
import styles from "../styles/ProfileCard.module.css";

import GroupFormModal from "./GroupFromModal";
import EventFormModal from "./EventFormModal";
import PostFormModal from "./PostFormModal";

export default function ProfileCard({ user, onPostCreated, my_groups }) {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showGroupForm, setShowGroup] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [groups, setGroups] = useState([]);
  // const [audience, setAudience] = useState([]);

  function handleCreatePost() {
    setShowPostForm(true);
  }
  function handleCreateGroup() {
    setShowGroup(true);
  }
  function handleCreateEvent() {
    setShowEventForm(true);
  }

  const handleGroupCreated = (newGroup) => {
    setGroups((prevGroups) => [newGroup, ...prevGroups]);
  };

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileCover}>
        <img
          src={user.cover || user.avatar}
          alt="Cover"
          className={styles.coverImage}
        />
        <div className={styles.profileAvatar}>
          <img src={user.avatar} alt={user.username} />
        </div>
      </div>

      <div className={styles.profileInfo}>
        <a href={`/profile?id=${user.user_id}`} className={styles.profileLink}>
          <h2
            className={styles.profileName}
          >{`${user.first_name} ${user.last_name}`}</h2>
        </a>
        <p className={styles.profileUsername}>@{user.username || "username"}</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{user.total_followers}</div>
            <div className={styles.statLabel}>Followers</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{user.total_following}</div>
            <div className={styles.statLabel}>Following</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{user.total_posts}</div>
            <div className={styles.statLabel}>Posts</div>
          </div>
        </div>

        <div className={styles.profileActions}>
          <button
            onClick={handleCreatePost}
            className={`${styles.actionBtn} ${styles.primaryButton}`}
          >
            <img src="/icons/create.svg" alt="" />
            <span>Create post</span>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.secondaryButton}`}
            onClick={handleCreateGroup}
          >
            {/* <img src="/icons/create.svg" alt="" /> */}
            <span>Create group</span>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.secondaryButton}`}
            onClick={handleCreateEvent}
          >
            {/* <img src="/icons/create.svg" alt="" /> */}
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {showPostForm && (
        <PostFormModal
          onClose={() => setShowPostForm(false)}
          user={user}
          onPostCreated={onPostCreated}
        />
      )}
      {showGroupForm && (
        <GroupFormModal
          onClose={() => setShowGroup(false)}
          user={user}
          onGroupCreated={handleGroupCreated}
        />
      )}
      {showEventForm && (
        <EventFormModal
          onClose={() => setShowEventForm(false)}
          user={user}
          my_groups={my_groups}
        />
      )}
    </div>
  );
}
