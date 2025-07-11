"use client";

import { useState, useEffect, useRef } from "react";
import LeftSidebar from "./components/LeftSideBar";
import ProfileCard from "./components/ProfileCard";
import TopGroups from "./components/TopGroups";
import PostComponent from "./components/PostComponent";
import StoriesComponent from "./components/StoriesComponent";
import ChatWidget from "./components/ChatWidget";
import "./styles/page.css";

export default function Home() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [homeData, setHomeData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [isFetchingMorePosts, setIsFetchingMorePosts] = useState(true);
  const postsRef = useRef(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async (offset = 0, msgOffset = 0) => {
    try {
      const response = await fetch(
        `http://localhost:8404/home?offset=${offset}&offset_messages=${msgOffset}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      setHomeData(data);
      if (data.user.stories) {
        setStories(data.user.stories);
      }
      if (posts?.length === 0) setPosts(data.posts);
      else {
        setPosts(posts ? [...posts, ...data.posts] : data.posts)
      }
      if (data.posts.length < 10) {
        setIsFetchingMorePosts(false);
      }
    } catch (error) {
      console.log("Error fetching posts:", error);
      setError("Error fetching data.")
    } finally {
      setIsLoading(false);
      setError(null)
    }
  };

  const addNewPost = () => {
    fetchHomeData(0, 0)
  };

  useEffect(() => {
    const postsScroll = postsRef.current;
    if (!postsScroll || !isFetchingMorePosts) return;

    const handleScroll = () => {
      if (postsScroll.scrollTop + postsScroll.clientHeight >= postsScroll.scrollHeight - 100) {
        fetchHomeData(posts.length, 0)
      }
    };

    postsScroll.addEventListener("scroll", handleScroll);

    return () => {
      postsScroll.removeEventListener("scroll", handleScroll);
    };
  }, [posts]);

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

  if (homeData) {
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

            <div className="center-column" ref={postsRef}>
              <div className="stories-section">
                <StoriesComponent storiesUsers={stories} />
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