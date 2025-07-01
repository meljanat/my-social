import { useState, useEffect } from "react";
import styles from "../styles/PostFormStyle.module.css";

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
    <div className={styles.postFormContainer}>
      <button
        className={styles.createPostBtn}
        onClick={() => setShowModal(true)}
      >
        Create Post
      </button>

      {showModal && (
        <div className={styles.postModalOverlay}>
          <div className={styles.postModal}>
            <div className={styles.postModalHeader}>
              <h3>Create a new Post</h3>
              <button
                className={styles.closeModalBtn}
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form className={styles.createPostForm} onSubmit={handleSubmit}>
              <div className={styles.formDiv}>
                <div className={styles.titleInput}>
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

                <div className={styles.contentInput}>
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

                <div className={styles.imageInput}>
                  <label>Upload Image</label>
                  {postFormInput.postImage && (
                    <div className={styles.imagePreview}>
                      <img
                        src={URL.createObjectURL(postFormInput.postImage)}
                        alt="Selected"
                      />
                      <button
                        className={styles.removeImageBtn}
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
                    accept="image/*"
                  />
                </div>

                <div className={styles.categoryInput}>
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

                <div className={styles.privacyInput}>
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
                  <div className={styles.audienceSelector}>
                    <label>Select Audience</label>
                    <div className={styles.followersList}>
                      {followers.length > 0 ? (
                        followers.map((follower) => (
                          <label
                            key={follower.id}
                            className={styles.followerItem}
                          >
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

              <button type="submit" className={styles.publishBtn}>
                Publish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
