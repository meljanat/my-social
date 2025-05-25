"use client";
import React, { useState, useEffect } from "react";
import "../styles/NotificationPage.css";
import NotificationCard from "../components/NotificationCard";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:8404/notifications?offset=0", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      console.log("Raw notifications from server:", data);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        "http://localhost:8404/notifications/mark_all_as_read",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to mark all as read");

      const data = await response.json();
      console.log("Rad all:", data);

      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (error) {
      console.error("Error marking notifications as read:", error.message);
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-card">
        <div className="notification-header">
          <h1 className="notification-title">Notifications
            <span className="tab-count">{notifications.length || 0}</span>
          </h1>
          <button className="mark-read-button" onClick={markAllAsRead}>
            Mark all as read
          </button>
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
