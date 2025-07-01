"use client";
import { useState } from "react";
import styles from "../styles/LeftSideBar.module.css";
import UserCard from "./UserCard";

export default function LeftSidebar({ users, bestcategories }) {
  const safeUsers = users || [];
  const safeCategories = bestcategories || [];

  return (
    <div className={styles.leftSidebar}>
      <div className={styles.sidebarSection}>
        <div className={styles.sectionHeader}>
          <h3>Suggested Users</h3>
          <button
            className={styles.seeAllBtn}
            onClick={() => {
              window.location.href = "/allusers";
            }}
          >
            See all <span className={styles.arrow}>→</span>
          </button>
        </div>
        {safeUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No suggested users yet</p>
          </div>
        ) : (
          <ul className={styles.userList}>
            {safeUsers.map((user) => (
              <UserCard key={user.user_id} user={user} action={"follow"} />
            ))}
          </ul>
        )}
      </div>

      <div className={styles.sidebarSection}>
        <div className={styles.sectionHeader}>
          <h3>Popular Categories</h3>
          <button
            className={styles.seeAllBtn}
            onClick={() => {
              window.location.href = "/allcategories";
            }}
          >
            See all <span className={styles.arrow}>→</span>
          </button>
        </div>

        {safeCategories.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No categories yet</p>
            <p className={styles.emptyDescription}>
              Categories will appear as content is created
            </p>
          </div>
        ) : (
          <ul className={styles.categoryList}>
            {safeCategories.map((category) => (
              <li key={category.category_id} className={styles.categoryItem}>
                <div className={styles.categoryIcon}>
                  <img
                    src={`/icons/${category.name}.png`}
                    alt={category.name}
                  />
                </div>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryCount}>
                  {category.count || 0} posts
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
