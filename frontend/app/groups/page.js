"use client";
import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";

import Navbar from "../components/NavBar";
import "../../styles/GroupsPage.css";
import EventCard from "../components/EventCard";
import MemberCard from "../components/MemberCard";
import GroupCard from "../components/GroupCard";
import PostCard from "../components/PostCard";
import InvitationCard from "../components/InvitationCard";
import PostFormModal from "../components/PostFormModal";
import PostsComponent from "../components/PostsComponent";
import EventFormModal from "../components/EventFormModal";
import PendingGroupRequestCard from "../components/PendingCard";
import GroupFormModal from "../components/GroupFromModal";
import { leaveGroup } from "../functions/group";
import RemoveGroupModal from "../components/RemoveGroupModal";
import InvitationsModal from "../components/InvitationsModal";
import InviteUsersModal from "../components/UsersToInviteModal";
import {
  handleFollow,
  handelAccept,
  handleReject,
  handelAcceptOtherGroup,
  handleRejectOtherGroup
} from "../functions/user";

function removeGroup(group_id, user_id) {
  leaveGroup(group_id, user_id);
}

async function sendInvitation(userId, groupId) {
  try {
    const response = await fetch(
      `http://localhost:8404/invite?user_id=${userId}&group_id=${groupId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch group data");
    }
    const data = await response.json();
    console.log(`Data:`, data);
  } catch (err) {
    console.log(err);
  }
}

const Message = ({ message, isSent }) => {
  return (
    <div className={`message ${isSent ? "sent" : "received"}`}>
      {!isSent && (
        <div className="message-user-header">
          <img
            className="message-user-avatar"
            src={message.avatar}
            alt={message.username}
          />
          <p>{message.username}</p>
        </div>
      )}
      <p className="message-content">{message.content}</p>
      <span className="message-time">{message.created_at}</span>
    </div>
  );
};

export default function GroupsPage() {
  // State declarations
  const [activeTab, setActiveTab] = useState("discover");
  const [groupData, setGroupData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [groupView, setGroupView] = useState("posts");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [groupImage, setGroupImage] = useState(null);
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [invitationsGroups, setInvitationsGroups] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showRemoveGroupModal, setShowRemoveGroupModal] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);
  const [showUsersToInviteModal, setShowUsersToInviteModal] = useState(false);
  const [usersToInvite, setUsersToInvite] = useState([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  // Handler functions
  function handleCreatePost() {
    setShowPostForm(true);
  }

  function handleCreateGroup() {
    setShowGroupForm(true);
  }

  function handleGroupCreated(newGroup) {
    setMyGroups([newGroup, ...myGroups]);
    setShowGroupForm(false);
  }

  const addNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  async function InvitUsers(group_id) {
    try {
      const response = await fetch(
        `http://localhost:8404/add_members?group_id=${group_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch group data");
      }
      const data = await response.json();
      setUsersToInvite(data);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchGroupDetails(type, groupId) {
    try {
      console.log(`Fetching group details for group ID: ${groupId}`, type);

      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8404/group_details?group_id=${groupId}&type=${type}&offset=0`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch group data");
      }
      const data = await response.json();
      console.log(`Group ${type} Data:`, data);

      if (type === "posts") {
        setPosts(data);
        setSelectedGroup(prev => ({ ...prev, posts: data }));
      } else if (type === "events") {
        setEvents(data);
        setSelectedGroup(prev => ({ ...prev, events: data }));
      } else if (type === "members") {
        setMembers(data);
        setSelectedGroup(prev => ({ ...prev, members: data }));
      } else if (type === "invitations") {
        setInvitations(data);
        setSelectedGroup(prev => ({ ...prev, invitations: data }));
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching group data:", error);
      setIsLoading(false);
    }
  }

  async function fetchGroupData(endpoint) {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8404/groups?type=${endpoint}&offset=0`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch group data");
      }
      const data = await response.json();
      if (endpoint === "joined") {
        setMyGroups(data);
      }
      setGroupData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching group data:", error);
      setGroupData([]);
      setIsLoading(false);
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "discover") {
      fetchGroupData("suggested");
    } else if (tab === "my-groups") {
      fetchGroupData("joined");
    } else if (tab === "pending-groups") {
      fetchGroupData("pending");
    } else if (tab === "invitations") {
      fetchUserInvitationsData();
    }
  };

  const fetchUserInvitationsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8404/invitations_groups?offset=0`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        setIsLoading(false);
        throw new Error("Failed to fetch invitations data");
      }
      const data = await response.json();
      console.log("Invitations Data:", data);
      setInvitationsGroups(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching invitations data:", error);
      setInvitationsGroups([]);
      setIsLoading(false);
    }
  };

  const handleGroupSelect = async (group) => {
    try {
      const response = await fetch(
        `http://localhost:8404/group?group_id=${group.group_id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group details");
      }

      const data = await response.json();
      console.log("Group dataaa:", data);

      const selected = {
        ...data,
        id: data.group_id,
        cover: data.cover,
        created_at: data.created_at,
        image: data.image,
        privacy: data.privacy,
        total_members: data.total_members || 0,
      };

      setSelectedGroup(selected);
      fetchGroupDetails("posts", group.group_id);
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  const handlePostSubmit = async (groupId) => {
    console.log(groupId);

    if (!groupId || isNaN(Number(groupId))) {
      alert("Group ID is missing or invalid.");
      return;
    }

    if (!postTitle || !postContent || !postCategory) {
      alert(
        "Please fill in all required fields: title, content, and category."
      );
      return;
    }

    const formData = new FormData();
    formData.append("group_id", groupId);
    formData.append("title", postTitle);
    formData.append("content", postContent);
    formData.append("category", postCategory);

    if (postImage) {
      formData.append("postImage", postImage);
    }

    try {
      const response = await fetch("http://localhost:8404/new_post_group", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      console.log("Data received from server:", data);
      if (!response.ok) {
        alert(data.error || "Failed to create post.");
        return;
      }
      console.log("Post created:", data);

      setSelectedGroup((prev) => {
        const updatedPosts = [...(prev.posts || []), data];
        console.log("Before update:", prev.posts);
        console.log("Updated posts:", updatedPosts);
        return {
          ...prev,
          posts: updatedPosts,
        };
      });

      setPostTitle("");
      setPostContent("");
      setPostCategory("");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("An error occurred while creating the post.");
    }
  };

  function formatEventDate(date) {
    const eventDate = new Date(date);
    return eventDate.toLocaleString();
  }

  // Effect hooks
  useEffect(() => {
    fetchGroupData("suggested");
  }, []);

  console.log(groupView);
  console.log(members);

  return (
    <div className="groups-page-container">
      <div className="groups-page-content">
        {showRemoveGroupModal && (
          <div className="modal-overlay">
            <RemoveGroupModal
              group={selectedGroup}
              onClose={() => setShowRemoveGroupModal(false)}
              onRemove={removeGroup}
              action={selectedGroup.role === "admin" ? "remove" : "leave"}
              onLeave={leaveGroup}
            />
          </div>
        )}

        {showUsersToInviteModal && (
          <div className="modal-overlay">
            <InviteUsersModal
              users={usersToInvite}
              onClose={() => setShowUsersToInviteModal(false)}
              onInvite={(userId, groupId) => sendInvitation(userId, groupId)}
              groupId={selectedGroup.group_id}
            />
          </div>
        )}

        {!selectedGroup ? (
          <div>
            <div className="groups-header">
              <h1>Groups</h1>
              <button className="create-group-btn" onClick={handleCreateGroup}>
                + Create Group
              </button>
            </div>

            {showGroupForm && (
              <GroupFormModal
                onClose={() => setShowGroupForm(false)}
                onGroupCreated={handleGroupCreated}
              />
            )}

            <div className="groups-tabs">
              <button
                className={`tab-button ${activeTab === "my-groups" ? "active-tab" : ""}`}
                onClick={() => handleTabChange("my-groups")}
              >
                My Groups
              </button>
              <button
                className={`tab-button ${activeTab === "discover" ? "active-tab" : ""}`}
                onClick={() => handleTabChange("discover")}
              >
                Discover
              </button>
              <button
                className={`tab-button ${activeTab === "pending-groups" ? "active-tab" : ""}`}
                onClick={() => handleTabChange("pending-groups")}
              >
                Pending Groups
              </button>
              <button
                className={`tab-button ${activeTab === "invitations" ? "active-tab" : ""}`}
                onClick={() => handleTabChange("invitations")}
              >
                Invitations
              </button>
            </div>

            <div className="groups-search">
              <input
                type="text"
                placeholder="Search groups..."
                className="search-input"
              />
            </div>

            <div className="groups-grid">
              {isLoading ? (
                <div className="loading-message">Loading...</div>
              ) : activeTab === "invitations" ? (
                (invitationsGroups || []).length > 0 ? (
                  (invitationsGroups || []).map((invitation) => {
                    console.log("hadi heya", invitation);

                    return invitation.user.username === invitation.group.admin ? (
                      <InvitationCard
                        key={invitation.invitation_id}
                        invitation={invitation}
                        onAccept={() => {
                          handelAcceptOtherGroup(
                            invitation.user.user_id,
                            invitation.group.group_id
                          );
                        }}
                        onDecline={() => {
                          handleRejectOtherGroup(
                            invitation.user.user_id,
                            invitation.group.group_id
                          );
                        }}
                      />
                    ) : (
                      <InvitationCard
                        key={invitation.invitation_id}
                        invitation={invitation}
                        onAccept={() => {
                          handelAccept(
                            invitation.user.user_id,
                            invitation.group.group_id
                          );
                        }}
                        onDecline={() => {
                          handleReject(
                            invitation.user.user_id,
                            invitation.group.group_id
                          );
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="no-invitations-message">
                    <p>You have no pending invitations.</p>
                  </div>
                )
              ) : activeTab === "my-groups" ? (
                (myGroups || []).length > 0 ? (
                  (myGroups || []).map((group) => (
                    <GroupCard
                      key={group.group_id}
                      group={group}
                      isJoined={true}
                      onClick={() => {
                        handleGroupSelect(group);
                      }}
                      onLeave={() => {
                        leaveGroup(group.group_id);
                      }}
                    />
                  ))
                ) : (
                  <div className="no-groups-message">
                    <p>You haven't joined any groups yet.</p>
                    <button
                      className="discover-groups-btn"
                      onClick={() => handleTabChange("discover")}
                    >
                      Discover Groups
                    </button>
                  </div>
                )
              ) : activeTab === "discover" ? (
                (groupData || []).length > 0 ? (
                  (groupData || []).map((group) => (
                    <GroupCard
                      key={group.group_id}
                      group={group}
                      isJoined={false}
                      onClick={() => {
                        handleGroupSelect(group);
                      }}
                    />
                  ))
                ) : (
                  <div className="no-groups-message">
                    <p>No groups available for discovery.</p>
                    <button
                      className="create-group-btn"
                      onClick={() => setShowForm(true)}
                    >
                      Create a Group
                    </button>
                  </div>
                )
              ) : (groupData || []).length > 0 ? (
                (groupData || []).map((group) => (
                  <PendingGroupRequestCard
                    key={group.group_id}
                    group={group}
                    onCancelRequest={handleFollow}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("dasdhhhas", group);
                      handleFollow(0, group.group_id);
                      handleGroupSelect(group);
                    }}
                  />
                ))
              ) : (
                <div className="no-groups-message">
                  <p>No pending group requests.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="group-detail-container">
            <div className="group-detail-header">
              <img
                src={selectedGroup.cover || "/inconnu/cover.jpg"}
                alt={selectedGroup.name}
                className="group-cover-image"
              />

              <button
                className="back-button"
                onClick={() => {
                  setSelectedGroup(null);
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12H5M12 19l-7-7 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </button>

              <div className="group-header-content">
                <div className="group-detail-info">
                  <img
                    src={selectedGroup.image}
                    alt={selectedGroup.name}
                    className="group-detail-image"
                  />
                  <div className="group-detail-text">
                    <h2>
                      {selectedGroup.name}
                      <span className="group-privacy-badge">
                        {selectedGroup.privacy === "private"
                          ? "Private"
                          : "Public"}
                      </span>
                    </h2>
                    <p>{selectedGroup.description}</p>
                    <div className="group-detail-meta">
                      <div className="meta-item">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="9"
                            cy="7"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{selectedGroup.total_members} members</span>
                      </div>
                      <div className="meta-item">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>
                          Created{" "}
                          {new Date(
                            selectedGroup.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedGroup.role === "admin" ? (
                        <div className="meta-item">
                          <span className="user-role-badge admin-badge">
                            Admin
                          </span>
                        </div>
                      ) : selectedGroup.role === "guest" ? (
                        <div className="meta-item">
                          <span className="user-role-badge guest-badge">
                            Guest
                          </span>
                        </div>
                      ) : (
                        <div className="meta-item">
                          <span className="user-role-badge member-badge">
                            Member
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="group-header-actions">
                  {selectedGroup.role === "admin" ? (
                    <div className="admin-actions">
                      <button
                        className="admin-action-btn"
                        onClick={() => {
                          setShowInvitationsModal(true);
                          fetchGroupDetails(
                            "invitations",
                            selectedGroup.group_id
                          );
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="8.5"
                            cy="7"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20 8v6M23 11h-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Invitations
                      </button>
                      <button
                        className="admin-action-btn"
                        onClick={() => {
                          setShowUsersToInviteModal(true);
                          InvitUsers(selectedGroup.group_id);
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="8.5"
                            cy="7"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20 8v6M23 11h-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Invite Users
                      </button>
                      <button
                        className="leave-group-btn"
                        onClick={() => {
                          setShowRemoveGroupModal(true);
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 6h18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 11v6M14 11v6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Remove Group
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`${selectedGroup.role === "member" ||
                        activeTab === "pending-groups"
                        ? "leave-group-btn"
                        : "admin-action-btn"
                        }`}
                      onClick={() => {
                        console.log(selectedGroup);
                        handleFollow(selectedGroup.admin_id, selectedGroup.group_id);
                        if (activeTab === "my-groups") {
                          setSelectedGroup(null);
                        } else if (activeTab === "discover") {
                          if (selectedGroup.privacy === "private") {
                            handleTabChange("pending-groups");
                            setSelectedGroup(selectedGroup);
                          } else {
                            handleTabChange("my-groups");
                            setSelectedGroup(selectedGroup);
                          }
                        } else if (activeTab === "pending-groups") {
                          handleTabChange("discover");
                          setSelectedGroup(selectedGroup);
                        }
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 17l5-5-5-5M21 12H9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {selectedGroup.role === "member"
                        ? "Leave Group"
                        : activeTab === "pending-groups"
                          ? "Cancel"
                          : "Join Group"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showInvitationsModal && (
              <InvitationsModal
                invitations={selectedGroup.invitations || []}
                onClose={() => setShowInvitationsModal(false)}
                onAccept={handelAccept}
                onReject={handleReject}
              />
            )}

            <div className="group-detail-tabs">
              <button
                className={`tab-button ${groupView === "posts" ? "active-tab" : ""}`}
                onClick={() => {
                  fetchGroupDetails("posts", selectedGroup.group_id);
                  setGroupView("posts");
                }}
              >
                Posts
              </button>
              <button
                className={`tab-button ${groupView === "members" ? "active-tab" : ""}`}
                onClick={() => {
                  fetchGroupDetails("members", selectedGroup.group_id);
                  setGroupView("members");
                }}
              >
                Members
              </button>
              <button
                className={`tab-button ${groupView === "events" ? "active-tab" : ""}`}
                onClick={() => {
                  fetchGroupDetails("events", selectedGroup.group_id);
                  setGroupView("events");
                }}
              >
                Events
              </button>
            </div>

            <div className="group-detail-content">
              {groupView === "posts" && (
                <div className="group-posts-container">
                  {selectedGroup.role === "guest" &&
                    selectedGroup.privacy === "private" ? (
                    <div className="empty-state">
                      <img src="/icons/no-posts.svg" alt="" />
                      <p>You are not allowed to see Posts</p>
                    </div>
                  ) : (
                    <div>
                      {activeTab !== "pending-groups" && (
                        <div className="create-post-section">
                          <button
                            className="create-post-btn"
                            onClick={handleCreatePost}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 5v14M5 12h14"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Create Post
                          </button>
                        </div>
                      )}

                      {showPostForm && (
                        <PostFormModal
                          onClose={() => setShowPostForm(false)}
                          onSubmit={handlePostSubmit}
                          groupId={selectedGroup.group_id}
                          postTitle={postTitle}
                          setPostTitle={setPostTitle}
                          postContent={postContent}
                          setPostContent={setPostContent}
                          postCategory={postCategory}
                          setPostCategory={setPostCategory}
                          postImage={postImage}
                          setPostImage={setPostImage}
                          categories={categories}
                        />
                      )}

                      <div className="group-posts-list">
                        {isLoading ? (
                          <div className="loading-message">Loading posts...</div>
                        ) : posts && posts.length > 0 ? (
                          posts.map((post) => (
                            <PostCard
                              key={post.post_id}
                              post={post}
                              groupId={selectedGroup.group_id}
                              userRole={selectedGroup.role}
                            />
                          ))
                        ) : (
                          <div className="empty-state">
                            <img src="/icons/no-posts.svg" alt="" />
                            <p>No posts yet in this group</p>
                            {activeTab !== "pending-groups" && (
                              <button
                                className="create-first-post-btn"
                                onClick={handleCreatePost}
                              >
                                Create the first post
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {groupView === "members" && (
                <div className="group-members-container">
                  {isLoading ? (
                    <div className="loading-message">Loading members...</div>
                  ) : members && members.length > 0 ? (
                    <div className="members-grid">
                      {members.map((member) => (
                        <MemberCard
                          key={member.user_id}
                          member={member}
                          currentUserRole={selectedGroup.role}
                          groupId={selectedGroup.group_id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <img src="/icons/no-members.svg" alt="" />
                      <p>No members found</p>
                    </div>
                  )}
                </div>
              )}

              {groupView === "events" && (
                <div className="group-events-container">
                  {selectedGroup.role === "guest" &&
                    selectedGroup.privacy === "private" ? (
                    <div className="empty-state">
                      <img src="/icons/no-events.svg" alt="" />
                      <p>You are not allowed to see Events</p>
                    </div>
                  ) : (
                    <div>
                      {activeTab !== "pending-groups" && (
                        <div className="create-event-section">
                          <button
                            className="create-event-btn"
                            onClick={() => setShowEventForm(true)}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <line
                                x1="16"
                                y1="2"
                                x2="16"
                                y2="6"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <line
                                x1="8"
                                y1="2"
                                x2="8"
                                y2="6"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <line
                                x1="3"
                                y1="10"
                                x2="21"
                                y2="10"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M12 14v4M10 16h4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Create Event
                          </button>
                        </div>
                      )}

                      {showEventForm && (
                        <EventFormModal
                          onClose={() => setShowEventForm(false)}
                          groupId={selectedGroup.group_id}
                          onEventCreated={(newEvent) => {
                            setEvents([newEvent, ...events]);
                            setShowEventForm(false);
                          }}
                        />
                      )}

                      <div className="group-events-list">
                        {isLoading ? (
                          <div className="loading-message">Loading events...</div>
                        ) : events && events.length > 0 ? (
                          events.map((event) => (
                            <EventCard
                              key={event.event_id}
                              event={event}
                              groupId={selectedGroup.group_id}
                              userRole={selectedGroup.role}
                              formatDate={formatEventDate}
                            />
                          ))
                        ) : (
                          <div className="empty-state">
                            <img src="/icons/no-events.svg" alt="" />
                            <p>No events yet in this group</p>
                            {activeTab !== "pending-groups" && (
                              <button
                                className="create-first-event-btn"
                                onClick={() => setShowEventForm(true)}
                              >
                                Create the first event
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {groupView === "chat" && (
                <div className="group-chat-container">
                  <div className="chat-messages">
                    {messages.map((message, index) => (
                      <Message
                        key={index}
                        message={message}
                        isSent={message.isSent}
                      />
                    ))}
                  </div>
                  <div className="chat-input-container">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="chat-input"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newMessage.trim()) {
                          const message = {
                            content: newMessage,
                            isSent: true,
                            created_at: new Date().toLocaleTimeString(),
                          };
                          setMessages([...messages, message]);
                          setNewMessage("");
                        }
                      }}
                    />
                    <button
                      className="send-message-btn"
                      onClick={() => {
                        if (newMessage.trim()) {
                          const message = {
                            content: newMessage,
                            isSent: true,
                            created_at: new Date().toLocaleTimeString(),
                          };
                          setMessages([...messages, message]);
                          setNewMessage("");
                        }
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 2L11 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 2l-7 20-4-9-9-4 20-7z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}