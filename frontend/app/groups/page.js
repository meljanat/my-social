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
//               stroke="currentColor"
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
  function handleCreatePost() {
    setShowPostForm(true);
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

  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventImage, setEventImage] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [posts, setPosts] = useState([]);

  // const [showPostForm, setShowPostForm] = useState(false);
  // const [showEventForm, setShowEventForm] = useState(false)

  const addNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  async function fetchGroupDetails(type, groupId) {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8404/group_details?group_id=${groupId}&type=${type}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch group data");
      }
      const data = await response.json();
      console.log(`Group Posts Data:`, data);
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

  const messagesEndRef = useRef(null);
  async function fetchGroupData(endpoint) {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8404/groups?type=${endpoint}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch group data");
      }
      const data = await response.json();
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
      fetchGroupData("invitations_groups");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log("Test");
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8404/accept_invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitation_id: invitationId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to accept invitation");
      }

      fetchGroupData("group_invitations");
      alert("Invitation accepted successfully!");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      alert("Failed to accept invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8404/decline_invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitation_id: invitationId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to decline invitation");
      }

      fetchGroupData("group_invitations");
    } catch (error) {
      console.error("Error declining invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGroupHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", groupName);
    formData.append("description", groupDescription);
    formData.append("privacy", privacy);
    if (groupImage) {
      formData.append("groupImage", groupImage);
    }

    try {
      const response = await fetch("http://localhost:8404/new_group", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        alert(errorData.error || "Failed to create group.");
        return;
      }
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Group created:", data);

      // if (!response.ok) {
      //   alert(data.error || "Failed to create group.");
      //   return;
      // }

      setGroups((prevGroups) => [
        ...prevGroups,
        { ...data, posts: [], events: [] },
      ]);
      setGroupName("");
      setGroupDescription("");
      setPrivacy("public");
      setGroupImage(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating group:", error);
      alert(`An error occurred while creating the group: ${error.message}`);
    }
  };

  const handleGroupSelect = async (group) => {
    try {
      const response = await fetch(
        `http://localhost:8404/group?group_id=${group.id}`,
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
        id: data.id,
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
      fetchGroupDetails("posts", group.id);

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

      // setSelectedGroup((prev) => ({
      //   ...prev,
      //   posts: [...prev.posts, data],
      // }));

      // setSelectedGroup((prev) => ({
      //   ...prev,
      //   posts: [...(prev.posts || []), data],
      // }));

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

  return (
    <div className="groups-page-container">
      {/* <button onClick={goToHome} className="retry-button">
        Go to Home
      </button> */}
      <div className="groups-page-content">
        {!selectedGroup ? (
          <div>
            <div className="groups-header">
              <h1>Groups</h1>
              <button
                className="create-group-btn"
                onClick={() => setShowForm(true)}
              >
                + Create Group
              </button>
            </div>

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
                  (groupData || []).map((invitation) => (
                    <InvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      onAccept={handleAcceptInvitation}
                      onDecline={handleDeclineInvitation}
                    />
                  ))
                ) : (
                  <div className="no-invitations-message">
                    <p>You have no pending invitations.</p>
                  </div>
                )
              ) : activeTab === "my-groups" ? (
                (groupData || []).length > 0 ? (
                  (groupData || []).map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isJoined={true}
                      onClick={() => {
                        handleGroupSelect(group);
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
              ) :activeTab === "discover" ? (
                (groupData || []).length > 0 ? (
                  (groupData || []).map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isJoined={true}
                      onClick={() => {
                        handleGroupSelect(group);
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
              ) : (groupData || []).length > 0 ? (
                (groupData || []).map((group) => (
                  // <GroupCard
                  //   key={group.id}
                  //   group={group}
                  //   isJoined={false}
                  //   onClick={() => handleGroupSelect(group)}
                  // />
                  <PendingGroupRequestCard key={group.id} group={group} />
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
                Back to Groups
              </button>

              <div className="group-detail-info">
                <img
                  src={selectedGroup.cover}
                  alt={selectedGroup.name}
                  className="group-detail-image"
                />
                <div className="group-detail-text">
                  <h2>{selectedGroup.name}</h2>
                  <p>{selectedGroup.description}</p>
                  <div className="group-detail-meta">
                    <span>{selectedGroup.total_members} members</span>
                    <span>{selectedGroup.total_posts} posts</span>
                  </div>
                </div>
              </div>

              <button
                className={`group-action-btn ${
                  selectedGroup.joined ? "joined" : ""
                }`}
              >
                {selectedGroup.joined ? "Joined" : "Join Group"}
              </button>
            </div>

            <div className="group-detail-tabs">
              <button
                className={`tab-button ${
                  groupView === "posts" ? "active-tab" : ""
                }`}
                onClick={() => {
                  fetchGroupDetails("posts", selectedGroup.id);

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
                  fetchGroupDetails("members", selectedGroup.id);

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
                  fetchGroupDetails("events", selectedGroup.id);

                  setGroupView("events");
                }}
              >
                Events
              </button>
              <button
                className={`tab-button ${
                  groupView === "chat" ? "active-tab" : ""
                }`}
                onClick={() => setGroupView("chat")}
              >
                Chat
              </button>
            </div>
            <div className="profile-actions">
              <button
                onClick={handleCreatePost}
                className="action-btn primary-button"
              >
                <img src="/icons/create.svg" alt="" />
                <span>Create post</span>
              </button>
            </div>
            <div className="group-detail-content">
              {groupView === "posts" && (
                <div className="group-posts-container">
                  {(selectedGroup.posts || []).length > 0 ? (
                    (selectedGroup.posts || []).map((post) => (
                      <PostsComponent
                        post={post}
                        key={post.id}
                        groupId={selectedGroup.id}
                      />
                    ))
                  ) : (
                    <div>
                      <h3>No posts available</h3>
                    </div>
                  )}

                  {showPostForm && (
                    <PostFormModal
                      onClose={() => setShowPostForm(false)}
                      // user={user}
                      onPostCreated={addNewPost}
                      group_id={selectedGroup.id}
                    />
                  )}

                  {selectedGroup.posts && selectedGroup.posts.length > 0 && (
                    <div></div>
                  )}
                </div>
              )}
              {groupView === "members" && (
                <div className="group-members-container">
                  <div className="members-header">
                    <h3>Members ({selectedGroup.members?.length})</h3>
                    <div className="members-search">
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="search-input"
                      />
                    </div>
                  </div>

                  <div className="members-grid">
                    {selectedGroup.members?.map((member) => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}

              {groupView === "events" && (
                <div className="group-events-container">
                  <div className="events-header">
                    <h3>Upcoming Events</h3>
                    <button
                      className="create-event-btn"
                      onClick={() => setShowEventForm(true)}
                    >
                      Create Event
                      {/* {showEventForm ? "Cancel" : "Create Event"} */}
                    </button>
                  </div>

                  <div className="events-list">
                    {selectedGroup.events?.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                  {showEventForm && (
                    <EventFormModal
                      onClose={() => setShowEventForm((prev) => !prev)}
                      // user={}
                      group={selectedGroup}
                    />
                  )}
                </div>
              )}

              {groupView === "chat" && (
                <div className="group-chat-container">
                  <div className="chat-messages">
                    {messages.map((message) => (
                      <Message
                        key={message.id}
                        message={message}
                        isSent={message.username === "me"}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    className="message-input-form"
                    onSubmit={handleSendMessage}
                  >
                    <input
                      type="text"
                      placeholder="Type a message to the group..."
                      className="message-input"
                    />
                    <button type="submit" className="send-button">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
