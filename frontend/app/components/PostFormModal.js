"use client";
import { useState, useEffect } from "react";
import styles from "../styles/PostFormModal.module.css";

export default function PostFormModal({
  onClose,
  onPostCreated,
  group_id,
  action,
}) {
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
      let response;
      if (group_id && group_id > 0) {
        response = await fetch(
          `http://localhost:8404/new_post_group?group_id=${group_id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
      } else {
        response = await fetch("http://localhost:8404/new_post", {
          method: "GET",
          credentials: "include",
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log("Data from creating post", data);

        if (data.Users && Array.isArray(data.Users)) {
          setFollowers(data.Users);
        }

        if (data.Categories && Array.isArray(data.Categories)) {
          setCategories(data.Categories);

          if (data.Categories.length > 0) {
            setPostFormInput((prev) => ({
              ...prev,
              categoryId: data.Categories[0].category_id,
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
    const isSelected = selectedFollowers.includes(follower.user_id);

    if (isSelected) {
      setSelectedFollowers((prev) =>
        prev.filter((id) => id !== follower.user_id)
      );
      setSelectedFollowerNames((prev) =>
        prev.filter((name) => name !== follower.username)
      );
    } else {
      setSelectedFollowers((prev) => [...prev, follower.user_id]);
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

    formData.append("users", selectedFollowers.join(","));
    if (postFormInput.postImage) {
      formData.append("postImage", postFormInput.postImage);
    }

    try {
      let response;
      if (group_id && group_id > 0) {
        response = await fetch(
          `http://localhost:8404/new_post_group?group_id=${group_id}`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );
      } else {
        response = await fetch("http://localhost:8404/new_post", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
      }

      if (!response.ok) {
        const data = await response.json();
        console.error(data);
        throw new Error(data.error || "Failed to create the post");
      }
      const data = await response.json();
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      const newPost = {
        id: data.id || Date.now(),
        title: data.title || postFormInput.title,
        content: data.content || postFormInput.content,
        privacy: data.privacy || postFormInput.privacy || "public",
        author: `${data.first_name} ${data.last_name}`,
        author_id: data.user_id,
        created_at: "Just now",
        category:
          categories.find(
            (c) => c.category_id === parseInt(postFormInput.categoryId)
          )?.name || "",
        category_color: "#000000",
        category_background: "#f0f0f0",
        total_likes: 0,
        total_comments: 0,
        is_liked: false,
        saved: false,
        image: data.image || null,
        avatar: data.avatar || "/avatars/default.jpg",
      };

      console.log("New post object:", newPost);

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Create a new post</h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <form className={styles.postForm} onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label htmlFor="post-title">Title</label>
              <input
                id="post-title"
                className={styles.formControl}
                placeholder="Enter post title"
                required
                value={postFormInput.title}
                onChange={(e) => {
                  setPostFormInput({ ...postFormInput, title: e.target.value });
                }}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="post-content">Content</label>
              <textarea
                id="post-content"
                className={styles.formControl}
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

            <div className={styles.formGroup}>
              <label>Upload Image</label>
              {postFormInput.postImage ? (
                <div className={styles.imagePreview}>
                  <img
                    src={URL.createObjectURL(postFormInput.postImage)}
                    alt="Selected"
                  />
                  <button
                    className={styles.removeImageButton}
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
                <div className={styles.fileUpload}>
                  <input
                    key={imageInputKey}
                    type="file"
                    id="file-input"
                    className={styles.fileInput}
                    name="postImage"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label htmlFor="file-input" className={styles.fileLabel}>
                    <img src="/icons/upload.svg" alt="" />
                    Choose File
                  </label>
                  <span className={styles.fileName}>
                    {postFormInput.postImage
                      ? postFormInput.postImage.name
                      : "No file chosen"}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
                className={styles.formControl}
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
                    <option key={category.name} value={category.category_id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value={0}>Loading categories...</option>
                )}
              </select>
            </div>
            {action !== "groupe" && (
              <div className={styles.formGroup}>
                <label>Privacy</label>
                <div className={styles.privacyOptions}>
                  <label className={styles.privacyOption}>
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

                  <label className={styles.privacyOption}>
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

                  <label className={styles.privacyOption}>
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
            )}

            {showAudienceSelector && (
              <div className={`${styles.formGroup} ${styles.audienceSelector}`}>
                <label>Select Audience</label>

                {selectedFollowerNames.length > 0 && (
                  <div className={styles.selectedFollowers}>
                    <p>Selected: {selectedFollowerNames.join(", ")}</p>
                  </div>
                )}

                <div className={styles.followersList}>
                  {isLoading ? (
                    <p className={styles.loadingText}>Loading followers...</p>
                  ) : followers.length > 0 ? (
                    followers.map((follower) => (
                      <label key={follower.id} className={styles.followerItem}>
                        <input
                          type="checkbox"
                          className={styles.followerCheckbox}
                          checked={selectedFollowers.includes(follower.id)}
                          onChange={() => toggleFollowerSelection(follower)}
                        />
                        <span className={styles.followerName}>
                          {follower.username}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className={styles.noFollowersText}>No followers found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
