"use client";
import { useState, useEffect, useRef, use } from "react";
import "../styles/StoriesComponent.css";

export default function StoriesComponent({ storiesUsers }) {
  console.log("StoriesComponent rendered", storiesUsers);

  const [storyUsers, setStoryUsers] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addingStory, setAddingStory] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const progressIntervalRef = useRef(null);
  const storyTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setStoryUsers(storiesUsers);
  }, []);

  async function storySeenn(userIndex) {
    try {
      const response = await fetch("http://localhost:8404/seen_story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(storyUsers[userIndex].user.user_id),
      });
      console.log(storyUsers[userIndex].user.user_id);

      if (!response.ok) {
        throw new Error("Failed to mark story as seen");
      }

      const data = await response.json();
      console.log("Story marked as seen:", data);
    } catch (error) {
      console.error("Error marking story as seen:", error);
    }
  }

  async function createNewStory() {
    try {
      const response = await fetch("http://localhost:8404/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ image: selectedImage }),
      });
      if (!response.ok) {
        throw new Error("Failed to upload story");
      }
      const data = await response.json();
      console.log("Story uploaded successfully:", data);
    } catch (error) {
      console.error("Error uploading story:", error);
    }
  }
  useEffect(() => {
    return () => {
      clearInterval(progressIntervalRef.current);
      clearTimeout(storyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeUserIndex !== null && !isPaused) {
      const user = storyUsers[activeUserIndex];
      const story = user.stories[activeStoryIndex];

      clearInterval(progressIntervalRef.current);
      clearTimeout(storyTimeoutRef.current);

      setProgress(0);

      const duration = 5000;
      const interval = 100;
      const steps = duration / interval;
      let currentProgress = 0;

      progressIntervalRef.current = setInterval(() => {
        currentProgress += 100 / steps;
        if (currentProgress >= 100) {
          clearInterval(progressIntervalRef.current);
        } else {
          setProgress(currentProgress);
        }
      }, interval);

      storyTimeoutRef.current = setTimeout(() => {
        goToNextStory();
      }, duration);
    }

    return () => {
      clearInterval(progressIntervalRef.current);
      clearTimeout(storyTimeoutRef.current);
    };
  }, [activeUserIndex, activeStoryIndex, isPaused]);

  const handleStoryClick = (userIndex) => {
    console.log("User Index:", userIndex);
    storySeenn(userIndex);
    setActiveUserIndex(userIndex);
    setActiveStoryIndex(0);
    setProgress(0);

    const updatedUsers = [...storyUsers];
    updatedUsers[userIndex].hasUnseenStory = false;
    setStoryUsers(updatedUsers);
  };

  const closeStoryModal = () => {
    setActiveUserIndex(null);
    clearInterval(progressIntervalRef.current);
    clearTimeout(storyTimeoutRef.current);
  };

  const goToNextStory = () => {
    const user = storyUsers[activeUserIndex];

    if (activeStoryIndex < user.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else if (activeUserIndex < storyUsers.length - 1) {
      setActiveUserIndex(activeUserIndex + 1);
      setActiveStoryIndex(0);

      const updatedUsers = [...storyUsers];
      updatedUsers[activeUserIndex + 1].hasUnseenStory = false;
      setStoryUsers(updatedUsers);
    } else {
      closeStoryModal();
    }
  };

  const goToPreviousStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else if (activeUserIndex > 0) {
      const prevUserIndex = activeUserIndex - 1;
      const prevUser = storyUsers[prevUserIndex];
      setActiveUserIndex(prevUserIndex);
      setActiveStoryIndex(prevUser.stories.length - 1);
    }
  };

  const handleAddStory = () => {
    setAddingStory(true);
    setSelectedImage(null);
  };

  const closeAddStoryModal = () => {
    setAddingStory(false);
    setSelectedImage(null);
  };

  const handleMouseDown = () => {
    setIsPaused(true);
    clearInterval(progressIntervalRef.current);
    clearTimeout(storyTimeoutRef.current);
  };

  const handleMouseUp = () => {
    setIsPaused(false);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareStory = () => {
    if (selectedImage) {
      createNewStory();

      const newStory = {
        id: Date.now(),
        image: selectedImage,
        duration: 5000,
      };

      const currentUser = storyUsers.find(
        (user) => user.username === "You"
      ) || {
        id: Date.now(),
        username: "You",
        avatar: selectedImage,
        hasUnseenStory: true,
        stories: [],
      };

      const updatedCurrentUser = {
        ...currentUser,
        stories: [...currentUser.stories, newStory],
        hasUnseenStory: true,
      };

      let updatedUsers;
      if (storyUsers.find((user) => user.username === "You")) {
        updatedUsers = storyUsers.map((user) =>
          user.username === "You" ? updatedCurrentUser : user
        );
      } else {
        updatedUsers = [updatedCurrentUser, ...storyUsers];
      }

      setStoryUsers(updatedUsers);
      closeAddStoryModal();
    }
  };
  console.log("dak l index d zeb ", activeUserIndex, activeStoryIndex);
  return (
    <div className="stories-wrapper">
      <div className="stories-header">
        <h2>Stories</h2>
        <button className="stories-view-all-btn">View All</button>
      </div>

      <div className="stories-container">
        <div className="story-item">
          <div className="add-story-button" onClick={handleAddStory}>
            <div className="plus-icon">+</div>
          </div>
          <p className="username">Add Story</p>
        </div>

        {storyUsers.map((user, index) => (
          <div key={index} className="story-item">
            <div
              className={`story-circle ${
                user.hasUnseenStory ? "unseen-story" : "seen-story"
              }`}
              onClick={() => {
                console.log("Clicked on user:", index);
                handleStoryClick(index);
              }}
            >
              <img
                src={user.user.avatar || "/api/placeholder/72/72"}
                alt={user.user.username}
                className="avatar"
              />
            </div>
            <p className="username">{user.username}</p>
          </div>
        ))}
      </div>

      {activeUserIndex !== null && (
        <div className="story-modal">
          <div className="modal-content story-viewer">
            <div className="story-progress-container">
              {storyUsers[activeUserIndex]?.stories?.map((story, idx) => (
                <div key={story.id} className="story-progress-bar">
                  <div
                    className="story-progress"
                    style={{
                      width:
                        idx < activeStoryIndex
                          ? "100%"
                          : idx === activeStoryIndex
                          ? `${progress}%`
                          : "0%",
                    }}
                  ></div>
                </div>
              ))}
            </div>

            <div className="story-header">
              <div className="story-user-info">
                <img
                  src={storyUsers[activeUserIndex].user.avatar}
                  alt={storyUsers[activeUserIndex].user.username}
                  className="story-avatar"
                />
                <span className="story-username">
                  {storyUsers[activeUserIndex].user.username}
                </span>
              </div>
              <button className="close-button" onClick={closeStoryModal}>
                ×
              </button>
            </div>

            <div
              className="story-content"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
            >
              <img
                src={
                  storyUsers[activeUserIndex].stories[activeStoryIndex].image
                }
                alt="Story"
                className="story-image"
              />

              <div className="story-navigation">
                <div
                  className="story-nav prev"
                  onClick={goToPreviousStory}
                ></div>
                <div className="story-nav next" onClick={goToNextStory}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {addingStory && (
        <div className="story-modal">
          <div className="modal-content">
            <button className="close-button" onClick={closeAddStoryModal}>
              ×
            </button>
            <div
              className="story-content"
              style={{ backgroundColor: "#fff", padding: "24px" }}
            >
              <h3 className="story-header" style={{ color: "#262626" }}>
                Create New Story
              </h3>

              {!selectedImage ? (
                <div className="upload-area">
                  <div className="upload-box" onClick={handleFileSelect}>
                    <div className="upload-icon">+</div>
                    <p className="upload-text">Upload Photo</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
              ) : (
                <div className="upload-area" style={{ padding: "0" }}>
                  <img
                    src={selectedImage}
                    alt="Selected"
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}

              <button
                className="share-button"
                onClick={handleShareStory}
                disabled={!selectedImage}
                style={{
                  opacity: selectedImage ? 1 : 0.6,
                  cursor: selectedImage ? "pointer" : "not-allowed",
                }}
              >
                Share Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
