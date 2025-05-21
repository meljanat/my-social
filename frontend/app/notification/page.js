"use client";
import React, { useState, useEffect } from "react";
import "../styles/NotificationPage.css";
import NotificationCard from "../components/NotificationCard";
import Navbar from "../components/NavBar";

export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [homeData, setHomeData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationse = [
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

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:8404/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data === true) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        setError(true);
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:8404/notifications", {
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
    //setNotifications((prev) => [data, ...prev]);

    //connectSocket();
    //if (data.type === "notification") {
    //console.log("aaaaa");

    //}
    //subscribeToMessages((data) => {
    //});
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchHomeData();
    }
  }, [isLoggedIn]);

  const fetchHomeData = async () => {
    try {
      const response = await fetch("http://localhost:8404/home", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setHomeData(data);
        setPosts(data.posts);
        //console.log("Data received: ", data);
      }
    } catch (error) {
      setError(true);

      console.error("Error fetching posts:", error);
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-card">
        {homeData && <Navbar user={homeData.user} />}
        <div className="notification-header">
          <h1 className="notification-title">Notifications</h1>
          <button className="mark-read-button" onClick={markAllAsRead}>
            Mark all as read
          </button>
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
