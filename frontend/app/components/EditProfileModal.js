"use client";
import { useState } from "react";
import "../styles/EditProfileModal.css";

export default function EditProfileModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: user.user_id || 0,
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
    UpdateData.append("id", formData.user_id);
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-modal-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
            <label>Privacy</label>
            <div className="privacy-options">
              <label className="privacy-option">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={formData.privacy === "public"}
                  onChange={handleChange}
                />
                <div className="option-content">
                  {/* <div className="option-icon"></div> */}
                  <div className="option-info">
                    <span className="option-title">Public</span>
                    <span className="option-description">
                      Anyone can see your profile and posts
                    </span>
                  </div>
                </div>
              </label>

              <label className="privacy-option">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={formData.privacy === "private"}
                  onChange={handleChange}
                />
                <div className="option-content">
                  {/* <div className="option-icon"></div> */}
                  <div className="option-info">
                    <span className="option-title">Private</span>
                    <span className="option-description">
                      Only followers can see your posts
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
