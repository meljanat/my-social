"use client";
import React, { useState, useEffect } from "react";
import "../styles/NotificationPage.css";
import NotificationCard from "../components/NotificationCard";
import { useRouter } from "next/navigation";

export default function NotificationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isFetchingMore, setIsFetchingMore] = useState(true);
  const router = useRouter();

  const handleScroll = () => {
    if (window.scrollY >= window.innerHeight * .7 &&
      window.scrollY <= window.innerHeight * .7 + 50 &&
      notifications.length % 20 === 0 && isFetchingMore) {
      fetchNotifications(notifications.length);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!isFetchingMore && notifications.length % 20 != 0) return;


    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [notifications]);

  const fetchNotifications = async (offset = 0) => {
    if (notifications.length % 20 != 0) return;
    try {
      const response = await fetch(
        `http://localhost:8404/notifications?offset=${offset}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();

      if (Array.isArray(data)) {
        if (data.length < 20) {
          setIsFetchingMore(false);
        }
        if (offset === 0) {
          setNotifications(data);
        } else {
          setNotifications((prev) => [...prev, ...data]);
          console.log("Fetched more notifications:", data);

        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setIsLoading(false);
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
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error.message);
    }
  };

  const markAsRead = async (notification) => {
    try {
      const response = await fetch(
        `http://localhost:8404/read_notification?id=${notification.notification_id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to mark notification as read");

      fetchNotifications();
      if (
        notification.type_notification === "follow" ||
        notification.type_notification === "follow_request"
      ) {
        router.push('/profile?id=' + notification.user_id);
      } else if (
        notification.type_notification === "like" ||
        notification.type_notification === "comment" ||
        notification.type_notification === "save"
      ) {
        router.push('/post?id=' + notification.post_id);
      } else if (
        notification.type_notification === "event"
      ) {
        router.push('/event?id=' + notification.event_id);
      } else if (
        notification.type_notification === "group" ||
        notification.type_notification === "join_request" ||
        notification.type_notification === "join"
      ) {
        router.push('/group?id=' + notification.group_id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="loadingContainer">
        <div className="loadingSpinner"></div>
        <p className="loadingText">Loading...</p>
      </div>
    );
  }

  return (
    <div className="notification-container">
      <div className="notification-card">
        <div className="notification-header">
          <h1 className="notification-title">Notifications</h1>
          <button className="mark-read-button" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>

        <div className="notification-list">
          {notifications.length
            ? notifications.map((notification) => (
              <NotificationCard
                key={notification.notification_id}
                notification={notification}
                onClick={() => markAsRead(notification)}
              />
            ))
            : ""}
        </div>
      </div>
    </div>
  );
}
