"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/AllUsersPage.module.css"; 
import { handleFollow, handelAccept, handleReject } from "../functions/user"; // Assuming these functions are correctly implemented

export default function AllUsersPage() {
  const [activeTab, setActiveTab] = useState("suggested");
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers("suggested");
  }, []);

  const fetchUsers = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8404/suggested_users?type=${type}&offset=0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      console.log("Pending requests before: " ,pendingRequests);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched ${type} users:`, data);
        if (type === "suggested") {
          setSuggestedUsers(data);
        } else if (type === "pending") {
          setPendingRequests(data);
        } else if (type === "received") {
          setReceivedRequests(data);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to fetch ${type} users.`);
      }
    } catch (error) {
      setError(`Network error while fetching ${type} users.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await handelAccept(userId, 0);
      setReceivedRequests(
        receivedRequests.filter((user) => user.user_id !== userId)
      );
    } catch (error) {
      setError("Failed to accept request. Please try again.");
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await handleReject(userId, 0);
      setReceivedRequests(
        receivedRequests.filter((user) => user.user_id !== userId)
      );
    } catch (error) {
      setError("Failed to reject request. Please try again.");
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await handleFollow(userId, 0);
      setPendingRequests((prev) =>
        prev.filter((user) => user.user_id !== userId)
      );
    } catch (error) {
      setError("Failed to cancel request. Please try again.");
    }
  };

  const handleFollowUser = async (userId) => {
    try {
      await handleFollow(userId, 0);
      setSuggestedUsers((prev) =>
        prev.filter((user) => user.user_id !== userId)
      );
    } catch (error) {
      setError("Failed to follow user. Please try again.");
    }
  };

  return (
    <div className={styles.allUsersContainer}>
      <div className={styles.allUsersHeader}>
        <h1>Discover People</h1>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "suggested" ? styles.active : ""
          }`}
          onClick={() => {
            setActiveTab("suggested");
            fetchUsers("suggested");
          }}
        >
          Suggested Users
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "pending" ? styles.active : ""
          }`}
          onClick={() => {
            setActiveTab("pending");
            fetchUsers("pending");
          }}
        >
          Pending Requests
          {pendingRequests && pendingRequests.length > 0 && (
            <span className={styles.tabCount}>{pendingRequests.length}</span>
          )}
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "received" ? styles.active : ""
          }`}
          onClick={() => {
            setActiveTab("received");
            fetchUsers("received");
          }}
        >
          Received Requests
          {receivedRequests
            ? receivedRequests.length > 0 && (
                <span className={styles.tabCount}>
                  {receivedRequests.length}
                </span>
              )
            : null}
        </button>
      </div>

      <div className={styles.tabContent}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading users...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>!</div>
            <h2 className={styles.errorTitle}>Error loading users</h2>
            <p className={styles.errorMessage}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        ) : activeTab === "suggested" ? (
          <div className={styles.suggestedUsersList}>
            {!suggestedUsers || suggestedUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>No suggested users</p>
                <p className={styles.emptyDescription}>
                  We'll suggest users based on your interests and activity
                </p>
              </div>
            ) : (
              suggestedUsers.map((user) => (
                <div key={user.user_id} className={styles.userCard}>
                  <div className={styles.userInfoContainer}>
                    <img
                      src={user.avatar || "/inconnu/avatar.png"}
                      alt={user.name}
                      className={styles.userAvatar}
                    />
                    <div className={styles.userDetails}>
                      <h3 className={styles.userName}>{user.name}</h3>
                      <p className={styles.userUsername}>{user.username}</p>
                      {user.bio && <p className={styles.userBio}>{user.bio}</p>}
                    </div>
                  </div>
                  <button
                    className={styles.followButton}
                    onClick={() => handleFollowUser(user.user_id)}
                  >
                    Follow
                  </button>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "pending" ? (
          <div className={styles.pendingRequestsList}>
            {!pendingRequests || pendingRequests?.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>No pending requests</p>
                <p className={styles.emptyDescription}>
                  When you request to follow someone, they'll appear here
                </p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.user_id} className={styles.userCard}>
                  <div className={styles.userInfoContainer}>
                    <img
                      src={request.avatar || "/inconnu/avatar.png"}
                      alt={request.name}
                      className={styles.userAvatar}
                    />
                    <div className={styles.userDetails}>
                      <h3 className={styles.userName}>{request.name}</h3>
                      <p className={styles.userUsername}>{request.username}</p>
                    </div>
                  </div>
                  <div className={styles.requestActions}>
                    <button
                      className={styles.cancelRequestButton}
                      onClick={() => handleCancelRequest(request.user_id)}
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className={styles.receivedRequestsList}>
            {!receivedRequests || receivedRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>No received requests</p>
                <p className={styles.emptyDescription}>
                  When users request to follow you, they'll appear here
                </p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <div key={request.user_id} className={styles.userCard}>
                  <div className={styles.userInfoContainer}>
                    <img
                      src={request.avatar || "/inconnu/avatar.png"}
                      alt={request.name}
                      className={styles.userAvatar}
                    />
                    <div className={styles.userDetails}>
                      <h3 className={styles.userName}>{request.name}</h3>
                      <p className={styles.userUsername}>{request.username}</p>
                    </div>
                  </div>
                  <div className={styles.requestActions}>
                    <button
                      className={styles.acceptButton}
                      onClick={() => handleAcceptRequest(request.user_id)}
                    >
                      Accept
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleRejectRequest(request.user_id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
