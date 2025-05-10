"use client";
import React, { useState } from "react";
import "../styles/NotificationPage.css";
import NotificationCard from "../components/NotificationCard";

export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState("all");
  const notifications = [
    {
      type: "request",
      avatar: "./avatars/lionel-messi_imago1019567000h.jpg",
      name: "Amine Dinani",
      action: "wants to follow",
      target: "your profile",
      time: "5 min ago",
      hasActions: true,
      unread: true,
    },
    {
      type: "like",
      avatar: "./avatars/lionel-messi_imago1019567000h.jpg",
      name: "Amine Dinani",
      action: "liked",
      target: "your post",
      time: "46 min ago",
      hasActions: true,
      unread: true,
    },
    {
        type: "request",
        avatar: "./avatars/lionel-messi_imago1019567000h.jpg",
        name: "Amine Dinani",
        action: "liked",
        target: "your post",
        time: "46 min ago",
        hasActions: true,
        unread: false,
      },
  ];

  return (
    <div className="notification-container">
      <div className="notification-card">
        <div className="notification-header">
          <h1 className="notification-title">Notifications</h1>
          <button className="mark-read-button">Mark all as read</button>
        </div>

        <div className="tabs-container">
          <TabButton
            label="All"
            count={2}
            isActive={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          />
          <TabButton
            label="Read"
            isActive={activeTab === "read-notification"}
            onClick={() => setActiveTab("read-notification")}
          />
          <TabButton
            label="Not read"
            isActive={activeTab === "not-read-notification"}
            onClick={() => setActiveTab("not-read-notification")}
          />
        </div>

        <div className="notification-list">
          {notifications.map((notification, index) => (
            <NotificationCard key={index} notification={notification} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, count, isActive, onClick }) {
  return (
    <button
      className={`tab-button ${isActive ? "tab-active" : ""}`}
      onClick={onClick}
    >
      <div className="tab-content">
        {label}
        {count && <span className="tab-count">{count}</span>}
      </div>
      {isActive && <div className="tab-indicator"></div>}
    </button>
  );
}
