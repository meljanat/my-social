"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import PostsComponent from "@/app/components/PostsComponent";

import "../../styles/ProfilePage.css";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();

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
  console.log("Welcome:", id);

  function togglePicPreview(type = null) {
    setPicturePreview(type);
  }
  async function fetchSavedPosts() {
    try {
      const response = await fetch("http://localhost:8404/get_saved_posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("saved posts data", data);
        setIsLoadingSavedPosts(false);
        setSavedPosts(data.saved_posts || []);
      } else {
        console.error("Failed to fetch saved posts");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // async function handleProfile() {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:8404/profile?user_id=${id}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("profile data: ", data);
  //     }
  //   } catch (error) {
  //     console.error("Error logging out:", error);
  //   }
  // }

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
          `http://localhost:8404/profile?user_id=${id}`,
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
          console.log("data: ", data);
          setIsLoadingSavedPosts(true);
          setUserData(data);
          setUserPosts(data.Posts || []);
          setIsOwnProfile(data.ProfileInfo.role === "owner" || false);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (error) {
        console.log(error);
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

  const fetchFollowers = async () => {
    if (followers.length > 0) return;

    setIsLoadingFollowers(true);
    try {
      const response = await fetch(
        `http://localhost:8404/followers?user_id=${id}`,
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
        `http://localhost:8404/followers?user_id=${id}`,
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

    // if (tab === "posts") {
    //   fetchUserPosts();
    if (tab === "followers") {
      fetchFollowers();
    } else if (tab === "following") {
      fetchFollowing();
    } else if (tab === "saved") {
      fetchSavedPosts();
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
        <p className="error-message">{error}</p>
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
        <button onClick={goToHome} className="retry-button">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="profile-container">
        <button onClick={goToHome} className="back-button">
          <span className="back-arrow">←</span> Back to Home
        </button>

        <div className="profile-header">
          {/* Preview (shown if avatar or cover is clicked) */}
          {picturePreview && (
            <div
              className="picture-preview"
              onClick={() => togglePicPreview(null)}
            >
              <img
                src={
                  picturePreview === "cover"
                    ? userData.ProfileInfo.cover
                    : userData.ProfileInfo.avatar || "./inconnu/avatar.png"
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
              backgroundImage: userData.ProfileInfo.cover
                ? `url(${userData.ProfileInfo.cover})`
                : "linear-gradient(135deg, #3555F9 0%, #6687FF 100%)",
            }}
            onClick={() => togglePicPreview("cover")}
          >
            <div
              className="profile-avatar-container"
              onClick={(e) => {
                e.stopPropagation();
                togglePicPreview("avatar");
              }}
            >
              <img
                src={userData.ProfileInfo.avatar || "./inconnu/avatar.png"}
                alt={`${userData.ProfileInfo.username || "User"}'s profile`}
                className="profile-avatar"
              />
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-details">
              <div>
                <h1 className="profile-name">{`${
                  userData.ProfileInfo.first_name || ""
                } ${userData.ProfileInfo.last_name || ""}`}</h1>
                <p className="profile-username">
                  @{userData.ProfileInfo.username || "username"}
                </p>
                <p className="profile-bio">
                  {userData.ProfileInfo.bio || "No bio provided yet."}
                </p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">
                  {userData.ProfileInfo.total_posts || 0}
                </span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">
                  {userData.ProfileInfo.total_followers || 0}
                </span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">
                  {userData.ProfileInfo.total_following || 0}
                </span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-value">
                  {userData.ProfileInfo.total_likes || 0}
                </span>
                <span className="stat-label">Likes</span>
              </div>
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
              ) : userPosts.length > 0 ? (
                <div className="posts-modern-layout">
                  {userPosts.map((post) => (
                    <PostsComponent key={post.id} post={post} />
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
                        userData.ProfileInfo.first_name || ""
                      } ${userData.ProfileInfo.last_name || ""}`}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Username</span>
                      <span className="info-value">
                        @{userData.ProfileInfo.username || ""}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email</span>
                      <span className="info-value">
                        {userData.ProfileInfo.email || "Not provided"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date of Birth</span>
                      <span className="info-value">
                        {formatDate(userData.ProfileInfo.date_of_birth)}
                      </span>
                    </div>
                    {/* <div className="info-row"> */}
                    {/* <span className="info-label">Bio</span>
                      <span className="info-value">
                        {userData.ProfileInfo.bio || "No bio provided"}
                      </span> */}
                    {/* </div> */}
                    <div className="info-row">
                      <span className="info-label">Privacy</span>
                      <span className="info-value">
                        {userData.ProfileInfo.privacy
                          ? userData.ProfileInfo.privacy
                              .charAt(0)
                              .toUpperCase() +
                            userData.ProfileInfo.privacy.slice(1)
                          : "Public"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Joined</span>
                      <span className="info-value">
                        {formatDate(userData.ProfileInfo.created_at)}
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
                        {userData.ProfileInfo.total_posts || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Followers</span>
                      <span className="info-value">
                        {userData.ProfileInfo.total_followers || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Following</span>
                      <span className="info-value">
                        {userData.ProfileInfo.total_following || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Likes</span>
                      <span className="info-value">
                        {userData.ProfileInfo.total_likes || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Comments</span>
                      <span className="info-value">
                        {userData.ProfileInfo.total_comments || 0}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Groups</span>
                      <span className="info-value">
                        {userData.ProfileInfo.total_groups || 0}
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
                    onClick={() => setActiveSubTab("posts")}
                  >
                    Saved Posts
                  </button>
                  <button
                    className={`saved-tab-button ${
                      activeSubTab === "group-posts" ? "active" : ""
                    }`}
                    onClick={() => setActiveSubTab("group-posts")}
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
                        <PostsComponent key={post.id} post={post} />
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
                        <PostsComponent key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon bookmark">👥🔖</div>
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
                      <li key={follower.id} className="user-item">
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
                          href={`/profile/${follower.id}`}
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
                      <li key={user.id} className="user-item">
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
                          href={`/profile/${user.id}`}
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
              ) : userData.ProfileInfo.total_groups > 0 ? (
                <div className="users-section">
                  <div className="users-header">
                    <h3>Your Groups</h3>
                    {groups.length > 10 && <p>See all &rarr;</p>}
                  </div>
                  <ul className="group-list">
                    {groups.map((group) => (
                      <li key={group.id} className="group-item">
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
    </div>
  );
}

// /////////////////////////////////////////////////////////////////////////////////////////
