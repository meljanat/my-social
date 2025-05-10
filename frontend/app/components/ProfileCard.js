"use client";
import { useState, useEffect } from "react";
import "../styles/ProfileCard.css";

import GroupFormModal from "./GroupFromModal";
import EventFormModal from "./EventFormModal";

export default function ProfileCard({ user, onPostCreated, my_groups }) {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [groups, setGroups] = useState([]);

  function handleCreatePost() {
    setShowPostForm(true);
  }
  function handleCreateGroup() {
    setShowGroupForm(true);
  }
  function handleCreateEvent() {
    setShowEventForm(true);
  }

  const handleGroupCreated = (newGroup) => {
    setGroups((prevGroups) => [newGroup, ...prevGroups]);
  };

  return (
    <div className="profile-card">
      <div className="profile-cover">
        <img
          src={user.cover || user.avatar}
          alt="Cover"
          className="cover-image"
        />
        <div className="profile-avatar">
          <img src={user.avatar} alt={user.username} />
        </div>
      </div>

      <div className="profile-info">
        <a href={`/profile/${user.id}`} className="profile-link">
          <h2 className="profile-name">{`${user.first_name} ${user.last_name}`}</h2>
        </a>
        <p className="profile-username">@{user.username || "username"}</p>

        <div className="stats">
          <div className="stat">
            <div className="stat-value">{user.total_followers}</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="stat">
            <div className="stat-value">{user.total_following}</div>
            <div className="stat-label">Following</div>
          </div>
          <div className="stat">
            <div className="stat-value">{user.total_posts}</div>
            <div className="stat-label">Posts</div>
          </div>
        </div>

        <div className="profile-actions">
          <button
            onClick={handleCreatePost}
            className="action-btn primary-button"
          >
            <img src="/icons/create.svg" alt="" />
            <span>Create post</span>
          </button>
          <button
            className="action-btn secondary-button"
            onClick={handleCreateGroup}
          >
            {/* <img src="/icons/create.svg" alt="" /> */}
            <span>Create group</span>
          </button>
          <button
            className="action-btn secondary-button"
            onClick={handleCreateEvent}
          >
            {/* <img src="/icons/create.svg" alt="" /> */}
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {showPostForm && (
        <PostFormModal
          onClose={() => setShowPostForm(false)}
          user={user}
          onPostCreated={onPostCreated}
        />
      )}
      {showGroupForm && (
        <GroupFormModal
          onClose={() => setShowGroupForm(false)}
          user={user}
          onGroupCreated={handleGroupCreated}
        />
      )}
      {showEventForm && (
        <EventFormModal
          onClose={() => setShowEventForm(false)}
          user={user}
          my_groups={my_groups}
        />
      )}
    </div>
  );
}

function PostFormModal({ onClose, user, onPostCreated }) {
  const [postFormInput, setPostFormInput] = useState({
    title: "",
    content: "",
    privacy: "",
    categoryId: 0,
    postImage: null,
  });
  const [imageInputKey, setImageInputKey] = useState(Date.now());
  const [followers, setFollowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [selectedFollowerNames, setSelectedFollowerNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAudienceSelector, setShowAudienceSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (postFormInput.privacy === "almost_private") {
      setShowAudienceSelector(true);
    } else {
      setShowAudienceSelector(false);
    }
  }, [postFormInput.privacy]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8404/new_post", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        if (data.Users && Array.isArray(data.Users)) {
          setFollowers(data.Users);
        }

        if (data.Categories && Array.isArray(data.Categories)) {
          setCategories(data.Categories);

          if (data.Categories.length > 0) {
            setPostFormInput((prev) => ({
              ...prev,
              categoryId: data.Categories[0].id,
            }));
          }
        }
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setPostFormInput({
      ...postFormInput,
      postImage: file,
    });
  };

  const toggleFollowerSelection = (follower) => {
    const isSelected = selectedFollowers.includes(follower.id);

    if (isSelected) {
      setSelectedFollowers((prev) => prev.filter((id) => id !== follower.id));
      setSelectedFollowerNames((prev) =>
        prev.filter((name) => name !== follower.username)
      );
    } else {
      setSelectedFollowers((prev) => [...prev, follower.id]);
      setSelectedFollowerNames((prev) => [...prev, follower.username]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("title", postFormInput.title);
    formData.append("content", postFormInput.content);
    formData.append("privacy", postFormInput.privacy);

    formData.append("category", postFormInput.categoryId.toString());

    if (
      postFormInput.privacy === "almost_private" &&
      selectedFollowers.length > 0
    ) {
      formData.append("audience", JSON.stringify(selectedFollowers));
    }

    if (postFormInput.postImage) {
      formData.append("postImage", postFormInput.postImage);
    }

    try {
      const response = await fetch("http://localhost:8404/new_post", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        console.error(data);
        throw new Error(data.error || "Failed to create the post");
      }

      const responseData = await response.json();

      const newPost = {
        id: responseData.id || Date.now(),
        title: postFormInput.title,
        content: postFormInput.content,
        privacy: postFormInput.privacy,
        author: `${user.first_name} ${user.last_name}`,
        author_id: user.id,
        created_at: "Just now",
        category:
          categories.find((c) => c.id === postFormInput.categoryId)?.name || "",
        total_likes: 0,
        total_comments: 0,
        image: postFormInput.postImage
          ? URL.createObjectURL(postFormInput.postImage)
          : null,
        avatar: user.avatar || "avatar.jpg",
      };

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create a new post</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form className="post-form" onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="post-title">Title</label>
              <input
                id="post-title"
                className="form-control"
                placeholder="Enter post title"
                required
                value={postFormInput.title}
                onChange={(e) => {
                  setPostFormInput({ ...postFormInput, title: e.target.value });
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="post-content">Content</label>
              <textarea
                id="post-content"
                className="form-control"
                placeholder="Post Content..."
                required
                value={postFormInput.content}
                onChange={(e) => {
                  setPostFormInput({
                    ...postFormInput,
                    content: e.target.value,
                  });
                }}
              />
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              {postFormInput.postImage ? (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(postFormInput.postImage)}
                    alt="Selected"
                  />
                  <button
                    className="remove-image-button"
                    onClick={(e) => {
                      e.preventDefault();
                      setPostFormInput({
                        ...postFormInput,
                        postImage: null,
                      });
                      setImageInputKey(Date.now());
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="file-upload">
                  <input
                    key={imageInputKey}
                    type="file"
                    id="file-input"
                    className="file-input"
                    name="postImage"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label htmlFor="file-input" className="file-label">
                    <img src="/icons/upload.svg" alt="" />
                    Choose File
                  </label>
                  <span className="file-name">
                    {postFormInput.postImage
                      ? postFormInput.postImage.name
                      : "No file chosen"}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
                className="form-control"
                value={postFormInput.categoryId}
                onChange={(e) => {
                  setPostFormInput({
                    ...postFormInput,
                    categoryId: parseInt(e.target.value, 10),
                  });
                }}
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.name} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value={0}>Loading categories...</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Privacy</label>
              <div className="privacy-options">
                <label className="privacy-option">
                  <input
                    type="radio"
                    value="private"
                    name="privacy"
                    checked={postFormInput.privacy === "private"}
                    onChange={(e) => {
                      setPostFormInput({
                        ...postFormInput,
                        privacy: e.target.value,
                      });
                    }}
                  />
                  <span>Private</span>
                </label>

                <label className="privacy-option">
                  <input
                    type="radio"
                    value="public"
                    name="privacy"
                    checked={postFormInput.privacy === "public"}
                    onChange={(e) => {
                      setPostFormInput({
                        ...postFormInput,
                        privacy: e.target.value,
                      });
                    }}
                  />
                  <span>Public</span>
                </label>

                <label className="privacy-option">
                  <input
                    type="radio"
                    value="almost_private"
                    name="privacy"
                    checked={postFormInput.privacy === "almost_private"}
                    onChange={(e) => {
                      setPostFormInput({
                        ...postFormInput,
                        privacy: e.target.value,
                      });
                    }}
                  />
                  <span>Almost Private</span>
                </label>
              </div>
            </div>

            {showAudienceSelector && (
              <div className="form-group audience-selector">
                <label>Select Audience</label>

                {selectedFollowerNames.length > 0 && (
                  <div className="selected-followers">
                    <p>Selected: {selectedFollowerNames.join(", ")}</p>
                  </div>
                )}

                <div className="followers-list">
                  {isLoading ? (
                    <p className="loading-text">Loading followers...</p>
                  ) : followers.length > 0 ? (
                    followers.map((follower) => (
                      <label key={follower.id} className="follower-item">
                        <input
                          type="checkbox"
                          className="follower-checkbox"
                          checked={selectedFollowers.includes(follower.id)}
                          onChange={() => toggleFollowerSelection(follower)}
                        />
                        <span className="follower-name">
                          {follower.username}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="no-followers-text">No followers found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
