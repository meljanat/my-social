import React, { useState } from "react";
import styles from "../styles/GroupFormModal.module.css";

export default function GroupFormModal({ onClose, user, onGroupCreated }) {
  const [groupFormInput, setGroupFormInput] = useState({
    // user_id: user.id,
    name: "",
    description: "",
    privacy: "public",
    groupImage: null,
    groupCover: null,
  });
  const [imageInputKey, setImageInputKey] = useState(Date.now());
  const [coverInputKey, setCoverInputKey] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setGroupFormInput({
      ...groupFormInput,
      groupImage: file,
    });
  };

  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    setGroupFormInput({
      ...groupFormInput,
      groupCover: file,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", groupFormInput.name);
    formData.append("description", groupFormInput.description);
    formData.append("privacy", groupFormInput.privacy);

    if (groupFormInput.groupImage) {
      formData.append("groupImage", groupFormInput.groupImage);
    }

    if (groupFormInput.groupCover) {
      formData.append("groupCover", groupFormInput.groupCover);
    }

    try {
      const response = await fetch("http://localhost:8404/new_group", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        console.error(data);
        throw new Error(data.error || "Failed to create the group");
      }

      const responseData = await response.json();
      console.log("Group created:", responseData);

      const newGroup = {
        group_id: responseData.group_id,
        name: responseData.name,
        role: "admin",
        total_posts: 0,
        total_members: 1,
        description: responseData.description,
        privacy: responseData.privacy,
        created_at: responseData.created_at,
        image: responseData.image,
        cover: responseData.cover,
      };

      if (onGroupCreated) {
        onGroupCreated(newGroup);
      }

      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Create a new group</h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <form className={styles.groupForm} onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label htmlFor="group-name">Group Name</label>
              <input
                id="group-name"
                className={styles.formControl}
                placeholder="Enter group name"
                required
                value={groupFormInput.name}
                onChange={(e) => {
                  setGroupFormInput({
                    ...groupFormInput,
                    name: e.target.value,
                  });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                className={styles.formControl}
                placeholder="Group Description..."
                required
                value={groupFormInput.description}
                onChange={(e) => {
                  setGroupFormInput({
                    ...groupFormInput,
                    description: e.target.value,
                  });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="group-privacy">Privacy</label>
              <select
                id="group-privacy"
                className={styles.formControl}
                value={groupFormInput.privacy}
                onChange={(e) => {
                  setGroupFormInput({
                    ...groupFormInput,
                    privacy: e.target.value,
                  });
                }}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Upload Image</label>
              {groupFormInput.groupImage ? (
                <div className={styles.imagePreview}>
                  <img
                    src={URL.createObjectURL(groupFormInput.groupImage)}
                    alt="Selected Group Image"
                  />
                  <button
                    className={styles.removeImageButton}
                    onClick={(e) => {
                      e.preventDefault();
                      setGroupFormInput({
                        ...groupFormInput,
                        groupImage: null,
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
                    id="group-image"
                    className={styles.fileInput}
                    name="groupImage"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label htmlFor="group-image" className={styles.fileLabel}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="16"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        fill="#475569"
                        d="M10 0C6.834.025 3.933 2.153 3.173 5.536 1.232 6.352 0 8.194 0 10.376 0 13.385 2.376 16 5.312 16H6a1 1 0 1 0 0-2h-.688C3.526 14 2 12.321 2 10.375c0-1.493.934-2.734 2.344-3.156a.98.98 0 0 0 .687-.813C5.417 3.7 7.592 2.02 10 2c2.681-.02 5.021 2.287 5 5v1.094c0 .465.296.864.75.968C17.066 9.367 18 10.4 18 11.5c0 1.35-1.316 2.5-3 2.5h-1a1 1 0 0 0 0 2h1c2.734 0 5-1.983 5-4.5 0-1.815-1.215-3.42-3.013-4.115.002-.178.013-.359.013-.385.03-3.836-3.209-7.03-7-7m0 6L6.988 9.013 9 9v6a1 1 0 0 0 2 0V9l2.012.01z"
                      ></path>
                    </svg>
                    Choose Group Image
                  </label>
                  <span className={styles.fileName}>
                    {groupFormInput.groupImage
                      ? groupFormInput.groupImage.name
                      : "No file chosen"}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Upload Cover</label>
              {groupFormInput.groupCover ? (
                <div className={styles.imagePreview}>
                  <img
                    src={URL.createObjectURL(groupFormInput.groupCover)}
                    alt="Selected Cover Image"
                  />
                  <button
                    className={styles.removeImageButton}
                    onClick={(e) => {
                      e.preventDefault();
                      setGroupFormInput({
                        ...groupFormInput,
                        groupCover: null,
                      });
                      setCoverInputKey(Date.now());
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className={styles.fileUpload}>
                  <input
                    key={coverInputKey}
                    type="file"
                    id="group-cover"
                    className={styles.fileInput}
                    name="groupCover"
                    onChange={handleCoverChange}
                    accept="image/*"
                  />
                  <label htmlFor="group-cover" className={styles.fileLabel}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="16"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        fill="#475569"
                        d="M10 0C6.834.025 3.933 2.153 3.173 5.536 1.232 6.352 0 8.194 0 10.376 0 13.385 2.376 16 5.312 16H6a1 1 0 1 0 0-2h-.688C3.526 14 2 12.321 2 10.375c0-1.493.934-2.734 2.344-3.156a.98.98 0 0 0 .687-.813C5.417 3.7 7.592 2.02 10 2c2.681-.02 5.021 2.287 5 5v1.094c0 .465.296.864.75.968C17.066 9.367 18 10.4 18 11.5c0 1.35-1.316 2.5-3 2.5h-1a1 1 0 0 0 0 2h1c2.734 0 5-1.983 5-4.5 0-1.815-1.215-3.42-3.013-4.115.002-.178.013-.359.013-.385.03-3.836-3.209-7.03-7-7m0 6L6.988 9.013 9 9v6a1 1 0 0 0 2 0V9l2.012.01z"
                      ></path>
                    </svg>
                    Choose Cover Image
                  </label>
                  <span className={styles.fileName}>
                    {groupFormInput.groupCover
                      ? groupFormInput.groupCover.name
                      : "No file chosen"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}
