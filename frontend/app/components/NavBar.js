"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "../styles/NavBar.css";
import NotificationsComponent from "./NotificationsComponent";
import { addToListeners, removeFromListeners } from "../websocket/ws";

export default function Navbar() {
  const [activeLink, setActiveLink] = useState("home");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8404/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.error) {
            console.log(data.error);
          } else {
            setUser(data);
            console.log(data);

          }
        } else {
          console.log("User not logged in");
        }
      }
      catch (error) {
        console.log("Failed to fetch user data:", error);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const handleNotifications = (msg) => {
      if (msg.type === 'notifications') {
        setUser((prevUser) => ({
          ...prevUser,
          total_notifications: prevUser.total_notifications + 1,
        }));
        console.log("Received notifications:", msg);
      }
    };

    addToListeners('notifications', handleNotifications);

    return () => {
      removeFromListeners('notifications', handleNotifications);
    };
  }, []);

  if (!user) {
    return null;
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8404/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <img src="./icons/logo.svg" alt="Logo" />
        </div>

        <div className="nav-links">
          <button
            className={`nav-link ${activeLink === "home" ? "active" : ""}`}
            onClick={() => setActiveLink("home")}
          >
            <Link href="/">
              <img src="./icons/home.svg" alt="Home" />
              <span>Home</span>
            </Link>
          </button>

          <button
            className={`nav-link ${activeLink === "groups" ? "active" : ""}`}
            onClick={() => setActiveLink("groups")}
          >
            <Link href="/groups">
              <img src="./icons/groups.svg" alt="Groups" />
              <span>Groups</span>
            </Link>
          </button>

          <button
            className={`nav-link ${activeLink === "events" ? "active" : ""}`}
            onClick={() => setActiveLink("events")}
          >
            <Link href="/Events">
              <img src="./icons/events.svg" alt="Events" />
              <span>Events</span>
            </Link>
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-container">
          <img src="./icons/search.svg" alt="Search" className="search-icon" />
          <input type="text" placeholder="Search users and groups" />
        </div>
      </div>

      <div className="user-actions">
        <button className="notification-button" onClick={toggleNotifications}>
          <img src="./icons/notification.svg" alt="Notifications" />
          {user.total_notifications > 0 ? (
            <span className="badge">{user.total_notifications || 1}</span>
          ) : (
            <span className="notification-count">0</span>
          )}
        </button>

        {showNotifications && <NotificationsComponent />}

        <button className="action-icon message-badge">
          <Link href="/messages">
            <img src="./icons/message.svg" alt="Messages" />
            {user.messages > 0 && (
              <span className="badge">{user.messages || 3}</span>
            )}
          </Link>
        </button>

        <div className="profile-dropdown">
          <button className="profile-button" onClick={toggleProfileMenu}>
            <img
              src={user.avatar}
              alt={user.username || "User"}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{`${user.first_name} ${user.last_name}`}</span>
              <span className="user-username">
                @{user.username || "username"}
              </span>
            </div>
            <img
              src="./icons/drop-down.svg"
              alt="Menu"
              className={`dropdown-icon ${showProfileMenu ? "rotate" : ""}`}
            />
          </button>

          {showProfileMenu && (
            <div className="profile-menu">
              <a href={`/profile/${user.user_id}`} className="menu-item">
                <img src="./icons/user.svg" alt="Profile" />
                <span>My Profile</span>
              </a>
              <button onClick={handleLogout} className="menu-item logout-item">
                <img src="./icons/logout.svg" alt="Logout" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
