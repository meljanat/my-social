"use client";
import { useState } from "react";
import "../styles/LeftSideBar.css";
import UserCard from "./UserCard";

export default function LeftSidebar({ users, bestcategories }) {
  const safeUsers = users || [];
  const safeCategories = bestcategories || [];

  return (
    <div className="left-sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <h3>Suggested Users</h3>
          <button
            className="see-all-btn"
            onClick={() => {
              window.location.href = "/allusers";
            }}
          >
            See all <span className="arrow">→</span>
          </button>
        </div>
        {safeUsers.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No suggested users yet</p>
            {/* <p className="empty-description">
              Connect with others to see suggestions based on your network
            </p> */}
          </div>
        ) : (
          <ul className="user-list">
            {safeUsers.map((user) => (
              <UserCard key={user.user_id} user={user} action={"follow"} />
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>Popular Categories</h3>
          <button
            className="see-all-btn"
            onClick={() => {
              window.location.href = "/allcategories";
            }}
          >
            See all <span className="arrow">→</span>
          </button>
        </div>

        {safeCategories.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No categories yet</p>
            <p className="empty-description">
              Categories will appear as content is created
            </p>
          </div>
        ) : (
          <ul className="category-list">
            {safeCategories.map((category) => (
              <li key={category.category_id} className="category-item">
                <div className="category-icon">
                  <img
                    src={`/icons/${category.name}.png`}
                    alt={category.name}
                  />
                </div>
                <span className="category-name">{category.name}</span>
                <span className="category-count">
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
