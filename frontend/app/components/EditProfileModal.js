"use client";
import { useState } from "react";
import styles from "../styles/EditProfileModal.module.css";

export default function EditProfileModal({ user, onClose, onSave }) {
  console.log("EditProfileModal props:", user, onClose, onSave);

  const [formData, setFormData] = useState({
    // id: user.user_id || 0,
    username: user.username || "",
    privacy: user.privacy || "public",
    bio: user.bio || "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const UpdateData = new FormData();
    UpdateData.append("id", formData.id);
    UpdateData.append("username", formData.username);
    UpdateData.append("privacy", formData.privacy);
    UpdateData.append("aboutMe", formData.bio);
    UpdateData.append("firstName", formData.first_name);
    UpdateData.append("lastName", formData.last_name);
    UpdateData.append("type", "update");

    try {
      const response = await fetch("http://localhost:8404/register", {
        method: "POST",
        credentials: "include",
        body: UpdateData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      console.log(data);

      // onSave(data.user);
      onSave({
        ...user,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio,
        privacy: formData.privacy,
      });
      onClose();
    } catch (err) {
      console.log("Error:", err);
      setError(err.message || "An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.editProfileModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Edit Profile</h2>
          <button className={styles.closeModalBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.editProfileForm}>
          <div className={styles.formGroup}>
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows="4"
            ></textarea>
          </div>

          <div className={styles.formGroup}>
            <label>Privacy</label>
            <div className={styles.privacyOptions}>
              <label className={styles.privacyOption}>
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={formData.privacy === "public"}
                  onChange={handleChange}
                />
                <div className={styles.optionContent}>
                  {/* <div className="option-icon"></div> */}
                  <div className={styles.optionInfo}>
                    <span className={styles.optionTitle}>Public</span>
                    <span className={styles.optionDescription}>
                      Anyone can see your profile and posts
                    </span>
                  </div>
                </div>
              </label>

              <label className={styles.privacyOption}>
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={formData.privacy === "private"}
                  onChange={handleChange}
                />
                <div className={styles.optionContent}>
                  {/* <div className="option-icon"></div> */}
                  <div className={styles.optionInfo}>
                    <span className={styles.optionTitle}>Private</span>
                    <span className={styles.optionDescription}>
                      Only followers can see your posts
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
