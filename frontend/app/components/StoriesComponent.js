"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/StoriesComponent.module.css"; 
// import { sendError } from "next/dist/server/api-utils"; 

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
  }, [storiesUsers]);

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
      if (!user || !user.stories || user.stories.length === 0) {
        closeStoryModal();
        return;
      }

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
  }, [activeUserIndex, activeStoryIndex, isPaused, storyUsers]); // Added storyUsers to dependencies

  const handleStoryClick = (userIndex) => {
    // Ensure user and stories exist before attempting to access story_id
    if (
      storyUsers[userIndex] &&
      storyUsers[userIndex].stories &&
      storyUsers[userIndex].stories.length > 0
    ) {
      storySeenn(storyUsers[userIndex].stories[0].story_id);
    }
    setActiveUserIndex(userIndex);
    setActiveStoryIndex(0);
    setProgress(0);

    const updatedUsers = [...storyUsers];
    if (updatedUsers[userIndex]) {
      // Ensure user exists before updating
      updatedUsers[userIndex].unseen_story = true; // This might need to be false if it means "seen"
    }
    setStoryUsers(updatedUsers);
  };

  const closeStoryModal = () => {
    setActiveUserIndex(null);
    clearInterval(progressIntervalRef.current);
    clearTimeout(storyTimeoutRef.current);
  };

  const goToNextStory = () => {
    const user = storyUsers[activeUserIndex];
    if (!user || !user.stories) {
      // Safety check
      closeStoryModal();
      return;
    }

    if (activeStoryIndex < user.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      storySeenn(user.stories[activeStoryIndex + 1].story_id); // Mark next story as seen
    } else if (activeUserIndex < storyUsers.length - 1) {
      const nextUserIndex = activeUserIndex + 1;
      setActiveUserIndex(nextUserIndex);
      setActiveStoryIndex(0);
      const updatedUsers = [...storyUsers];
      if (updatedUsers[nextUserIndex]) {
        // Ensure user exists
        updatedUsers[nextUserIndex].unseen_story = false; // Mark next user's stories as unseen if they have any
      }
      setStoryUsers(updatedUsers);
      // Mark the first story of the next user as seen
      if (
        updatedUsers[nextUserIndex] &&
        updatedUsers[nextUserIndex].stories &&
        updatedUsers[nextUserIndex].stories.length > 0
      ) {
        storySeenn(updatedUsers[nextUserIndex].stories[0].story_id);
      }
    } else {
      closeStoryModal();
    }
    // Original logic marked the *current* story as seen *after* advancing,
    // which might be a bug if it's supposed to mark the *next* one.
    // The previous `storySeenn` call was moved to the correct branches.
  };

  const goToPreviousStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else if (activeUserIndex > 0) {
      const prevUserIndex = activeUserIndex - 1;
      const prevUser = storyUsers[prevUserIndex];
      if (prevUser && prevUser.stories) {
        // Safety check
        setActiveUserIndex(prevUserIndex);
        setActiveStoryIndex(prevUser.stories.length - 1);
      } else {
        // If previous user or their stories are invalid, close or handle
        closeStoryModal(); // Or go to the next available user/story
      }
    }
  };

  const handleAddStory = () => {
    setAddingStory(true);
    setStoryFormInput({ storyImage: null }); // Reset form input
  };

  const closeAddStoryModal = () => {
    setAddingStory(false);
    setStoryFormInput({ storyImage: null });
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
    if (file) {
      setStoryFormInput({
        ...storyFormInput,
        storyImage: file,
      });
    }
  };

  const createNewStory = async () => {
    if (storyFormInput.storyImage) {
      const formData = new FormData();
      formData.append("storyImage", storyFormInput.storyImage);

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
          story_id: data.stories.id, // Assuming 'id' from backend maps to 'story_id'
          image: data.stories.image,
          duration: 5000,
        };

        const currentUserIndex = storyUsers.findIndex(
          (user) => user.user.username === data.user.username
        );

        let updatedUsers = [...storyUsers];

        if (currentUserIndex !== -1) {
          // User exists, update their stories
          updatedUsers[currentUserIndex] = {
            ...updatedUsers[currentUserIndex],
            stories: [...updatedUsers[currentUserIndex].stories, newStory],
            unseen_story: false, // New story is added, so it's "unseen" for others
          };
        } else {
          // New user or first story for this user
          const newUserEntry = {
            user: {
              user_id: data.user.id, // Assuming user ID from backend
              username: data.user.username,
              avatar: data.user.avatar,
            },
            unseen_story: false, // New story is added
            stories: [newStory],
          };
          updatedUsers = [newUserEntry, ...updatedUsers]; // Add new user to the beginning
        }

        setStoryUsers(updatedUsers);
        closeAddStoryModal();
      } catch (error) {
        console.error("Error uploading story:", error);
        // Optionally, show an error message to the user
      }
    }
  };

  const getStoryImageSrc = (story) => {
    if (storyFormInput.storyImage instanceof File) {
      return URL.createObjectURL(storyFormInput.storyImage);
    }
    return story.image || "/inconnu/placeholder-story.png"; // Fallback for story image
  };

  return (
    <div className={styles.storiesWrapper}>
      <div className={styles.storiesContainer}>
        <div className={styles.storyItem}>
          <div className={styles.addStoryButton} onClick={handleAddStory}>
            <div className={styles.plusIcon}>+</div>
          </div>
          <p className={styles.username}>Add Story</p>
        </div>

        {storyUsers?.map((user, index) => (
          <div key={user.user.user_id || index} className={styles.storyItem}>
            <div
              className={`${styles.storyCircle} ${
                !user.unseen_story ? styles.unseenStory : styles.seenStory
              }`}
              onClick={() => {
                handleStoryClick(index);
              }}
            >
              <img
                src={user.user.avatar || "/inconnu/avatar.png"} 
                alt={user.user.username}
                className={styles.avatar}
              />
            </div>
            <p className={styles.username}>{user.user.username}</p>{" "}
          </div>
        ))}
      </div>

      {activeUserIndex !== null && storyUsers[activeUserIndex] && (
        <div className={styles.storyModal}>
          <div className={`${styles.modalContent} ${styles.storyViewer}`}>
            <div className={styles.storyProgressContainer}>
              {storyUsers[activeUserIndex]?.stories?.map((story, idx) => (
                <div
                  key={story.story_id || idx}
                  className={styles.storyProgressBar}
                >
                  <div
                    className={styles.storyProgress}
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

            <div className={styles.storyHeader}>
              <div className={styles.storyUserInfo}>
                <img
                  src={
                    storyUsers[activeUserIndex].user.avatar ||
                    "/inconnu/avatar.png"
                  } 
                  alt={storyUsers[activeUserIndex].user.username}
                  className={styles.storyAvatar}
                />
                <span className={styles.storyUsername}>
                  {storyUsers[activeUserIndex].user.username}
                </span>
              </div>
              <button className={styles.closeButton} onClick={closeStoryModal}>
                ×
              </button>
            </div>

            <div
              className={styles.storyContent}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
            >
              <img
                src={
                  storyUsers[activeUserIndex].stories[activeStoryIndex]
                    ?.image || "/inconnu/placeholder-story.png"
                } 
                alt="Story"
                className={styles.storyImage}
              />

              <div className={styles.storyNavigation}>
                <div
                  className={`${styles.storyNav} ${styles.prev}`}
                  onClick={goToPreviousStory}
                ></div>
                <div
                  className={`${styles.storyNav} ${styles.next}`}
                  onClick={goToNextStory}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {addingStory && (
        <div className={styles.storyModal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={closeAddStoryModal}>
              ×
            </button>
            <div className={styles.addStoryContent}>
              <h3 className={styles.addStoryTitle}>Create New Story</h3>

              {!storyFormInput?.storyImage ? (
                <div className={styles.uploadArea}>
                  <div className={styles.uploadBox} onClick={handleFileSelect}>
                    <div className={styles.uploadIcon}>+</div>
                    <p className={styles.uploadText}>Upload Photo</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      name="storyImage"
                      onChange={handleFileChange}
                      className={styles.hiddenFileInput}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.uploadedImageArea}>
                  <img
                    src={getStoryImageSrc(storyFormInput)}
                    alt="Selected"
                    className={styles.uploadedImage}
                  />
                </div>
              )}

              <button
                className={styles.shareButton}
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
