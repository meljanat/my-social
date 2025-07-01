"use client";
import React, { useState, useEffect, useRef } from "react";
import "../styles/Notifications.css";
import NotificationCard from "../components/NotificationCard";
import { useRouter } from "next/navigation";

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [notificationType, setNotificationType] = useState("all");
  const [loading, setLoading] = useState(true);
  const notificationRef = useRef(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8404/notifications?offset=0`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        "http://localhost:8404/mark_notifications_as_read",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to mark all as read");

      console.log(notifications);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      console.log(notifications);
    } catch (error) {
      console.error("Error marking notifications as read:", error.message);
    }
  };

  const markAsRead = async (notification) => {
    try {
      const response = await fetch(`http://localhost:8404/read_notification?id=${notification.notification_id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to mark notification as read");

      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notification.notification_id
            ? { ...n, read: true }
            : n
        )
      );
      if (notification.type_notification === "follow_request"
        ||notification.type_notification === "follow"
      ) {
        router.push('/profile?id=' + notification.user_id);
      } else if (notification.type_notification === "like" ||
        notification.type_notification === "comment" ||
        notification.type_notification === "save") {
        router.push('/post?id=' + notification.post_id);
      } else if (notification.type_notification === "event") {
        router.push('/event?id=' + notification.event_id);
      } else if (notification.type_notification === "group" ||
        notification.type_notification === "join_request") {
        router.push('/group?id=' + notification.group_id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications?.filter((notification) => {
    if (notificationType === "all") return true;
    return !notification.read;
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
          filteredNotifications.slice(0, 5).map((notification) => (
            <NotificationCard
              key={notification.notification_id}
              notification={notification}
              onClick={() => {
                markAsRead(notification);
              }}
            />
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
