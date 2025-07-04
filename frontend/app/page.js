"use client";

import { useState, useEffect } from "react";
import LeftSidebar from "./components/LeftSideBar";
import ProfileCard from "./components/ProfileCard";
import TopGroups from "./components/TopGroups";
import PostComponent from "./components/PostComponent";
import AuthForm from "./components/AuthForm";
import StoriesComponent from "./components/StoriesComponent";
import ChatWidget from "./components/ChatWidget";
import "./styles/page.css";

export default function Home() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [homeData, setHomeData] = useState(null);

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

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
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchHomeData();
    }
  }, [isLoggedIn]);

  const fetchHomeData = async (offset = 0) => {
    try {
      const response = await fetch(
        `http://localhost:8404/home?offset=${offset}&offset_messages=${offset}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      if (!data.posts || !Array.isArray(data.posts)) {
        if (offset === 0) setPosts([]);
        setHasMorePosts(false);
        return [];
      }

      if (data.user.stories) {
        setStories(data.user.stories);
      }

      if (offset === 0) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      if (data.posts.length === 0) {
        setHasMorePosts(false);
      } else {
        setHasMorePosts(true);
      }
      setHomeData(data);

      return data.posts;
    } catch (error) {
      setError(true);
      console.error("Error fetching posts:", error);
      setHasMorePosts(false);
      return [];
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
      if (nearBottom && !isFetchingMore && hasMorePosts && isLoggedIn) {
        setIsFetchingMore(true);
        fetchHomeData(posts.length).then((newPosts) => {
          if (newPosts.length === 0) {
            setHasMorePosts(false);
          }
          setIsFetchingMore(false);
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [posts, isFetchingMore, hasMorePosts]);

  const addNewPost = (newPost) => {
    setPosts((prevPosts) => {
      const updatedPosts = [newPost, ...prevPosts];
      return updatedPosts;
    });
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
                <StoriesComponent storiesUsers={stories} />
              </div>
              <PostComponent 
              // key={posts.post_id}
              posts={posts} />
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
