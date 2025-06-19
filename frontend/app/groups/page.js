"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GroupCard from "../components/GroupCard";
import InvitationCard from "../components/InvitationCard";
import "../../styles/GroupsPage.css";
import PendingGroupRequestCard from "../components/PendingCard";
import GroupFormModal from "../components/GroupFromModal";
import { leaveGroup } from "../functions/group";
import RemoveGroupModal from "../components/RemoveGroupModal";
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

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState("discover");
  const [groupData, setGroupData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [invitationsGroups, setInvitationsGroups] = useState([]);
  const [showRemoveGroupModal, setShowRemoveGroupModal] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const router = useRouter();

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

  const handleGroupSelect = (group) => {
    router.push(`/group?id=${group.group_id}`);
  };

  useEffect(() => {
    fetchGroupData("suggested");
  }, []);

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
              className={`tab-button ${activeTab === "my-groups" ? "active-tab" : ""
                }`}
              onClick={() => handleTabChange("my-groups")}
            >
              My Groups
            </button>
            <button
              className={`tab-button ${activeTab === "discover" ? "active-tab" : ""
                }`}
              onClick={() => handleTabChange("discover")}
            >
              Discover
            </button>
            <button
              className={`tab-button ${activeTab === "pending-groups" ? "active-tab" : ""
                }`}
              onClick={() => handleTabChange("pending-groups")}
            >
              Pending Groups
            </button>
            <button
              className={`tab-button ${activeTab === "invitations" ? "active-tab" : ""
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
                      onClick={() => setShowGroupForm(true)}
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
      </div>
    </div>
  );
}