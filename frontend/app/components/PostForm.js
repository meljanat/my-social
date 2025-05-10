import { useState, useEffect } from "react";
import "../styles/PostFormStyle.css";

export default function PostForm() {
  const [showModal, setShowModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [postFormInput, setPostFormInput] = useState({
    title: "",
    content: "",
    privacy: "",
    category: "technology",
    postImage: null,
  });
  const [imageInputKey, setImageInputKey] = useState(Date.now());

  useEffect(() => {
    if (showModal && postFormInput.privacy === "almost-private") {
      fetchFollowers();
    }
  }, [showModal, postFormInput.privacy]);

  const fetchFollowers = async () => {
    try {
      const response = await fetch("http://localhost:8404/followers", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers || []);
      } else {
        console.error("Failed to fetch followers");
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setPostFormInput({
      ...postFormInput,
      postImage: file,
    });
  };

  const toggleFollowerSelection = (followerId) => {
    setSelectedFollowers((prev) => {
      if (prev.includes(followerId)) {
        return prev.filter((id) => id !== followerId);
      } else {
        return [...prev, followerId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const fieldsToInclude = ["title", "content", "privacy", "category"];

    fieldsToInclude.forEach((field) => {
      formData.append(field, postFormInput[field]);
    });

    if (
      postFormInput.privacy === "almost-private" &&
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

      console.log("Post created successfully");
      setPostFormInput({
        title: "",
        content: "",
        privacy: "",
        category: "technology",
        postImage: null,
      });
      setSelectedFollowers([]);
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="post-form-container">
      <button
        className="create-post-btn"
        onClick={() => setShowModal(true)}
        style={{
          backgroundColor: "rgb(174, 0, 255)",
          width: "150px",
          height: "32px",
          border: "none",
          color: "white",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Create Post
      </button>

      {showModal && (
        <div className="post-modal-overlay">
          <div className="post-modal">
            <div className="post-modal-header">
              <h3 style={{ color: "#18151b" }}>Create a new Post</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form className="create-post-form" onSubmit={handleSubmit}>
              <div className="form-div">
                <div className="title-input">
                  <label>Title</label>
                  <input
                    placeholder="Enter post title"
                    required
                    value={postFormInput.title}
                    onChange={(e) => {
                      setPostFormInput({
                        ...postFormInput,
                        title: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="content-input">
                  <label>Content</label>
                  <textarea
                    placeholder="What's on your mind?"
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

                <div className="image-input">
                  <label>Upload Image</label>
                  {postFormInput.postImage && (
                    <div className="image-preview">
                      <img
                        style={{
                          width: "150px",
                          borderRadius: "8px",
                          marginBottom: "10px",
                        }}
                        src={URL.createObjectURL(postFormInput.postImage)}
                        alt="Selected"
                      />
                      <button
                        className="remove-image-btn"
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
                  )}
                  <input
                    key={imageInputKey}
                    type="file"
                    name="postImage"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="category-input">
                  <label>Category</label>
                  <select
                    value={postFormInput.category}
                    onChange={(e) => {
                      setPostFormInput({
                        ...postFormInput,
                        category: e.target.value,
                      });
                    }}
                  >
                    <option value="technology">Technology</option>
                    <option value="sport">Sport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="privacy-input">
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
                        value="almost-private"
                        name="privacy"
                        checked={postFormInput.privacy === "almost-private"}
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

                {postFormInput.privacy === "almost-private" && (
                  <div className="audience-selector">
                    <label>Select Audience</label>
                    <div className="followers-list">
                      {followers.length > 0 ? (
                        followers.map((follower) => (
                          <label key={follower.id} className="follower-item">
                            <input
                              type="checkbox"
                              checked={selectedFollowers.includes(follower.id)}
                              onChange={() =>
                                toggleFollowerSelection(follower.id)
                              }
                            />
                            <span>{follower.username}</span>
                          </label>
                        ))
                      ) : (
                        <p>No followers found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="publish-btn"
                style={{
                  backgroundColor: "rgb(174, 0, 255)",
                  width: "150px",
                  height: "32px",
                  border: "none",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginTop: "20px",
                }}
              >
                Publish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
