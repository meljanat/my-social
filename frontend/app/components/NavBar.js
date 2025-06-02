"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "../styles/NavBar.css";
import NotificationsComponent from "./NotificationsComponent";
import SuggestionCard from "./SuggestionCard";
import { addToListeners, removeFromListeners } from "../websocket/ws";

export default function Navbar() {
  const [activeLink, setActiveLink] = useState("home");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [activeSugTab, setActiveSugTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState(null);
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
            throw new Error(data.error);
          }
          setUser(data);
        } else {
          throw new Error("Failed to fetch user data");
        }
      }
      catch (error) {
        console.log("Failed to fetch user data:", error);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const handleNotifications = (msg) => {
      if (msg.type === 'notifications') {
        setUser((prevUser) => ({
          ...prevUser,
          total_notifications: prevUser.total_notifications + 1,
        }));
        console.log("Received notifications:", msg);
      }
    };

    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".profile-dropdown") &&
        !event.target.closest(".search-input-container") &&
        !event.target.closest(".notification-button")
      ) {
        setShowProfileMenu(false);
        setShowSearchSuggestions(false);
        setShowNotifications(false);
      }
    };

    addToListeners('notifications', handleNotifications);
    document.addEventListener("click", handleClickOutside);

    return () => {
      removeFromListeners('notifications', handleNotifications);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async () => {
    const offset = 0;
    try {
      const response = await fetch(`http://localhost:8404/search?query=${searchQuery}&offset=${offset}&type=${activeSugTab}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();

      console.log(data);

      if (data.error) {
        throw new Error("Failed to fetch suggestions", data.error);
      }

      setSuggestions((prevSuggestions) => {
        const newSuggestions = data;
        if (prevSuggestions) {
          return {
            ...prevSuggestions,
            users: [...(prevSuggestions.users || []), ...(newSuggestions.users || [])],
            groups: [...(prevSuggestions.groups || []), ...(newSuggestions.groups || [])],
            events: [...(prevSuggestions.events || []), ...(newSuggestions.events || [])],
            posts: [...(prevSuggestions.posts || []), ...(newSuggestions.posts || [])],
          };
        }
        return newSuggestions;
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }

  useEffect(() => {
    if (!user) return;
    setSuggestions([]);
    fetchSuggestions();
  }, [searchQuery, activeSugTab]);

  if (!user) {
    return null;
  }

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
    setShowNotifications(false);
    setShowSearchSuggestions(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
    setShowSearchSuggestions(false);
  };

  const toggleSearchSuggestions = () => {
    setShowSearchSuggestions(true);
    setShowProfileMenu(false);
    setShowNotifications(false);
  }

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
        <div className="search-input-container" onClick={toggleSearchSuggestions}>
          <img src="./icons/search.svg" alt="Search" className="search-icon" />
          <input type="text" placeholder="What's on your mind?" onChange={(e) => setSearchQuery(e.target.value)} />
          {showSearchSuggestions && (
            <div className="search-suggestions">
              <div className="nav-links">
                <button className={`nav-link ${activeSugTab === "all" ? "active" : ""}`} onClick={() => setActiveSugTab("all")}>All</button>
                <button className={`nav-link ${activeSugTab === "users" ? "active" : ""}`} onClick={() => setActiveSugTab("users")}>Users</button>
                <button className={`nav-link ${activeSugTab === "groups" ? "active" : ""}`} onClick={() => setActiveSugTab("groups")}>Groups</button>
                <button className={`nav-link ${activeSugTab === "events" ? "active" : ""}`} onClick={() => setActiveSugTab("events")}>Events</button>
                <button className={`nav-link ${activeSugTab === "posts" ? "active" : ""}`} onClick={() => setActiveSugTab("posts")}>Posts</button>
              </div>
              {Object.values(suggestions).flat().length === 0 ? (
                <div className="no-suggestions">No suggestions found</div>
              ) : (
                Object.values(suggestions).flat().map((suggestion, index) => (
                  <SuggestionCard key={index} suggestion={suggestion} />
                ))
              )}
            </div>
          )}
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
            {user.message.total_messages > 0 && (
              <span className="badge">{user.message.total_messages || 0}</span>
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
    </nav >
  );
}
