"use client";
import { useState, useEffect } from "react";
import "../styles/AllUsersPage.css";
import { handleFollow, handelAccept, handleReject } from "../functions/user";

export default function AllUsersPage() {
  const [activeTab, setActiveTab] = useState("suggested");
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers("suggested");
    fetchUsers("pending");
    fetchUsers("received");
  }, []);
  const fetchUsers = async (type) => {
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
      if (response.ok) {
        const data = await response.json();
        if (type === "suggested") {
          setSuggestedUsers(data);
        } else if (type === "pending") {
          setPendingRequests(data);
        } else if (type === "received") {
          setReceivedRequests(data);
        }
        setLoading(false);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-users-container">
      <div className="all-users-header">
        <h1>Discover People</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "suggested" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("suggested");
            fetchUsers("suggested");
          }}
        >
          Suggested Users
        </button>
        <button
          className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("pending");
            fetchUsers("pending");
          }}
        >
          Pending Requests
          {pendingRequests && pendingRequests.length > 0 && (
            <span className="tab-count">{pendingRequests.length}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === "received" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("received");
            fetchUsers("received");
          }}
        >
          Received Requests
          {receivedRequests
            ? receivedRequests.length > 0 && (
                <span className="tab-count">{receivedRequests.length}</span>
              )
            : null}
        </button>
      </div>

      <div className="tab-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : activeTab === "suggested" ? (
          <div className="suggested-users-list">
            {!suggestedUsers || suggestedUsers.length === 0 ? (
              <div className="empty-state">
                {
                  <>
                    <p className="empty-title">No suggested users</p>
                    <p className="empty-description">
                      We'll suggest users based on your interests and activity
                    </p>
                  </>
                }
              </div>
            ) : (
              suggestedUsers &&
              suggestedUsers.map((user) => (
                <div key={user.user_id} className="user-card">
                  <div className="user-info-container">
                    <img
                      src={user.avatar || "/avatar.jpg"}
                      alt={user.name}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <h3 className="user-name">{user.name}</h3>
                      <p className="user-username">{user.username}</p>
                      {user.bio && <p className="user-bio">{user.bio}</p>}
                    </div>
                  </div>
                  <button
                    className="follow-button"
                    onClick={() => handleFollow(user.user_id)}
                  >
                    Follow
                  </button>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "pending" ? (
          <div className="pending-requests-list">
            {!pendingRequests || pendingRequests.length === 0 ? (
              <div className="empty-state">
                {
                  <>
                    <p className="empty-title">No pending requests</p>
                    <p className="empty-description">
                      When you request to follow some one they'll appear here
                    </p>
                  </>
                }
              </div>
            ) : (
              pendingRequests &&
              pendingRequests.map((request) => (
                <div key={request.user_id} className="user-card">
                  <div className="user-info-container">
                    <img
                      src={request.avatar || "/avatar.jpg"}
                      alt={request.name}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <h3 className="user-name">{request.name}</h3>
                      <p className="user-username">{request.username}</p>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      className="reject-button"
                      onClick={() => handleFollow(request.user_id, 0)}
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="pending-requests-list">
            {!receivedRequests || receivedRequests.length === 0 ? (
              <div className="empty-state">
                {
                  <>
                    <p className="empty-title">No received requests</p>
                    <p className="empty-description">
                      When users request to follow you, they'll appear here
                    </p>
                  </>
                }
              </div>
            ) : (
              receivedRequests &&
              receivedRequests.map((request) => (
                <div key={request.user_id} className="user-card">
                  <div className="user-info-container">
                    <img
                      src={request.avatar || "/avatar.jpg"}
                      alt={request.name}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <h3 className="user-name">{request.name}</h3>
                      <p className="user-username">{request.username}</p>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      className="follow-button"
                      onClick={() => handelAccept(request.user_id, 0)}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => handleReject(request.user_id, 0)}
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
