"use client";

import { useState, useEffect } from "react";
import LeftSidebar from "./components/LeftSideBar";
import ProfileCard from "./components/ProfileCard";
import TopGroups from "./components/TopGroups";
import PostComponent from "./components/PostComponent";
import AuthForm from "./components/AuthForm";
import StoriesComponent from "./components/StoriesComponent";

// import Notifications from "./components/NotificationsComponent";
import ChatWidget from "./components/ChatWidget";
import "./styles/page.css";

export default function Home() {
  const [error, setError] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [homeData, setHomeData] = useState(null);
  const [posts, setPosts] = useState([]);

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
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [isLoggedIn !== null]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchHomeData();
    }
  }, [isLoggedIn]);

  const fetchHomeData = async () => {
    try {
      const response = await fetch(
        "http://localhost:8404/home?offset=0&offset_messages=0",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHomeData(data);
        setPosts(data.posts);
        console.log("Data received: ", data);
      }
    } catch (error) {
      setError(true);

      console.error("Error fetching posts:", error);
    }
  };

  const addNewPost = (newPost) => {
    setPosts((prevPosts) => {
      const updatedPosts = [newPost, ...prevPosts];
      return updatedPosts;
    });
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h2 className="error-title">Error Home Page</h2>
        <p className="error-message">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (isLoggedIn && homeData) {
    return (
      <div className="app-container">
        <div className="main-content">
          <div className="grid-layout">
            <div className="left-column">
              <LeftSidebar
                users={homeData.suggested_users}
                bestcategories={homeData.best_categories}
              />
            </div>

            <div className="center-column">
              <div className="stories-section">
                <StoriesComponent/>
              </div>
              <PostComponent posts={posts} />
            </div>

            <div className="right-column">
              <ProfileCard
                user={homeData.user}
                onPostCreated={addNewPost}
                my_groups={homeData.my_groups}
              />
              <TopGroups groups={homeData.discover_groups} />
            </div>
          </div>
        </div>

        <ChatWidget
          users={homeData.connections}
          groups={homeData.my_groups}
          myData={homeData.user}
        />
      </div>
    );
  }
}
