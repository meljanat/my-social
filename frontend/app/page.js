"use client";

import { useState, useEffect, useRef, use } from "react";
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
  const [offset, setOffset] = useState(0);
  const [msgOffset, setMsgOffset] = useState(0);
  const postsRef = useRef([]);
  const msgsRef = useRef([]);

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

      if (data.user.stories) {
        setStories(data.user.stories);
      }
      setPosts(data.posts);
      setHomeData(data);
    } catch (error) {
      setError(true);
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewPost = (newPost) => {
    setPosts((prevPosts) => {
      const updatedPosts = [newPost, ...prevPosts];
      return updatedPosts;
    });
  };

  useEffect(() => {
    const postsScroll = postsRef.current.scrollTop;
    const handleScroll = () => {
      console.log("Posts Ref Updated:", postsRef.current.scrollTop);
    }

    // handleScroll();
    if (postsScroll) {
      postsScroll.addEventListener("scroll", handleScroll);
    }


  }, []);

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

            <div className="center-column">
              <div className="stories-section">
                <StoriesComponent storiesUsers={stories} />
              </div>
              <PostComponent posts={posts} postsRef={postsRef} />
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
