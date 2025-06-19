"use client";
import "../../styles/GroupsPage.css";
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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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
                setError(true);
                console.error("Error checking login status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, [isLoggedIn]);

    useEffect(() => {
        async function fetchGroup(group_id) {
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
                console.log("Group dataaa:", data);

                setSelectedGroup(data);
                fetchGroupDetails("posts", data.group_id);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching group details:", error);
                setIsLoading(false);
            }
        }

        fetchGroup(group_id);
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
            console.log(`Group Members Data:`, data);
            setUsersToInvite(data);
        } catch (err) {
            console.log(err);
        }
    }

    const removeGroup = (groupId) => {
        // setGroups(groups.filter((g) => g.group_id !== groupId));
        console.log("Group to remove:", groupId);

    };

    const addNewPost = (newPost) => {
        setSelectedGroup((prev) => ({
            ...prev,
            posts: [newPost, ...(prev.posts || [])],
        }));
    };

    if (!isLoggedIn) {
        return <AuthForm onLoginSuccess={setIsLoggedIn(true)} />;
    }

    if (isLoading) {
        return (
            <div className="loading-container">
                <p>Loading...</p>
            </div>
        );
    }

    if (!selectedGroup) {
        return (
            <div className="error-container">
                <p>Error: Group not found.</p>
            </div>
        );
    }

    return (
        <div className="group-detail-container">
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
            <div className="group-detail-header">
                <img
                    src={selectedGroup.cover || "/inconnu/cover.jpg"}
                    alt={selectedGroup.name}
                    className="group-cover-image"
                />

                <button
                    className="back-button"
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
                                className={` ${selectedGroup.role === "member" ||
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

                                    // if (
                                    //     selectedGroup.role === "member" &&
                                    //     activeTab === "my-groups"
                                    // ) {
                                    //     setSelectedGroup((prev) => ({
                                    //         ...prev,
                                    //         role: "none",
                                    //     }));
                                    // } else if (activeTab === "discover") {
                                    //     if (selectedGroup.privacy === "private") {
                                    //         handleTabChange("pending-groups");
                                    //     } else {
                                    //         handleTabChange("my-groups");
                                    //     }

                                    //     setSelectedGroup((prev) => ({
                                    //         ...prev,
                                    //         role: "member",
                                    //     }));
                                    // } else if (activeTab === "pending-groups") {
                                    //     handleTabChange("discover");
                                    //     setSelectedGroup(selectedGroup);
                                    // }
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
                    className={`tab-button ${groupView === "posts" ? "active-tab" : ""
                        }`}
                    onClick={() => {
                        fetchGroupDetails("posts", selectedGroup.group_id);
                        setGroupView("posts");
                    }}
                >
                    Posts
                </button>
                <button
                    className={`tab-button ${groupView === "members" ? "active-tab" : ""
                        }`}
                    onClick={() => {
                        fetchGroupDetails("members", selectedGroup.group_id);
                        setGroupView("members");
                    }}
                >
                    Members
                </button>
                <button
                    className={`tab-button ${groupView === "events" ? "active-tab" : ""
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
    )
}