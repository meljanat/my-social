"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../styles/Navbar.module.css";

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
  const router = useRouter();
  const profileMenuRef = useRef(null);
  const searchSugRef = useRef(null);
  const notificationRef = useRef(null);

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
    } catch (error) {
      console.log("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleNewMessage = (msg) => {
    if (
      (msg.type === "message" && msg.user_id !== msg.current_user) ||
      msg.type === "notifications" ||
      msg.type === "read_messages"
    ) {
      fetchUser();
    }
  };

  useEffect(() => {
    addToListeners("notifications", handleNewMessage);
    addToListeners("message", handleNewMessage);

    return () => {
      removeFromListeners("notifications", handleNewMessage);
      removeFromListeners("message", handleNewMessage);
    };
  }, []);

  const fetchSuggestions = async () => {
    const offset = 0;
    try {
      const response = await fetch(
        `http://localhost:8404/search?query=${searchQuery}&offset=${offset}&type=${activeSugTab}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error("Failed to fetch suggestions", data.error);
      }

      setSuggestions((prevSuggestions) => {
        const newSuggestions = data;
        if (prevSuggestions) {
          return {
            ...prevSuggestions,
            users: [
              ...(prevSuggestions.users || []),
              ...(newSuggestions.users || []),
            ],
            groups: [
              ...(prevSuggestions.groups || []),
              ...(newSuggestions.groups || []),
            ],
            events: [
              ...(prevSuggestions.events || []),
              ...(newSuggestions.events || []),
            ],
            posts: [
              ...(prevSuggestions.posts || []),
              ...(newSuggestions.posts || []),
            ],
          };
        }
        return newSuggestions;
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    setSuggestions([]);
    fetchSuggestions();
  }, [searchQuery, activeSugTab]);

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
  };
  const handleClickOutside = (event) => {
    if (
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target) &&
      searchSugRef.current &&
      !searchSugRef.current.contains(event.target) &&
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowProfileMenu(false);
      setShowSearchSuggestions(false);
      setShowNotifications(false);
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <div className={styles.logo}>
          <img src="./icons/logo.svg" alt="Logo" />
        </div>

        <div className={styles.navLinks}>
          <button
            className={`${styles.navLink} ${
              activeLink === "home" ? styles.active : ""
            }`}
            onClick={() => {
              router.push("/");

              setActiveLink("home");
            }}
          >
            {/* <Link href="/"> */}
            <img src="./icons/home1.svg" alt="Home" />
            <span>Home</span>
            {/* </Link> */}
          </button>

          <button
            className={`${styles.navLink} ${
              activeLink === "groups" ? styles.active : ""
            }`}
            onClick={() => {
              router.push("/groups");

              setActiveLink("groups");
            }}
          >
            {/* <Link href="/groups"> */}
            <img src="./icons/groups.svg" alt="Groups" />
            <span>Groups</span>
            {/* </Link> */}
          </button>

          <button
            className={`${styles.navLink} ${
              activeLink === "events" ? styles.active : ""
            }`}
            onClick={() => {
              router.push("/Events");
              setActiveLink("events");
            }}
          >
            {/* <Link href="/Events"> */}
            <img src="./icons/events.svg" alt="Events" />
            <span>Events</span>
            {/* </Link> */}
          </button>
          <button
            className={`${styles.navLink} ${
              activeLink === "messages" ? styles.active : ""
            }`}
            onClick={() => {
              router.push("/messages");
              setActiveLink("messages");
            }}
          >
            <img src="./icons/message.svg" alt="Messages" />
            {user.total_messages > 0 && (
              <span className={styles.badge}>{user.total_messages || 0}</span>
            )}
            <span>Messages</span>
          </button>
        </div>
      </div>

      <div className={styles.searchBar} ref={searchSugRef}>
        <form
          className={styles.searchInputContainer}
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim() !== "") {
              router.push(
                `/search-results?query=${encodeURIComponent(searchQuery)}`
              );
              setSearchQuery("");
              setSuggestions(null);
              setShowSearchSuggestions(false);
            }
          }}
        >
          <img
            src="./icons/search.svg"
            alt="Search"
            className={styles.searchIcon}
          />
          <input
            type="text"
            placeholder="What's on your mind?"
            value={searchQuery}
            onFocus={() => toggleSearchSuggestions()}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {showSearchSuggestions && (
            <div className={styles.searchSuggestions}>
              <div className={styles.navLinks}>
                <button
                  className={`${styles.navLink} ${
                    activeSugTab === "all" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSugTab("all")}
                >
                  All
                </button>
                <button
                  className={`${styles.navLink} ${
                    activeSugTab === "users" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSugTab("users")}
                >
                  Users
                </button>
                <button
                  className={`${styles.navLink} ${
                    activeSugTab === "groups" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSugTab("groups")}
                >
                  Groups
                </button>
                <button
                  className={`${styles.navLink} ${
                    activeSugTab === "events" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSugTab("events")}
                >
                  Events
                </button>
                <button
                  className={`${styles.navLink} ${
                    activeSugTab === "posts" ? styles.active : ""
                  }`}
                  onClick={() => setActiveSugTab("posts")}
                >
                  Posts
                </button>
              </div>
              {suggestions &&
              Object.values(suggestions).flat()?.length === 0 ? (
                <div className={styles.noSuggestions}>No suggestions found</div>
              ) : (
                suggestions &&
                Object.values(suggestions)
                  .flat()
                  ?.map((suggestion, index) => (
                    <SuggestionCard key={index} suggestion={suggestion} />
                  ))
              )}
            </div>
          )}
        </form>
      </div>

      <div className={styles.userActions}>
        <div ref={notificationRef}>
          <button
            className={styles.notificationButton}
            onClick={toggleNotifications}
          >
            <img src="./icons/notification.svg" alt="Notifications" />
            {user.total_notifications > 0 ? (
              <span className={styles.badge}>
                {user.total_notifications || 1}
              </span>
            ) : (
              <span className={styles.notificationCount}>0</span>
            )}
          </button>

          {showNotifications && (
            <NotificationsComponent
              onMarkAllAsRead={() => {
                setUser((prevUser) => ({
                  ...prevUser,
                  total_notifications: 0,
                }));
              }}
            />
          )}
        </div>

        {/* <button className={`${styles.actionIcon} ${styles.messageBadge}`}>
          <Link href="/messages">
            <img src="./icons/message.svg" alt="Messages" />
            {user.total_messages > 0 && (
              <span className={styles.badge}>{user.total_messages || 0}</span>
            )}
          </Link>
        </button> */}

        <div className={styles.profileDropdown} ref={profileMenuRef}>
          <button className={styles.profileButton} onClick={toggleProfileMenu}>
            <img
              src={user.avatar}
              alt={user.username || "User"}
              className={styles.userAvatar}
            />
            <div className={styles.userInfo}>
              <span
                className={styles.userName}
              >{`${user.first_name} ${user.last_name}`}</span>
              <span className={styles.userUsername}>
                @{user.username || "username"}
              </span>
            </div>
            <img
              src="./icons/drop-down.svg"
              alt="Menu"
              className={`${styles.dropdownIcon} ${
                showProfileMenu ? styles.rotate : ""
              }`}
            />
          </button>

          {showProfileMenu && (
            <div className={styles.profileMenu}>
              <a
                href={`/profile?id=${user.user_id}`}
                className={styles.menuItem}
              >
                <img src="./icons/user.svg" alt="Profile" />
                <span>My Profile</span>
              </a>
              <button
                onClick={handleLogout}
                className={`${styles.menuItem} ${styles.logoutItem}`}
              >
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
