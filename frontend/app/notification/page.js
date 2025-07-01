"use client";
import React, { useState, useEffect } from "react";
import "../styles/NotificationPage.css";
import NotificationCard from "../components/NotificationCard";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import useInfiniteScroll from "../components/useInfiniteScroll";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const container = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (offset = 0) => {
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
        if (offset === 0) {
          setNotifications(data);
        } else {
          setNotifications((prev) => [...prev, ...data]);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
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
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error.message);
    }
  };

  useInfiniteScroll({
    fetchMoreCallback: async () => {
      if (!hasMoreNotifications) return;
      setIsFetchingMore(true);

      const currentLength = notifications.length;
      const newNotifications = await fetchNotifications(currentLength);

      if (newNotifications.length === 0) {
        console.log("No more notifications to fetch");
        setHasMoreNotifications(false);
      }

      setIsFetchingMore(false);
    },
    offset: notifications.length,
    isFetching: isFetchingMore,
  });

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

      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notification.notification_id
            ? { ...n, read: true }
            : n
        )
      );
      if (notification.type_notification === "invitation") {
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
    const handleScroll = () => {
      if (container.current) {
        const { scrollTop, scrollHeight, clientHeight } = container.current;
        if (scrollHeight - scrollTop <= clientHeight + 1 && !noMoreNotifs) {
          fetchNotifications(notifications.length);
        }
      }
    };

    const currentContainer = container.current;
    currentContainer.addEventListener("scroll", handleScroll);

    return () => {
      currentContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="notification-container">
      <div className="notification-card">
        <div className="notification-header">
          <h1 className="notification-title">Notifications</h1>
          <button className="mark-read-button" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>

        <div className="notification-list" ref={container}>
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
