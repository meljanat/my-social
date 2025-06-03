"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import PostsComponent from "@/app/components/PostsComponent";
import EditProfileModal from "@/app/components/EditProfileModal";

import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFollowing, setIsFollowing] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoadingSavedPosts, setIsLoadingSavedPosts] = useState(false);
  const [picturePreview, setPicturePreview] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("posts");
  const [savedGroupPosts, setSavedGroupPosts] = useState([]);
  const [isLoadingSavedGroupPosts, setIsLoadingSavedGroupPosts] =
    useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  console.log("Welcome:", id);

  function togglePicPreview(type = null) {
    setPicturePreview(type);
  }
  const handleProfileUpdate = (updatedData) => {
    setUserData({
      ...userData,
      ...updatedData,
    });
  };

  async function handleFollow(user_id) {
    console.log(`Following user Id: ${user_id}`);
    try {
      const response = await fetch(`http://localhost:8404/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: parseInt(user_id),
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const actionType = data;
        const type = document.querySelector(".request-cancel-btn")?.textContent;

        setUserData((prev) => {
          let newFollowers = prev.total_followers;

          if (actionType === "follow") {
            newFollowers -= 1;
          } else if (actionType === "unfollow" && type !== "Pending") {
            newFollowers += 1;
          }

          return {
            ...prev,
            type: actionType,
            total_followers: newFollowers,
          };
        });

        //   setUserData((prev) => {
        //   let newFollowers = prev.total_followers;
        //   let isFollowing = prev.is_following;
        //   let isPending = prev.is_pending;

        //   if (actionType === "follow") {
        //     isFollowing = true;
        //     isPending = false;
        //     newFollowers += 1;
        //   } else if (actionType === "unfollow") {
        //     isFollowing = false;
        //     isPending = false;
        //     newFollowers -= 1;
        //   } else if (actionType === "cancel") {
        //     isPending = false;
        //   }

        //   return {
        //     ...prev,
        //     type: actionType,
        //     is_following: isFollowing,
        //     is_pending: isPending,
        //     total_followers: newFollowers,
        //   };
        // });

        console.log("Follow action successful:", actionType);
      }

      fetchUserPosts();
    } catch (error) {
      console.error("Error following user:", error);
    }
  }

  async function fetchSavedPosts(type) {
    try {
      const response = await fetch(
        `http://localhost:8404/get_saved_posts?type=${type}&offset=0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("saved posts data", data);
        setIsLoadingSavedPosts(false);
        setSavedPostsis_follower(data || []);
      } else {
        console.error("Failed to fetch saved posts");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:8404/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data === true);
          return data === true;
        } else {
          setIsLoggedIn(false);
          return false;
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
        return false;
      }
    };

    const fetchHomeData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8404/profile?user_id=${id}&offset=0`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          const data = await response.json();
          console.log("Errror: ", data);
        }
        if (response.ok) {
          const data = await response.json();
          console.log("data: ", data);
          setIsLoadingSavedPosts(true);
          setUserData(data);
          fetchUserPosts();
          // setUserPosts(data.Posts || []);
          setIsOwnProfile(data.role === "owner" || false);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (error) {
        console.log("Erooooor: ", error);
        setError("Network error while fetching user data");
      } finally {
        setIsLoading(false);
      }
    };

    const initPage = async () => {
      const loggedIn = await checkLoginStatus();
      if (loggedIn) {
        await fetchHomeData();
      } else {
        router.push("/");
        setIsLoading(false);
      }
    };

    initPage();
  }, [router]);

  // const fetchUserPosts = async () => {
  //   if (userPosts.length > 0) return;

  //   setIsLoadingPosts(true);
  //   try {
  //     const response = await fetch("http://localhost:8404/posts", {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("user posts data", data);
  //       setUserPosts(data || []);
  //     } else {
  //       console.error("Failed to fetch user posts");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user posts:", error);
  //   } finally {
  //     setIsLoadingPosts(false);
  //   }
  // };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:8404/profile_posts?user_id=${id}&offset=0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        const dataError = await response.json();
        console.log(dataError);
        throw new Error(dataError || "Failed to fetch Posts");
      }
      const data = await response.json();
      console.log(data);
      setUserPosts(data);
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };

  const fetchFollowers = async () => {
    if (followers.length > 0) return;

    setIsLoadingFollowers(true);
    try {
      const response = await fetch(
        `http://localhost:8404/followers?user_id=${id}&offset=0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFollowers(data || []);
        console.log("followers data", data);
        console.log("Teeeeeeeeeeeeest: ");
      } else {
        console.error("Failed to fetch followers");
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const fetchFollowing = async () => {
    if (following.length > 0) return;

    setIsLoadingFollowing(true);
    try {
      const response = await fetch(
        `http://localhost:8404/following?user_id=${id}&offset=0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("following data", data);
        setFollowing(data || []);
      } else {
        console.error("Failed to fetch following");
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  // const fetchGroups = async () => {
  //   if (groups.length > 0) return;

  //   setIsLoadingGroups(true);
  //   try {
  //     const response = await fetch("http://localhost:8404/groups", {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("groups data", data);
  //       setGroups(data || []);
  //     } else {
  //       console.error("Failed to fetch groups");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching groups:", error);
  //   } finally {
  //     setIsLoadingGroups(false);
  //   }
  // };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "posts") {
      fetchUserPosts();
    } else if (tab === "followers") {
      fetchFollowers();
    } else if (tab === "following") {
      fetchFollowing();
    } else if (tab === "saved") {
      fetchSavedPosts("post");
    }
  };

  const goToHome = () => {
    router.push("/");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLike = (postID) => {
    console.log("You liked post: ", postID);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your profile...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h2 className="error-title">Error loading profile</h2>
        <p className="error-message">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="error-container">
        <h2 className="error-title">Profile not found</h2>
        <p className="error-message">
          We couldn't find your profile information.
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="profile-container">
        <div className="profile-header">
          {picturePreview && (
            <div
              className="picture-preview"
              onClick={() => togglePicPreview(null)}
            >
              <img
                src={
                  picturePreview === "cover"
                    ? userData.cover
                    : userData.avatar || "/inconnu/avatar.png"
                }
                alt={picturePreview}
                className="cover-preview"
              />
              <button
                className="close-preview"
                onClick={() => togglePicPreview(null)}
              >
                &times;
              </button>
            </div>
          )}

          <div
            className="profile-cover"
            style={{
              backgroundImage: userData.cover
                ? `url(${userData.cover})`
                : "linear-gradient(135deg, #3555F9 0%, #6687FF 100%)",
            }}
            onClick={() => togglePicPreview("cover")}
          >
            {/* <div className="profile-status-badge">
              {userData.online ? (
                <span className="status-online">Online</span>
              ) : (
                <span className="status-offline">Offline</span>
              )}
            </div> */}

            <div
              className="profile-avatar-container"
              onClick={(e) => {
                e.stopPropagation();
                togglePicPreview("avatar");
              }}
            >
              <img
                src={userData.avatar || "/inconnu/avatar.png"}
                alt={`${userData.username || "User"}'s profile`}
                className="profile-avatar"
              />
              {/* {userData.role === "owner" && (
                <div className="avatar-badge" title="Profile Owner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="#fff"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              )} */}
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-details">
              <div>
                <div className="profile-status-badge">
                  {userData.online ? (
                    <span className="status-online">Online</span>
                  ) : (
                    <span className="status-offline">Offline</span>
                  )}
                </div>
                <h1 className="profile-name">{`${userData.first_name || ""} ${
                  userData.last_name || ""
                }`}</h1>
                <p className="profile-username">
                  @{userData.username || "username"}
                  {userData.privacy === "private" && (
                    <span className="privacy-badge" title="Private Profile">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                      >
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6 0 1.2.6 1.2 1.2v3.5c0 .7-.6 1.3-1.2 1.3h-5.5c-.7 0-1.3-.6-1.3-1.2v-3.5c0-.7.6-1.3 1.2-1.3V9.5C9.2 8.1 10.6 7 12 7zm0 1.2c-.8 0-1.5.7-1.5 1.5V11h3v-1.3c0-.8-.7-1.5-1.5-1.5z" />
                      </svg>
                    </span>
                  )}
                  {userData.privacy === "public" && (
                    <span className="privacy-badge" title="Private Profile">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 32 32"
                      >
                        <path
                          fill="#000"
                          fillRule="evenodd"
                          d="M13 0c-2.829 0-5.45.905-7.584 2.44A12.98 12.98 0 0 0 .044 14.082C.595 20.756 6.184 26 13 26c2.829 0 5.45-.905 7.584-2.44A12.98 12.98 0 0 0 26 13q0-1.107-.18-2.165C24.79 4.685 19.442 0 13 0M7.024 3.763c.145.869.94 1.585 1.976 1.585h.5c1.89 0 3.5 1.477 3.5 3.391s-1.61 3.391-3.5 3.391h-1c-.257 0-.639.244-.999.873C6.813 14.205 5.493 15 4 15H2.181c.94 5.12 5.427 9 10.819 9 2.215 0 4.275-.654 6-1.779V22a2 2 0 0 0-2-2h-.5a3.5 3.5 0 1 1 0-7h1c.11 0 .255-.044.444-.206.194-.166.384-.417.546-.713A4 4 0 0 1 22 10h1.586C22.281 5.383 18.035 2 13 2c-2.205 0-4.256.648-5.976 1.763"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </span>
                  )}
                </p>
                <p className="profile-bio">
                  {userData.bio || "No bio provided yet."}
                </p>
                <p className="profile-joined">
                  <span className="joined-icon">📅</span> Joined{" "}
                  {formatDate(userData.created_at)}
                </p>
              </div>

              <div className="profile-actions">
                {userData.role === "owner" ? (
                  <button
                    className="edit-profile-btn"
                    onClick={() => setShowEditModal(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <button
                    className={
                      userData.is_following
                        ? "unfollow-btn"
                        : userData.is_pending
                        ? "request-cancel-btn"
                        : "follow-btn"
                    }
                    onClick={() => handleFollow(id)}
                  >
                    {userData.is_following
                      ? "Unfollow"
                      : userData.is_pending
                      ? "Pending"
                      : "Follow"}
                  </button>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{userData.total_posts || 0}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">
                  {userData.total_followers || 0}
                </span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">
                  {userData.total_following || 0}
                </span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">{userData.total_likes || 0}</span>
                <span className="stat-label">Likes</span>
              </div>
              {userData.total_groups > 0 && (
                <>
                  <div className="stat-divider"></div>
                  <div className="stat">
                    <span className="stat-value">{userData.total_groups}</span>
                    <span className="stat-label">Groups</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => handleTabChange("posts")}
            >
              Posts
            </button>
            <button
              className={`tab-button ${activeTab === "about" ? "active" : ""}`}
              onClick={() => handleTabChange("about")}
            >
              About
            </button>
            <button
              className={`tab-button ${
                activeTab === "followers" ? "active" : ""
              }`}
              onClick={() => handleTabChange("followers")}
            >
              Followers
            </button>
            <button
              className={`tab-button ${
                activeTab === "following" ? "active" : ""
              }`}
              onClick={() => handleTabChange("following")}
            >
              Following
            </button>
            {isOwnProfile && (
              <button
                className={`tab-button ${
                  activeTab === "saved" ? "active" : ""
                }`}
                onClick={() => handleTabChange("saved")}
              >
                Saved Posts
              </button>
            )}
          </div>

          <div className="tab-content">
            {activeTab === "posts" &&
              (isLoadingPosts ? (
                <div className="loading-tab">
                  <div className="loading-spinner"></div>
                  <p>Loading posts...</p>
                </div>
              ) : userPosts && userPosts.length > 0 ? (
                <div className="posts-modern-layout">
                  {userPosts.map((post) => (
                    <PostsComponent
                      key={post.post_id}
                      post={post}
                      setPosts={setUserPosts}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📝</div>
                  <h3 className="empty-state-title">No posts yet</h3>
                  <p className="empty-state-text">
                    When you create posts, they will appear here.
                  </p>
                </div>
              ))}

            {activeTab === "about" && (
              <div className="about-section">
                <div className="about-item">
                  <h3 className="about-item-title">Personal Information</h3>
                  <div className="about-item-content">
                    <div className="info-row">
                      <span className="info-label">Full Name</span>
                      <span className="info-value">{`${
                        userData.first_name || ""
                      } ${userData.last_name || ""}`}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Username</span>
                      <span className="info-value">
                        @{userData.username || ""}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email</span>
                      <span className="info-value">
                        {userData.email || "Not provided"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date of Birth</span>
                      <span className="info-value">
                        {formatDate(userData.date_of_birth)}
                      </span>
                    </div>
                    {/* <div className="info-row"> */}
                    {/* <span className="info-label">Bio</span>
                      <span className="info-value">
                        {userData.bio || "No bio provided"}
                      </span> */}
                    {/* </div> */}
                    <div className="info-row">
                      <span className="info-label">Privacy</span>
                      <span className="info-value">
                        {userData.privacy
                          ? userData.privacy.charAt(0).toUpperCase() +
                            userData.privacy.slice(1)
                          : "Public"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Joined</span>
                      <span className="info-value">
                        {formatDate(userData.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="about-item">
                  <h3 className="about-item-title">Activity Statistics</h3>
                  <div className="about-item-content">
                    <div className="info-row">
                      <span className="info-label">Total Posts</span>
                      <span className="info-value">
                        {userData.total_posts || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Followers</span>
                      <span className="info-value">
                        {userData.total_followers || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Following</span>
                      <span className="info-value">
                        {userData.total_following || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Likes</span>
                      <span className="info-value">
                        {userData.total_likes || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Comments</span>
                      <span className="info-value">
                        {userData.total_comments || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Groups</span>
                      <span className="info-value">
                        {userData.total_groups || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "saved" && isOwnProfile && (
              <div className="saved-content-container">
                <div className="saved-tabs">
                  <button
                    className={`saved-tab-button ${
                      activeSubTab === "posts" ? "active" : ""
                    }`}
                    onClick={() => {
                      fetchSavedPosts("post");

                      setActiveSubTab("posts");
                    }}
                  >
                    Saved Posts
                  </button>
                  <button
                    className={`saved-tab-button ${
                      activeSubTab === "group-posts" ? "active" : ""
                    }`}
                    onClick={() => {
                      fetchSavedPosts("group");
                      setActiveSubTab("group-posts");
                    }}
                  >
                    Saved Group Posts
                  </button>
                </div>

                {activeSubTab === "posts" &&
                  (isLoadingSavedPosts ? (
                    <div className="loading-tab">
                      <div className="loading-spinner"></div>
                      <p>Loading saved posts...</p>
                    </div>
                  ) : savedPosts.length > 0 ? (
                    <div className="posts-container">
                      {savedPosts.map((post) => (
                        <PostsComponent
                          key={post.post_id}
                          post={post}
                          setPosts={setUserPosts}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon bookmark">🔖</div>
                      <h3 className="empty-state-title">No saved posts yet</h3>
                      <p className="empty-state-text">
                        When you save posts you like, they will appear here for
                        quick access later.
                      </p>
                      <button className="create-post-button" onClick={goToHome}>
                        Browse Posts
                      </button>
                    </div>
                  ))}

                {activeSubTab === "group-posts" &&
                  (isLoadingSavedGroupPosts ? (
                    <div className="loading-tab">
                      <div className="loading-spinner"></div>
                      <p>Loading saved group posts...</p>
                    </div>
                  ) : savedGroupPosts.length > 0 ? (
                    <div className="posts-container">
                      {savedGroupPosts.map((post) => (
                        <PostsComponent key={post.post_id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon bookmark">🔖</div>
                      <h3 className="empty-state-title">
                        No saved group posts yet
                      </h3>
                      <p className="empty-state-text">
                        When you save posts from groups, they will appear here
                        for quick access later.
                      </p>
                      <button className="create-post-button" onClick={goToHome}>
                        Browse Groups
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === "followers" &&
              (isLoadingFollowers ? (
                <div className="loading-tab">
                  <div className="loading-spinner"></div>
                  <p>Loading followers...</p>
                </div>
              ) : followers.length > 0 ? (
                <div className="users-section">
                  <div className="users-header">
                    <h3>People who follow you</h3>
                    {/* {followers.length > 10 && <p>See all &rarr;</p>} */}
                  </div>
                  <ul className="user-list">
                    {followers.map((follower) => (
                      <li key={follower.user_id} className="user-item">
                        <img
                          src={follower.avatar || "./inconnu/avatar.png"}
                          alt={follower.username}
                          className="user-avatar"
                        />
                        <div className="user-info">
                          <h4 className="user-name">{`${follower.first_name} ${follower.last_name}`}</h4>
                          <p className="user-username">@{follower.username}</p>
                        </div>
                        <a
                          href={`/profile/${follower.user_id}`}
                          className="profile-link"
                        >
                          <button className="view-profile-btn">
                            View Profile
                          </button>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <h3 className="empty-state-title">No followers yet</h3>
                  <p className="empty-state-text">
                    When people follow you, they will appear here.
                  </p>
                </div>
              ))}

            {activeTab === "following" &&
              (isLoadingFollowing ? (
                <div className="loading-tab">
                  <div className="loading-spinner"></div>
                  <p>Loading following...</p>
                </div>
              ) : following.length > 0 ? (
                <div className="users-section">
                  <div className="users-header">
                    <h3>People you follow</h3>
                    {/* {following.length > 10 && <p>See all &rarr;</p>} */}
                  </div>
                  <ul className="user-list">
                    {following.map((user) => (
                      <li key={user.user_id} className="user-item">
                        <img
                          src={user.avatar || "./inconnu/avatar.png"}
                          alt={user.username}
                          className="user-avatar"
                        />
                        <div className="user-info">
                          <h4 className="user-name">{`${user.first_name} ${user.last_name}`}</h4>
                          <p className="user-username">@{user.username}</p>
                        </div>
                        <a
                          href={`/profile/${user.user_id}`}
                          className="profile-link"
                        >
                          <button className="view-profile-btn">
                            View Profile
                          </button>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">👤</div>
                  <h3 className="empty-state-title">
                    Not following anyone yet
                  </h3>
                  <p className="empty-state-text">
                    When you follow people, they will appear here.
                  </p>
                </div>
              ))}

            {activeTab === "groups" &&
              (isLoadingGroups ? (
                <div className="loading-tab">
                  <div className="loading-spinner"></div>
                  <p>Loading groups...</p>
                </div>
              ) : userData.total_groups > 0 ? (
                <div className="users-section">
                  <div className="users-header">
                    <h3>Your Groups</h3>
                    {groups.length > 10 && <p>See all &rarr;</p>}
                  </div>
                  <ul className="group-list">
                    {groups.map((group) => (
                      <li key={group.group_id} className="group-item">
                        <img
                          src={group.image}
                          alt={group.name}
                          className="user-avatar"
                        />
                        <div className="user-info">
                          <h4 className="user-name">{group.name}</h4>
                          <p className="user-username">
                            {group.total_members} members
                          </p>
                        </div>
                        <button className="view-group-btn">View Group</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <h3 className="empty-state-title">No groups yet</h3>
                  <p className="empty-state-text">
                    When you join or create groups, they will appear here.
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
      {showEditModal && (
        <EditProfileModal
          user={userData}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}
