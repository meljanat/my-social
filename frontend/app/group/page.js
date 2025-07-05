"use client";
import styles from "../styles/GroupPage.module.css";
import AuthForm from "../components/AuthForm";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import InviteUsersModal from "../components/UsersToInviteModal";
import RemoveGroupModal from "../components/RemoveGroupModal";
import InvitationsModal from "../components/InvitationsModal";
import EventCard from "../components/EventCard";
import MemberCard from "../components/MemberCard";
import PostFormModal from "../components/PostFormModal";
import PostsComponent from "../components/PostsComponent";
import EventFormModal from "../components/EventFormModal";
import { handleFollow, handelAccept, handleReject } from "../functions/user";
import { leaveGroup } from "../functions/group";

export default function GroupPage() {
  const [isLoggedIn, setIsLoggedIn] = useState("true");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [groupView, setGroupView] = useState("posts");
  const [showPostForm, setShowPostForm] = useState(false);
  const [showRemoveGroupModal, setShowRemoveGroupModal] = useState(false);
  const [showUsersToInviteModal, setShowUsersToInviteModal] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [usersToInvite, setUsersToInvite] = useState([]);
  const [activeTab, setActiveTab] = useState("my-groups");

  const router = useRouter();
  const searchParams = useSearchParams();
  const group_id = searchParams.get("id");

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

  useEffect(() => {
    async function fetchGroup(group_id) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8404/group?group_id=${group_id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch group details");
        }

        const data = await response.json();
        setSelectedGroup(data);
        fetchGroupDetails("posts", data.group_id);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching group details:", error);
        setIsLoading(false);
      }
    }

    if (group_id) {
      fetchGroup(group_id);
    }
  }, [group_id]);

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
      setSelectedGroup((prev) => ({
        ...prev,
        [type]: data,
      }));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching group data:", error);
      setIsLoading(false);
    }
  }

  function handleCreatePost() {
    setShowPostForm(true);
  }

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

  const removeGroup = (groupId) => {
    router.push("/groups");
  };

  const addNewPost = (newPost) => {
    setSelectedGroup((prev) => ({
      ...prev,
      posts: [newPost, ...(prev.posts || [])],
    }));
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (!selectedGroup) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: Group not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.groupDetailContainer}>
      {showRemoveGroupModal && (
        <div className={styles.modalOverlay}>
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
        <div className={styles.modalOverlay}>
          <InviteUsersModal
            users={usersToInvite}
            onClose={() => setShowUsersToInviteModal(false)}
            onInvite={(userId, groupId) => sendInvitation(userId, groupId)}
            groupId={selectedGroup.group_id}
          />
        </div>
      )}
      <div className={styles.groupDetailHeader}>
        <img
          src={selectedGroup.cover || "/inconnu/cover.jpg"}
          alt={selectedGroup.name}
          className={styles.groupCoverImage}
        />

        <button
          className={styles.backButton}
          onClick={() => {
            router.push("/groups");
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

        <div className={styles.groupHeaderContent}>
          <div className={styles.groupDetailInfo}>
            <img
              src={selectedGroup.image}
              alt={selectedGroup.name}
              className={styles.groupDetailImage}
            />
            <div className={styles.groupDetailText}>
              <h2>
                {selectedGroup.name}
                <span className={styles.groupPrivacyBadge}>
                  {selectedGroup.privacy === "private" ? "Private" : "Public"}
                </span>
              </h2>
              <p>{selectedGroup.description}</p>
              <div className={styles.groupDetailMeta}>
                <div className={styles.metaItem}>
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
                <div className={styles.metaItem}>
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
                    {new Date(selectedGroup.created_at).toLocaleDateString()}
                  </span>
                </div>
                {selectedGroup.role === "admin" ? (
                  <div className={styles.metaItem}>
                    <span
                      className={`${styles.userRoleBadge} ${styles.adminBadge}`}
                    >
                      Admin
                    </span>
                  </div>
                ) : selectedGroup.role === "guest" ? (
                  <div className={styles.metaItem}>
                    <span
                      className={`${styles.userRoleBadge} ${styles.guestBadge}`}
                    >
                      Guest
                    </span>
                  </div>
                ) : (
                  <div className={styles.metaItem}>
                    <span
                      className={`${styles.userRoleBadge} ${styles.memberBadge}`}
                    >
                      Member
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.groupHeaderActions}>
            {selectedGroup.role === "admin" ? (
              <div className={styles.adminActions}>
                <button
                  className={styles.adminActionBtn}
                  onClick={() => {
                    setShowInvitationsModal(true);
                    fetchGroupDetails("invitations", selectedGroup.group_id);
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
                  className={styles.adminActionBtn}
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
                  className={styles.leaveGroupBtn}
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
                    ? styles.leaveGroupBtn
                    : styles.adminActionBtn
                }`}
                onClick={() => {
                  handleFollow(selectedGroup.admin_id, selectedGroup.group_id);
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
      <div className={styles.groupDetailTabs}>
        <button
          className={`${styles.tabButton} ${
            groupView === "posts" ? styles.activeTab : ""
          }`}
          onClick={() => {
            fetchGroupDetails("posts", selectedGroup.group_id);
            setGroupView("posts");
          }}
        >
          Posts
        </button>
        <button
          className={`${styles.tabButton} ${
            groupView === "members" ? styles.activeTab : ""
          }`}
          onClick={() => {
            fetchGroupDetails("members", selectedGroup.group_id);
            setGroupView("members");
          }}
        >
          Members
        </button>
        <button
          className={`${styles.tabButton} ${
            groupView === "events" ? styles.activeTab : ""
          }`}
          onClick={() => {
            fetchGroupDetails("events", selectedGroup.group_id);
            setGroupView("events");
          }}
        >
          Events
        </button>
      </div>

      <div className={styles.groupDetailContent}>
        {groupView === "posts" && (
          <div className={styles.groupPostsContainer}>
            {selectedGroup.role === "guest" &&
            selectedGroup.privacy === "private" ? (
              <div className={styles.emptyState}>
                <img src="/icons/no-posts.svg" alt="No Posts" />
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
                    className={styles.createPostActionBtn}
                  >
                    <img src="/icons/create.svg" alt="Create" />
                    <span>Create post</span>
                  </button>
                )}

                <div className={styles.postsScrollContainer}>
                  {selectedGroup.posts && selectedGroup.posts?.length > 0 ? (
                    selectedGroup.posts.map((post) => (
                      <PostsComponent
                        post={post}
                        key={post.post_id}
                        groupId={selectedGroup.group_id}
                        setPosts={setSelectedGroup}
                      />
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyTitle}>No post available</p>
                    </div>
                  )}
                </div>

                {showPostForm && (
                  <PostFormModal
                    onClose={() => setShowPostForm(false)}
                    onPostCreated={addNewPost}
                    group_id={selectedGroup.group_id}
                    action={"group"}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {groupView === "members" && (
          <div className={styles.groupMembersContainer}>
            <div className={styles.membersHeader}>
              <h3>Members ({selectedGroup.members?.length || 0})</h3>
            </div>
            {selectedGroup.role === "guest" &&
            selectedGroup.privacy === "private" ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>
                  You are not allowed to see Members
                </p>
              </div>
            ) : (
              <div className={styles.membersScrollContainer}>
                {selectedGroup.members?.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>No members available</p>
                  </div>
                ) : (
                  <div className={styles.membersGrid}>
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
          <div className={styles.groupEventsContainer}>
            {selectedGroup.role === "guest" &&
            selectedGroup.privacy === "private" ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>
                  You are not allowed to see Events
                </p>
              </div>
            ) : (
              <>
                <div className={styles.eventsHeader}>
                  <h3>Upcoming Events</h3>
                  {(selectedGroup.role === "admin" ||
                    selectedGroup.role === "member") && (
                    <button
                      className={styles.createEventBtn}
                      onClick={() => setShowEventForm(true)}
                    >
                      Create Event
                    </button>
                  )}
                </div>

                <div className={styles.eventsScrollContainer}>
                  {selectedGroup.events?.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyTitle}>No events available</p>
                    </div>
                  ) : (
                    <div className={styles.eventsList}>
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
  );
}
