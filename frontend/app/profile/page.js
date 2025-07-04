"use client";
import { useState, useEffect } from "react";
import AuthForm from "../components/AuthForm";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import PostsComponent from "@/app/components/PostsComponent";
import EditProfileModal from "@/app/components/EditProfileModal";
import styles from "../styles/ProfilePage.module.css";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState();
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
          setIsLoggedIn(data);
        }
      } catch (error) {
        console.log("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [isLoggedIn]);

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
        console.log("Follow response data:", data);


        setUserData((prev) => {
          return {
            ...prev,
            type: data.action,
            total_followers: data.total_followers,
            
          };
        });
      }
      fetchUserPosts();
    } catch (error) {
      console.error("Error following user:", error);
    }
  }

  async function fetchSavedPosts(type) {
    if (type === "post") setIsLoadingSavedPosts(true);
    else if (type === "group") setIsLoadingSavedGroupPosts(true);

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
        if (type === "post") {
          setSavedPosts(data || []);
        } else if (type === "group") {
          setSavedGroupPosts(data || []);
        }
      } else {
        console.error("Failed to fetch saved posts");
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (type === "post") setIsLoadingSavedPosts(false);
      else if (type === "group") setIsLoadingSavedGroupPosts(false);
    }
  }

  useEffect(() => {
    const fetchUserData = async (id) => {
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
          setError(data.error || "Failed to fetch user data");
        } else {
          const data = await response.json();
          console.log("user data:", data);
          setUserData(data);
          setIsOwnProfile(data.role === "owner");
          fetchUserPosts();
        }
      } catch (error) {
        setError("Network error while fetching user data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData(id);
  }, [id]);

  const fetchUserPosts = async () => {
    setIsLoadingPosts(true);
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
        throw new Error(dataError.error || "Failed to fetch Posts");
      }
      const data = await response.json();
      setUserPosts(data);
    } catch (error) {
      console.log(error);
      setError(error);
    } finally {
      setIsLoadingPosts(false);
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
      setActiveSubTab("posts");
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
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }
  if (!isLoggedIn) {
    return <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }



  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>!</div>
        <h2 className={styles.errorTitle}>Error loading profile</h2>
        <p className={styles.errorMessage}>{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.errorContainer}>
        <h2 className={styles.errorTitle}>Profile not found</h2>
        <p className={styles.errorMessage}>
          We couldn't find your profile information.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          {picturePreview && (
            <div
              className={styles.picturePreview}
              onClick={() => togglePicPreview(null)}
            >
              <img
                src={
                  picturePreview === "cover"
                    ? userData.cover
                    : userData.avatar || "/inconnu/avatar.png"
                }
                alt={picturePreview}
                className={styles.coverPreview}
              />
              <button
                className={styles.closePreview}
                onClick={() => togglePicPreview(null)}
              >
                &times;
              </button>
            </div>
          )}

          <div
            className={styles.profileCover}
            style={{
              backgroundImage: userData.cover
                ? `url(${userData.cover})`
                : "linear-gradient(135deg, #3555F9 0%, #6687FF 100%)",
            }}
            onClick={() => togglePicPreview("cover")}
          >
            <div
              className={styles.profileAvatarContainer}
              onClick={(e) => {
                e.stopPropagation();
                togglePicPreview("avatar");
              }}
            >
              <img
                src={userData.avatar || "/inconnu/avatar.png"}
                alt={`${userData.username || "User"}'s profile`}
                className={styles.profileAvatar}
              />
            </div>
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.profileDetails}>
              <div>
                {userData.role !== "owner" &&
                  <div className={styles.profileStatusBadge}>
                    {userData.online ? (
                      <span className={styles.statusOnline}>Online</span>
                    ) : (
                      <span className={styles.statusOffline}>Offline</span>
                    )}
                  </div>
                }
                <h1 className={styles.profileName}>{`${userData.first_name || ""
                  } ${userData.last_name || ""}`}</h1>
                <p className={styles.profileUsername}>
                  @{userData.username || "username"}
                  {userData.privacy === "private" && (
                    <span
                      className={styles.privacyBadge}
                      title="Private Profile"
                    >
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
                    <span
                      className={styles.privacyBadge}
                      title="Public Profile"
                    >
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
                <p className={styles.profileBio}>
                  {userData.bio || "No bio provided yet."}
                </p>
                <p className={styles.profileJoined}>
                  <span className={styles.joinedIcon}>📅</span> Joined{" "}
                  {formatDate(userData.created_at)}
                </p>
              </div>

              <div className={styles.profileActions}>
                {userData.role === "owner" ? (
                  <button
                    className={styles.editProfileBtn}
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
                      userData.type === "Pending" ?
                        styles.requestCancelBtn
                        : userData.type === "Unfollow" ?
                          styles.unfollowBtn
                          : styles.followBtn
                    }
                    onClick={() => handleFollow(id)}
                  >
                    {userData.type}
                  </button>
                )}
              </div>
            </div>

            <div className={styles.profileStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {userData.total_posts || 0}
                </span>
                <span className={styles.statLabel}>Posts</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {userData.total_followers || 0}
                </span>
                <span className={styles.statLabel}>Followers</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {userData.total_following || 0}
                </span>
                <span className={styles.statLabel}>Following</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {userData.total_likes || 0}
                </span>
                <span className={styles.statLabel}>Likes</span>
              </div>
              {userData.total_groups > 0 && (
                <>
                  <div className={styles.statDivider}></div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>
                      {userData.total_groups}
                    </span>
                    <span className={styles.statLabel}>Groups</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.profileContent}>
          <div className={styles.profileTabs}>
            <button
              className={`${styles.tabButton} ${activeTab === "posts" ? styles.active : ""
                }`}
              onClick={() => handleTabChange("posts")}
            >
              Posts
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "about" ? styles.active : ""
                }`}
              onClick={() => handleTabChange("about")}
            >
              About
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "followers" ? styles.active : ""
                }`}
              onClick={() => handleTabChange("followers")}
            >
              Followers
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "following" ? styles.active : ""
                }`}
              onClick={() => handleTabChange("following")}
            >
              Following
            </button>
            {isOwnProfile && (
              <button
                className={`${styles.tabButton} ${activeTab === "saved" ? styles.active : ""
                  }`}
                onClick={() => handleTabChange("saved")}
              >
                Saved Posts
              </button>
            )}
          </div>

          <div className={styles.tabContent}>
            {activeTab === "posts" &&
              (isLoadingPosts ? (
                <div className={styles.loadingTab}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Loading posts...</p>
                </div>
              ) : userPosts && userPosts.length > 0 ? (
                <div className={styles.postsModernLayout}>
                  {userPosts.map((post) => (
                    <PostsComponent
                      key={post.post_id}
                      post={post}
                      setPosts={setUserPosts}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📝</div>
                  <h3 className={styles.emptyStateTitle}>No posts yet</h3>
                  <p className={styles.emptyStateText}>
                    When you create posts, they will appear here.
                  </p>
                </div>
              ))}

            {activeTab === "about" && (
              <div className={styles.aboutSection}>
                <div className={styles.aboutItem}>
                  <h3 className={styles.aboutItemTitle}>
                    Personal Information
                  </h3>
                  <div className={styles.aboutItemContent}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Full Name</span>
                      <span className={styles.infoValue}>{`${userData.first_name || ""
                        } ${userData.last_name || ""}`}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Username</span>
                      <span className={styles.infoValue}>
                        @{userData.username || ""}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Email</span>
                      <span className={styles.infoValue}>
                        {userData.email || "Not provided"}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Date of Birth</span>
                      <span className={styles.infoValue}>
                        {formatDate(userData.date_of_birth)}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Privacy</span>
                      <span className={styles.infoValue}>
                        {userData.privacy
                          ? userData.privacy.charAt(0).toUpperCase() +
                          userData.privacy.slice(1)
                          : "Public"}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Joined</span>
                      <span className={styles.infoValue}>
                        {formatDate(userData.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.aboutItem}>
                  <h3 className={styles.aboutItemTitle}>Activity Statistics</h3>
                  <div className={styles.aboutItemContent}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Total Posts</span>
                      <span className={styles.infoValue}>
                        {userData.total_posts || 0}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Total Followers</span>
                      <span className={styles.infoValue}>
                        {userData.total_followers || 0}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Total Following</span>
                      <span className={styles.infoValue}>
                        {userData.total_following || 0}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Total Likes</span>
                      <span className={styles.infoValue}>
                        {userData.total_likes || 0}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Total Comments</span>
                      <span className={styles.infoValue}>
                        {userData.total_comments || 0}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Total Groups</span>
                      <span className={styles.infoValue}>
                        {userData.total_groups || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "saved" && isOwnProfile && (
              <div className={styles.savedContentContainer}>
                <div className={styles.savedTabs}>
                  <button
                    className={`${styles.savedTabButton} ${activeSubTab === "posts" ? styles.active : ""
                      }`}
                    onClick={() => {
                      fetchSavedPosts("post");
                      setActiveSubTab("posts");
                    }}
                  >
                    Saved Posts
                  </button>
                  <button
                    className={`${styles.savedTabButton} ${activeSubTab === "group-posts" ? styles.active : ""
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
                    <div className={styles.loadingTab}>
                      <div className={styles.loadingSpinner}></div>
                      <p>Loading saved posts...</p>
                    </div>
                  ) : savedPosts.length > 0 ? (
                    <div className={styles.postsContainer}>
                      {savedPosts.map((post) => (
                        <PostsComponent
                          key={post.post_id}
                          post={post}
                          setPosts={setSavedPosts}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <div
                        className={`${styles.emptyStateIcon} ${styles.bookmark}`}
                      >
                        🔖
                      </div>
                      <h3 className={styles.emptyStateTitle}>
                        No saved posts yet
                      </h3>
                      <p className={styles.emptyStateText}>
                        When you save posts you like, they will appear here for
                        quick access later.
                      </p>
                      <button
                        className={styles.createPostButton}
                        onClick={goToHome}
                      >
                        Browse Posts
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === "followers" &&
              (isLoadingFollowers ? (
                <div className={styles.loadingTab}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Loading followers...</p>
                </div>
              ) : followers.length > 0 ? (
                <div className={styles.usersSection}>
                  <div className={styles.usersHeader}>
                    <h3>People who follow you</h3>
                  </div>
                  <ul className={styles.userList}>
                    {followers.map((follower) => (
                      <li key={follower.user_id} className={styles.userItem}>
                        <img
                          src={follower.avatar || "/inconnu/avatar.png"}
                          alt={follower.username}
                          className={styles.userAvatar}
                        />
                        <div className={styles.userInfo}>
                          <h4
                            className={styles.userName}
                          >{`${follower.first_name} ${follower.last_name}`}</h4>
                          <p className={styles.userUsername}>
                            @{follower.username}
                          </p>
                        </div>
                        <a
                          href={`/profile?id=${follower.user_id}`}
                          className={styles.profileLink}
                        >
                          <button className={styles.viewProfileBtn}>
                            View Profile
                          </button>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>👥</div>
                  <h3 className={styles.emptyStateTitle}>No followers yet</h3>
                  <p className={styles.emptyStateText}>
                    When people follow you, they will appear here.
                  </p>
                </div>
              ))}
            {activeTab === "following" &&
              (isLoadingFollowing ? (
                <div className={styles.loadingTab}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Loading following...</p>
                </div>
              ) : following.length > 0 ? (
                <div className={styles.usersSection}>
                  <div className={styles.usersHeader}>
                    <h3>People you follow</h3>
                  </div>
                  <ul className={styles.userList}>
                    {following.map((followedUser) => (
                      <li
                        key={followedUser.user_id}
                        className={styles.userItem}
                      >
                        <img
                          src={followedUser.avatar || "/inconnu/avatar.png"}
                          alt={followedUser.username}
                          className={styles.userAvatar}
                        />
                        <div className={styles.userInfo}>
                          <h4
                            className={styles.userName}
                          >{`${followedUser.first_name} ${followedUser.last_name}`}</h4>
                          <p className={styles.userUsername}>
                            @{followedUser.username}
                          </p>
                        </div>
                        <a
                          href={`/profile?id=${followedUser.user_id}`}
                          className={styles.profileLink}
                        >
                          <button className={styles.viewProfileBtn}>
                            View Profile
                          </button>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>🚶</div>
                  <h3 className={styles.emptyStateTitle}>
                    Not following anyone yet
                  </h3>
                  <p className={styles.emptyStateText}>
                    When you follow people, they will appear here.
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
      {
        showEditModal && userData && (
          <EditProfileModal
            user={userData}
            onClose={() => setShowEditModal(false)}
            onSave={handleProfileUpdate}
          />
        )
      }
    </div >
  );
}
