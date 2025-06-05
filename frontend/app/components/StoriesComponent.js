"use client";
import { useState, useEffect, useRef, use } from "react";
import "../styles/StoriesComponent.css";
import { sendError } from "next/dist/server/api-utils";

export default function StoriesComponent({ storiesUsers }) {
  const [storyUsers, setStoryUsers] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addingStory, setAddingStory] = useState(false);

  const progressIntervalRef = useRef(null);
  const storyTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const [storyFormInput, setStoryFormInput] = useState({
    storyImage: null,
  });

  useEffect(() => {
    setStoryUsers(storiesUsers);
  }, []);

  async function storySeenn(story_id) {
    try {
      const response = await fetch("http://localhost:8404/seen_story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(story_id),
      });

      if (!response.ok) {
        throw new Error("Failed to mark story as seen");
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error marking story as seen:", error);
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
    storySeenn(storyUsers[userIndex].stories[0].story_id);
    setActiveUserIndex(userIndex);
    setActiveStoryIndex(0);
    setProgress(0);

    const updatedUsers = [...storyUsers];
    updatedUsers[userIndex].unseen_story = true;
    console.log("dertvu", updatedUsers);

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
      updatedUsers[activeUserIndex + 1].unseen_story = false;
      setStoryUsers(updatedUsers);
    } else {
      closeStoryModal();
    }
    storySeenn(user.stories[activeStoryIndex].story_id);
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
    setStoryFormInput(null);
  };

  const closeAddStoryModal = () => {
    setAddingStory(false);
    setStoryFormInput(null);
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
    setStoryFormInput({
      ...storyFormInput,
      storyImage: file,
    });
  };

  const createNewStory = async () => {
    if (storyFormInput.storyImage) {
      const formData = new FormData();
      if (storyFormInput.storyImage) {
        formData.append("storyImage", storyFormInput.storyImage);
      }
      try {
        const response = await fetch("http://localhost:8404/story", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Failed to upload story");
        }
        const data = await response.json();

        const newStory = {
          id: data.stories.id,
          image: data.stories.image,
          duration: 5000,
        };

        const currentUser = storyUsers.find(
          (user) => user.username === data.user.username
        ) || {
          user: {
            id: data.stories.id,
            username: data.user.username,
            avatar: data.user.avatar,
          },
          unseen_story: data.stories.status,
          stories: [],
        };

        console.log("currentUser", currentUser);

        const updatedCurrentUser = {
          ...currentUser,
          stories: [...currentUser.stories, newStory],
          unseen_story: false,
        };

        let updatedUsers;
        if (
          storyUsers.find((user) => {
            return user.user.username === data.user.username;
          })
        ) {
          updatedUsers = storyUsers.map((user) =>
            user.user.username === data.user.username
              ? updatedCurrentUser
              : user
          );
        } else {
          updatedUsers = [updatedCurrentUser, ...storyUsers];
        }
        console.log("updateUser", updatedUsers);

        setStoryUsers(updatedUsers);
        closeAddStoryModal();
      } catch (error) {
        console.error("Error uploading story:", error);
      }
    }
  };
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

        {storyUsers?.map((user, index) => (
          <div key={index} className="story-item">
            <div
              className={`story-circle ${
                !user.unseen_story ? "unseen-story" : "seen-story"
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

              {!storyFormInput?.storyImage ? (
                <div className="upload-area">
                  <div className="upload-box" onClick={handleFileSelect}>
                    <div className="upload-icon">+</div>
                    <p className="upload-text">Upload Photo</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      name="storyImage"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
              ) : (
                <div className="upload-area" style={{ padding: "0" }}>
                  <img
                    src={storyFormInput?.storyImage}
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
                onClick={createNewStory}
                disabled={!storyFormInput?.storyImage}
                style={{
                  opacity: storyFormInput?.storyImage ? 1 : 0.6,
                  cursor: storyFormInput?.storyImage
                    ? "pointer"
                    : "not-allowed",
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
