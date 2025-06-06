"use client";
import { useState, useEffect, useRef, use } from "react";
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
  handleRejectOtherGroup,
} from "../functions/user";
import useInfiniteScroll from "../components/useInfiniteScroll";

const removeGroup = (groupId) => {
  setGroups(groups.filter((g) => g.group_id !== groupId));
};

async function sendInvitation(userId, groupId) {
  try {
    const response = await fetch(`http://localhost:8404/add_members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: parseInt(userId),
        group_id: parseInt(groupId),
      }),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch group data");
    }
  } catch (err) {
    console.log(err);
  }
}

// function handleEventSelect(event) {
//   console.log("Interested: ", event);
// }
// const router = useRouter();

// const goToHome = () => {
//   router.push("/");
// };

//   return (
//     <div className="event-card">
//       <div className="event-date">
//         <span className="event-month">
//           {new Date(event.start_date).toLocaleString("default", {
//             month: "short",
//           })}
//         </span>
//         <span className="event-day">
//           {new Date(event.start_date).getDate()}
//         </span>
//       </div>
//       <div className="event-details">
//         <h3>{event.title}</h3>
//         <p className="event-location">
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//             <circle
//               cx="12"
//               cy="10"
//               r="3"
//               stinroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//           {event.location}
//         </p>
//         <p className="event-time">
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <circle
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//             <path
//               d="M12 6v6l4 2"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//           {new Date(event.start_date).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           })}{" "}
//           -
//           {new Date(event.end_date).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           })}
//         </p>
//         <button className="event-action-btn" onClick={handleEventSelect(event)}>
//           Interested
//         </button>
//       </div>
//     </div>
//   );
// };

export default function GroupsPage() {
  function handleCreatePost() {
    setShowPostForm(true);
  }

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
      console.log(`Group Members Data:`, data);
      setUsersToInvite(data);
    } catch (err) {
      console.log(err);
    }
  }
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
  const [groups, setGroups] = useState([]);

  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventImage, setEventImage] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [eventDate, setEventDate] = useState("");
  const [posts, setPosts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  function handleCreateGroup() {
    setShowGroupForm(true);
  }

  function handleGroupCreated(newGroup) {
    setMyGroups([newGroup, ...myGroups]);
    setShowGroupForm(false);
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
          if (data === true) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        setError(true);
        console.error("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const addNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  async function fetchGroupDetails(type, groupId) {
    try {
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
      setSelectedGroup((prev) => ({
        ...prev,

        [type]: data,
      }));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching group data:", error);
      // setSelectedGroup([]);
      setIsLoading(false);
    }
  }

  useInfiniteScroll({
    fetchMoreCallback: async () => {
      if (!selectedGroup || !selectedGroup.id || !hasMorePosts) return;

      setIsFetchingMore(true);
      const currentPosts = selectedGroup.posts || [];
      const newPosts = await fetchGroupDetails(
        "posts",
        selectedGroup.id,
        currentPosts.length
      );

      if (!newPosts || newPosts.length === 0) {
        console.log("No more posts to fetch");
        setHasMorePosts(false);
      }
      setIsFetchingMore(false);
    },
    offset: selectedGroup?.posts?.length || 0,
    isFetching: isFetchingMore,
    hasMore: hasMorePosts,
  });

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
      console.log(`Data:`, data);
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
      setGroupData(data);
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
        // posts: data.Posts || [],
        // events: data.Events || [],
        // members: data.Members || [],
        // invitations: data.Invitations || [],
        cover: data.cover,
        created_at: data.created_at,
        image: data.image,
        privacy: data.privacy,
        total_members: data.total_members || 0,
      };

      setSelectedGroup(selected);
      fetchGroupDetails("posts", group.group_id);

      // console.log("Selected Group: ", selected);
      // console.log("Selected Group ID: ", selected.id);

      // setShowPostForm(false);
      // setShowEventForm(false);

      // console.log("Group Data: ", selected);
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };
  useEffect(() => {
    fetchGroupData("suggested");
  }, []);

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

  const handleDeleteGroup = (groupId) => {
    setMyGroups((prevGroups) =>
      prevGroups.filter((group) => group.group_id !== groupId)
    );
    setGroupData((prevGroups) =>
      prevGroups.filter((group) => group.group_id !== groupId)
    );
    setSelectedGroup(null);
  };

  const handleJoinGroup = (group) => {
    setGroupData((prev) => prev.filter((g) => g.group_id !== group.group_id));
    setMyGroups((prev) => [...prev, { ...group, is_joined: true }]);
  };

  const handleLeaveGroup = (group) => {
    setMyGroups((prev) => prev.filter((g) => g.group_id !== group.group_id));
    setGroupData((prev) => [...prev, { ...group, is_joined: false }]);
  };

  const handleCancelRequest = (groupId) => {
    setPendingGroups((prev) =>
      prev.filter((group) => group.group_id !== groupId)
    );
  };
  const LeaveGroup = (groupId) => {
    setMyGroups((prevGroups) =>
      prevGroups.filter((group) => group.group_id !== groupId)
    );
    handleFollow(groupId);
  };

  return (
    <div className="groups-page-container">
      <div className="groups-page-content">
        {showRemoveGroupModal && (
          <div className="modal-overlay">
            <RemoveGroupModal
              group={selectedGroup}
              onClose={() => setShowRemoveGroupModal(false)}
              onRemove={removeGroup}
              onLeave={leaveGroup}
              action={selectedGroup?.role === "admin" ? "remove" : "leave"}
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
                // user={homeData.user}
                onGroupCreated={handleGroupCreated}
              />
            )}

            <div className="groups-tabs">
              <button
                className={`tab-button ${
                  activeTab === "my-groups" ? "active-tab" : ""
                }`}
                onClick={() => handleTabChange("my-groups")}
              >
                My Groups
              </button>
              <button
                className={`tab-button ${
                  activeTab === "discover" ? "active-tab" : ""
                }`}
                onClick={() => handleTabChange("discover")}
              >
                Discover
              </button>
              <button
                className={`tab-button ${
                  activeTab === "pending-groups" ? "active-tab" : ""
                }`}
                onClick={() => handleTabChange("pending-groups")}
              >
                Pending Groups
              </button>
              <button
                className={`tab-button ${
                  activeTab === "invitations" ? "active-tab" : ""
                }`}
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
                (groupData || []).length > 0 ? (
                  (groupData || []).map((invitation) =>
                    invitation.user.username === invitation.group.admin ? (
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
                    )
                  )
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
                      isDiscoverTab={false}
                      onLeave={handleLeaveGroup}
                      onDelete={handleDeleteGroup}
                      // onLeave={() => {
                      //   leaveGroup(group.group_id);
                      // }}
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
                      onJoin={handleJoinGroup}
                      onClick={() => {
                        handleGroupSelect(group);
                      }}
                      isDiscoverTab={true}
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
              ) : (groupData || []).length > 0 ? (
                (groupData || []).map((group) => (
                  // <GroupCard
                  //   key={group.id}
                  //   group={group}
                  //   isJoined={false}
                  //   onClick={() => handleGroupSelect(group)}
                  // />
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
                    onCancel={handleCancelRequest}
                  />
                ))
              ) : (
                <div className="no-groups-message">
                  {activeTab === "discover" ? (
                    <>
                      <p>No groups available for discovery.</p>
                      <button
                        className="create-group-btn"
                        onClick={() => setShowForm(true)}
                      >
                        Create a Group
                      </button>
                    </>
                  ) : (
                    <p>No pending group requests.</p>
                  )}
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
                      className={` ${
                        selectedGroup.role === "member" ||
                        activeTab === "pending-groups"
                          ? "leave-group-btn"
                          : "admin-action-btn"
                      }`}
                      onClick={() => {
                        console.log(selectedGroup);
                        handleFollow(
                          selectedGroup.admin_id,
                          selectedGroup.group_id
                        );

                        if (
                          selectedGroup.role === "member" &&
                          activeTab === "my-groups"
                        ) {
                          setMyGroups((prev) =>
                            prev.filter(
                              (g) => g.group_id !== selectedGroup.group_id
                            )
                          );

                          setSelectedGroup((prev) => ({
                            ...prev,
                            role: "none",
                          }));

                          handleTabChange("pending-groups");
                        } else if (activeTab === "discover") {
                          if (selectedGroup.privacy === "private") {
                            handleTabChange("pending-groups");
                          } else {
                            handleTabChange("my-groups");
                          }

                          setSelectedGroup((prev) => ({
                            ...prev,
                            role: "member",
                          }));
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
                className={`tab-button ${
                  groupView === "posts" ? "active-tab" : ""
                }`}
                onClick={() => {
                  fetchGroupDetails("posts", selectedGroup.group_id);
                  setGroupView("posts");
                }}
              >
                Posts
              </button>
              <button
                className={`tab-button ${
                  groupView === "members" ? "active-tab" : ""
                }`}
                onClick={() => {
                  fetchGroupDetails("members", selectedGroup.group_id);
                  setGroupView("members");
                }}
              >
                Members
              </button>
              <button
                className={`tab-button ${
                  groupView === "events" ? "active-tab" : ""
                }`}
                onClick={() => {
                  fetchGroupDetails("events", selectedGroup.group_id);
                  setGroupView("events");
                }}
              >
                Events
              </button>
            </div>

            <div className="profile-actions">
              {/* <button
                onClick={handleCreatePost}
                className="action-btn primary-button"
              >
                <img src="/icons/create.svg" alt="" />
                <span>Create post</span>
              </button> */}
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
                      {activeTab === "my-groups" && (
                        <button
                          disabled={
                            selectedGroup.role !== "admin" &&
                            selectedGroup.role !== "member"
                          }
                          onClick={handleCreatePost}
                          className="create-post-action-btn"
                        >
                          <img src="/icons/create.svg" alt="" />
                          <span>Create post</span>
                        </button>
                      )}

                      <div className="posts-scroll-container">
                        {(selectedGroup.posts || []).length > 0 ? (
                          (selectedGroup.posts || []).map((post) => (
                            <PostsComponent
                              post={post}
                              key={post.post_id}
                              groupId={selectedGroup.group_id}
                            />
                          ))
                        ) : (
                          <div className="empty-state">
                            <p className="empty-title">No post available</p>
                          </div>
                        )}
                      </div>

                      {showPostForm && (
                        <PostFormModal
                          onClose={() => setShowPostForm(false)}
                          onPostCreated={addNewPost}
                          group_id={selectedGroup.group_id}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {groupView === "members" && (
                <div className="group-members-container">
                  <div className="members-header">
                    <h3>Members ({selectedGroup.members?.length || 0})</h3>
                  </div>
                  {selectedGroup.role === "guest" &&
                  selectedGroup.privacy === "private" ? (
                    <div className="empty-state">
                      <p className="empty-title">
                        You are not allowed to see Members
                      </p>
                    </div>
                  ) : (
                    <div className="members-scroll-container">
                      {selectedGroup.members?.length === 0 ? (
                        <div className="empty-state">
                          <p className="empty-title">No members available</p>
                        </div>
                      ) : (
                        <div className="members-grid">
                          {selectedGroup.members?.map((member) => (
                            <MemberCard key={member.user_id} member={member} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {groupView === "events" && (
                <div className="group-events-container">
                  {selectedGroup.role === "guest" &&
                  selectedGroup.privacy === "private" ? (
                    <div className="empty-state">
                      <p className="empty-title">
                        You are not allowed to see Events
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="events-header">
                        <h3>Upcoming Events</h3>
                        {(selectedGroup.role === "admin" ||
                          selectedGroup.role === "member") && (
                          <button
                            className="create-event-btn"
                            onClick={() => setShowEventForm(true)}
                          >
                            Create Event
                          </button>
                        )}
                      </div>

                      <div className="events-scroll-container">
                        {selectedGroup.events?.length === 0 ? (
                          <div className="empty-state">
                            <p className="empty-title">No events available</p>
                          </div>
                        ) : (
                          <div className="events-list">
                            {Array.isArray(selectedGroup.events) ? (
                              selectedGroup.events.map((event) => (
                                <EventCard key={event.event_id} event={event} />
                              ))
                            ) : (
                              <p>No events available.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {showEventForm && (
                    <EventFormModal
                      onClose={() => setShowEventForm(false)}
                      group={selectedGroup}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
