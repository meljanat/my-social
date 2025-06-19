"use client";
import { useState, useEffect } from "react";
import "../styles/ProfileCard.css";
export default function PostFormModal({
  onClose,
  // user,
  onPostCreated,
  group_id,
}) {
  const [postFormInput, setPostFormInput] = useState({
    title: "",
    content: "",
    categoryId: 0,
    postImage: null,
  });
  //   console.log("groupid: ", group_id);

  const [imageInputKey, setImageInputKey] = useState(Date.now());
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8404/new_post_group?group_id=${group_id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        if (data && Array.isArray(data)) {
          setCategories(data);

          if (data.length > 0) {
            setPostFormInput((prev) => ({
              ...prev,
              categoryId: data[0].category_id,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("group_id", group_id);
    formData.append("title", postFormInput.title);
    formData.append("content", postFormInput.content);
    formData.append("privacy", postFormInput.privacy);
    formData.append("category", postFormInput.categoryId.toString());
    if (postFormInput.postImage) {
      formData.append("postImage", postFormInput.postImage);
    }

    try {
      const response = await fetch("http://localhost:8404/new_post_group", {
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
        // author: `${user.first_name} ${user.last_name}`,
        // author_id: user.id,
        created_at: "Just now",
        category:
          categories.find((c) => c.category_id === postFormInput.categoryId)
            ?.name || "",
        total_likes: 0,
        total_comments: 0,
        image: postFormInput.postImage
          ? URL.createObjectURL(postFormInput.postImage)
          : null,
        // avatar: user.avatar || "avatar.jpg",
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
                onClick={fetchCategories}
                onChange={(e) => {
                  //   fetchCategories();
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
