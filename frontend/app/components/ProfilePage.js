"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const router = useRouter();
  console.log("Welcome:");
  async function handleProfile() {
    try {
      const response = await fetch("http://localhost:8404/profile?id=2", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("profile data: ", data);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:8404/session", {
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
        const response = await fetch("http://localhost:8404/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("data", data);
          setUserData(data);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
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

  const fetchUserPosts = async () => {
    if (userPosts.length > 0) return;

    setIsLoadingPosts(true);
    try {
      const response = await fetch("http://localhost:8404/user_posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("user posts data", data);
        setUserPosts(data || []);
      } else {
        console.error("Failed to fetch user posts");
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchFollowers = async () => {
    if (followers.length > 0) return;

    setIsLoadingFollowers(true);
    try {
      const response = await fetch("http://localhost:8404/followers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("followers data", data);
        setFollowers(data || []);
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
      const response = await fetch("http://localhost:8404/following", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

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

  const fetchGroups = async () => {
    if (groups.length > 0) return;

    setIsLoadingGroups(true);
    try {
      const response = await fetch("http://localhost:8404/groups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("groups data", data);
        setGroups(data || []);
      } else {
        console.error("Failed to fetch groups");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "posts") {
      fetchUserPosts();
    } else if (tab === "followers") {
      fetchFollowers();
    } else if (tab === "following") {
      fetchFollowing();
    } else if (tab === "groups") {
      fetchGroups();
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

  // Sample post data for demonstration (if no real data is available)
  const samplePosts = [
    {
      id: 1,
      title: "My First Post",
      content:
        "This is a sample post content. Your actual posts will appear here when you create them.",
      author: `${userData.first_name} ${userData.last_name}`,
      created_at: "3 days ago",
      privacy: "public",
      category: "Technology",
      image: "https://via.placeholder.com/500x300",
      total_likes: 24,
      total_comments: 8,
    },
    {
      id: 2,
      title: "Another Great Post",
      content: "Here's another sample post showing how your content will look.",
      author: `${userData.first_name} ${userData.last_name}`,
      created_at: "1 week ago",
      privacy: "private",
      category: "Health",
      total_likes: 15,
      total_comments: 3,
    },
    {
      id: 3,
      title: "Check Out This Photo",
      content: "I took this amazing photo yesterday. What do you think?",
      author: `${userData.first_name} ${userData.last_name}`,
      created_at: "2 weeks ago",
      privacy: "public",
      category: "Photography",
      image: "https://via.placeholder.com/500x300",
      total_likes: 42,
      total_comments: 12,
    },
  ];

  // Use real posts if available, otherwise use sample posts
  const postsToDisplay =
    userPosts.length > 0
      ? userPosts
      : userData.total_posts > 0
      ? samplePosts
      : [];

  return (
    <div className="app-container">
      <div className="profile-container">
        {/* Back button */}
        <button onClick={goToHome} className="back-button">
          <span className="back-arrow">←</span> Back to Home
        </button>

        {/* Profile Header */}
        <div className="profile-header">
          <div
            className="profile-cover"
            style={{
              backgroundImage: userData.cover
                ? `url(${userData.cover})`
                : "linear-gradient(135deg, #3555F9 0%, #6687FF 100%)",
            }}
          >
            <div className="profile-avatar-container">
              <img
                src={userData.avatar || "https://via.placeholder.com/150"}
                alt={`${userData.username || "User"}'s profile`}
                className="profile-avatar"
              />
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-details">
              <div>
                <h1 className="profile-name">{`${userData.first_name || ""} ${
                  userData.last_name || ""
                }`}</h1>
                <p className="profile-username">
                  @{userData.username || "username"}
                </p>
                <p className="profile-bio">
                  {userData.bio || "No bio provided yet."}
                </p>
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
            </div>
          </div>
        </div>

        {/* Profile Content */}
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
            <button
              className={`tab-button ${activeTab === "groups" ? "active" : ""}`}
              onClick={() => handleTabChange("groups")}
            >
              Groups
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "posts" &&
              (isLoadingPosts ? (
                <div className="loading-tab">
                  <div className="loading-spinner"></div>
                  <p>Loading posts...</p>
                </div>
              ) : postsToDisplay.length > 0 ? (
                <div className="posts-container">
                  {postsToDisplay.map((post) => (
                    <div key={post.id} className="post-card">
                      <div className="header">
                        <div className="post-header">
                          <img
                            src={
                              userData.avatar ||
                              "https://via.placeholder.com/50"
                            }
                            alt={post.author}
                            className="author-avatar"
                          />
                          <div className="author-info">
                            <h4 className="author-name">{post.author}</h4>
                            <div className="timestamp">
                              <img
                                src="./icons/created_at.svg"
                                alt="Created at"
                              />
                              <p
                                className="post-time"
                                style={{ color: "#B8C3E1", fontSize: "12px" }}
                              >
                                {post.created_at}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="post-privacy">
                          <img
                            src={`./icons/${post.privacy}.svg`}
                            width={"32px"}
                            height={"32px"}
                            alt={post.privacy}
                            className="privacy-icon"
                          />
                        </div>
                      </div>

                      <div className="post-content">
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-text">{post.content}</p>
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="post-image"
                          />
                        )}
                        <div className="post-category">{post.category}</div>
                      </div>
                      <div className="post-actions">
                        <div
                          className="action-like"
                          onClick={() => handleLike(post.id)}
                        >
                          <img src="/icons/like.svg" alt="Like" />
                          <p>{post.total_likes} Likes</p>
                        </div>
                        <div className="action-comment">
                          <img src="/icons/comment.svg" alt="Comment" />
                          <p>{post.total_comments} Comments</p>
                        </div>
                      </div>
                      <p className="see-post-link">See post &rarr;</p>
                    </div>
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
                    <div className="info-row">
                      <span className="info-label">Bio</span>
                      <span className="info-value">
                        {userData.bio || "No bio provided"}
                      </span>
                    </div>
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
                    {followers.length > 10 && <p>See all &rarr;</p>}
                  </div>
                  <ul className="user-list">
                    {followers.map((follower) => (
                      <li key={follower.id} className="user-item">
                        <img
                          src={
                            follower.avatar || "https://via.placeholder.com/50"
                          }
                          alt={follower.username}
                          className="user-avatar"
                        />
                        <div className="user-info">
                          <h4 className="user-name">{`${follower.first_name} ${follower.last_name}`}</h4>
                          <p className="user-username">@{follower.username}</p>
                        </div>
                        <button className="view-profile-btn">
                          View Profile
                        </button>
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
                    {following.length > 10 && <p>See all &rarr;</p>}
                  </div>
                  <ul className="user-list">
                    {following.map((user) => (
                      <li key={user.id} className="user-item">
                        <img
                          src={user.avatar || "https://via.placeholder.com/50"}
                          alt={user.username}
                          className="user-avatar"
                        />
                        <div className="user-info">
                          <h4 className="user-name">{`${user.first_name} ${user.last_name}`}</h4>
                          <p className="user-username">@{user.username}</p>
                        </div>
                        <button className="view-profile-btn">
                          View Profile
                        </button>
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
                    {/* If you don't have actual group data yet, you can use this placeholder */}
                    {[...Array(userData.total_groups)].map((_, index) => (
                      <li key={index} className="group-item">
                        <img
                          src={`https://via.placeholder.com/50?text=G${
                            index + 1
                          }`}
                          alt={`Group ${index + 1}`}
                          className="user-avatar"
                        />
                        <div className="user-info">
                          <h4 className="user-name">{`Group ${index + 1}`}</h4>
                          <p className="user-username">
                            {Math.floor(Math.random() * 50) + 5} members
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
