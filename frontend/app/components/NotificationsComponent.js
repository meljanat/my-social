"use client";
import React, { useState, useEffect, useRef } from "react";
import "../styles/Notifications.css";
import NotificationCard from "../components/NotificationCard";
import { addToListeners, removeFromListeners } from "../websocket/ws.js";

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [notificationType, setNotificationType] = useState("all");
  const [loading, setLoading] = useState(true);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8404/notifications?offset=0", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      console.log("Raw notifications from server:", data);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log(notifications);


  useEffect(() => {
    const handleNotifications = (msg) => {
      if (msg.type === 'notifications') {
        console.log("Received notifications:", msg.notifications);

        setNotifications(msg.notifications);
        console.log("Received notifications:", msg.notifications);

      }
    };

    addToListeners('notifications', handleNotifications);

    return () => {
      removeFromListeners('notifications', handleNotifications);
    };
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

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications?.filter((notification) => {
    if (notificationType === "all") return true;
    return notification.read;
  });

  return (
    <div className="notifications-dropdown" ref={notificationRef}>
      <div className="notifications-header">
        <h3>Notifications</h3>
        <div className="notifications-actions">
          <button onClick={markAllAsRead} className="mark-read-btn">
            Mark all read
          </button>
          <a href="/notification" className="see-all-btn">
            See all <span className="arrow">→</span>
          </a>
        </div>
      </div>

      <div className="notification-tabs">
        <button
          onClick={() => setNotificationType("all")}
          className={notificationType === "all" ? "active" : ""}
        >
          All
        </button>
        <button
          onClick={() => setNotificationType("not-read")}
          className={notificationType === "not-read" ? "active" : ""}
        >
          Not Read
        </button>
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications
            .slice(0, 5)
            .map((notification, idx) => (
              <NotificationCard key={idx} notification={notification} />
            ))
        ) : (
          <div className="empty-notifications">
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsComponent;
