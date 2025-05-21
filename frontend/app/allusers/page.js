"use client";
import { useState, useEffect } from "react";
import "../styles/AllUsersPage.css";

export default function AllUsersPage() {
  const [activeTab, setActiveTab] = useState("suggested");
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSuggestedUsers([
      {
        user_id: 1,
        name: "Alex Johnson",
        username: "@alexj",
        avatar: "/avatar.jpg",
        bio: "Software Engineer | React Enthusiast",
      },
      {
        user_id: 2,
        name: "Sarah Williams",
        username: "@sarahw",
        avatar: "/avatar.jpg",
        bio: "UX Designer based in San Francisco",
      },
      {
        user_id: 3,
        name: "Mike Chen",
        username: "@mikec",
        avatar: "/avatar.jpg",
        bio: "Product Manager | Tech Writer",
      },
    ]);

    setPendingRequests([
      {
        user_id: 4,
        name: "Jamie Taylor",
        username: "@jamiet",
        avatar: "/avatar.jpg",
        requested_at: "2 days ago",
      },
      {
        user_id: 5,
        name: "Chris Murphy",
        username: "@chrism",
        avatar: "/avatar.jpg",
        requested_at: "1 week ago",
      },
      {
        user_id: 5,
        name: "Chris Murphy",
        username: "@chrism",
        avatar: "/avatar.jpg",
        requested_at: "1 week ago",
      },
      {
        user_id: 5,
        name: "Chris Murphy",
        username: "@chrism",
        avatar: "/avatar.jpg",
        requested_at: "1 week ago",
      },
    ]);

    setLoading(false);
  }, []);

  return (
    <div className="all-users-container">
      <div className="all-users-header">
        <h1>Discover People</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "suggested" ? "active" : ""}`}
          onClick={() => setActiveTab("suggested")}
        >
          Suggested Users
          {suggestedUsers.length > 0 && (
            <span className="tab-count">{suggestedUsers.length}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="tab-count">{pendingRequests.length}</span>
          )}
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
            {suggestedUsers.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? (
                  <>
                    <p className="empty-title">No users found</p>
                    <p className="empty-description">
                      No users match your search "{searchQuery}"
                    </p>
                  </>
                ) : (
                  <>
                    <p className="empty-title">No suggested users</p>
                    <p className="empty-description">
                      We'll suggest users based on your interests and activity
                    </p>
                  </>
                )}
              </div>
            ) : (
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
        ) : (
          <div className="pending-requests-list">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? (
                  <>
                    <p className="empty-title">No requests found</p>
                    <p className="empty-description">
                      No pending requests match your search "{searchQuery}"
                    </p>
                  </>
                ) : (
                  <>
                    <p className="empty-title">No pending requests</p>
                    <p className="empty-description">
                      When users request to follow you, they'll appear here
                    </p>
                  </>
                )}
              </div>
            ) : (
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
                      <p className="request-time">
                        Requested {request.requested_at}
                      </p>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      className="reject-button"
                      onClick={() => handleCancelRequest(request.user_id)}
                    >
                      Cancel Request
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
