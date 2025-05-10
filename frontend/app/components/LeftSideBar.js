"use client";
import { useState } from "react";
import "../styles/LeftSideBar.css";
import UserCard from "./UserCard";

export default function LeftSidebar({ users, bestcategories }) {
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

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
        {users.length === 0 && (
          <div className="no-users">
            <p>No users found</p>
          </div>
        )}
        <ul className="user-list">
          {users.map((user) => (
            // <a key={user.id} href={`/profile/${user.id}`} className="user-link">
            <UserCard key={user.id} user={user} action={"follow"} />
            // </a>

            // <li key={user.id} className="user-item">
            //   <img
            //     src={
            //       user.avatar ||
            //       "./avatars/thorfinn-vinland-saga-episode-23-1.png"
            //     }
            //     className="user-avatar"
            //     alt={user.username}
            //   />
            //   <div className="user-details">
            //     <div className="user-info">
            //       <h4 className="user-name">{`${user.first_name} ${user.last_name}`}</h4>
            //       <p className="user-username">@{user.username}</p>
            //     </div>
            //     <button
            //       className="follow-btn"
            //       onClick={() => handleFollow(user.id)}
            //     >
            //       Follow
            //     </button>
            //   </div>
            // </li>
          ))}
        </ul>
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

        <ul className="category-list">
          {bestcategories.length === 0 && (
            <div className="no-categories">
              <p>No categories found</p>
            </div>
          )}
          {bestcategories.map((category) => (
            <li key={category.id} className="category-item">
              <div className="category-icon">
                <img src={`/icons/${category.name}.png`} alt={category.name} />
              </div>
              <span className="category-name">{category.name}</span>
              <span className="category-count">
                {category.count || 0} posts
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
