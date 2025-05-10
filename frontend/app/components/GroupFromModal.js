import React, { useState } from "react";
import "../styles/FormModal.css";

export default function GroupFormModal({ onClose, user, onGroupCreated }) {
  const [groupFormInput, setGroupFormInput] = useState({
    user_id: user.id,
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

      const newGroup = {
        id: responseData.id || Date.now(),
        name: groupFormInput.name,
        description: groupFormInput.description,
        privacy: groupFormInput.privacy,
        creator: `${user.first_name} ${user.last_name}`,
        creator_id: user.id,
        created_at: "Just now",
        image: groupFormInput.groupImage
          ? URL.createObjectURL(groupFormInput.groupImage)
          : null,
        cover: groupFormInput.groupCover
          ? URL.createObjectURL(groupFormInput.groupCover)
          : null,
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create a new group</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="post-form" onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="group-name">Group Name</label>
              <input
                id="group-name"
                className="form-control"
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
            <div className="form-group">
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                className="form-control"
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
            <div className="form-group">
              <label htmlFor="group-privacy">Privacy</label>
              <select
                id="group-privacy"
                className="form-control"
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
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              {groupFormInput.groupImage ? (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(groupFormInput.groupImage)}
                    alt="Selected Group Image"
                  />
                  <button
                    className="remove-image-button"
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
                <div className="file-upload">
                  <input
                    key={imageInputKey}
                    type="file"
                    id="group-image"
                    className="file-input"
                    name="groupImage"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label htmlFor="group-image" className="file-label">
                    <img src="/icons/upload.svg" alt="" />
                    Choose Group Image
                  </label>
                  <span className="file-name">
                    {groupFormInput.groupImage
                      ? groupFormInput.groupImage.name
                      : "No file chosen"}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Upload Cover</label>
              {groupFormInput.groupCover ? (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(groupFormInput.groupCover)}
                    alt="Selected Cover Image"
                  />
                  <button
                    className="remove-image-button"
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
                <div className="file-upload">
                  <input
                    key={coverInputKey}
                    type="file"
                    id="group-cover"
                    className="file-input"
                    name="groupCover"
                    onChange={handleCoverChange}
                    accept="image/*"
                  />
                  <label htmlFor="group-cover" className="file-label">
                    <img src="/icons/upload.svg" alt="" />
                    Choose Cover Image
                  </label>
                  <span className="file-name">
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
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}
