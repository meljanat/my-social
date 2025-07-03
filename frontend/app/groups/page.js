"use client";
import { useState, useEffect } from "react";
import AuthForm from "../components/AuthForm";
import { useRouter } from "next/navigation";
import GroupCard from "../components/GroupCard";
import InvitationCard from "../components/InvitationCard";
import styles from "../styles/GroupsPage.module.css";
import PendingGroupRequestCard from "../components/PendingCard";
import GroupFormModal from "../components/GroupFromModal";
import RemoveGroupModal from "../components/RemoveGroupModal";
import { joinGroup } from "../functions/group";
import {
  handleFollow,
  handelAccept,
  handleReject,
  handelAcceptOtherGroup,
  handleRejectOtherGroup,
} from "../functions/user";
import useInfiniteScroll from "../components/useInfiniteScroll";

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState("discover");
  const [groupData, setGroupData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [showRemoveGroupModal, setShowRemoveGroupModal] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const router = useRouter();

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

  function handleCreateGroup() {
    setShowGroupForm(true);
  }

  function handleGroupCreated(newGroup) {
    setMyGroups([newGroup, ...myGroups]);
    setShowGroupForm(false);
  }

  useInfiniteScroll({
    fetchMoreCallback: async () => {
      if (!selectedGroup || !selectedGroup.id || !hasMorePosts) return;

      setIsFetchingMore(true);
      // No actual fetch for more posts implemented here for this page's context.
      // This part of the hook might need re-evaluation for this specific page.
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
      } else {
        setGroupData(data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching group data:", error);
      if (endpoint === "joined") {
        setMyGroups([]);
      } else {
        setGroupData([]);
      }
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
      setGroupData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching invitations data:", error);
      setGroupData([]);
      setIsLoading(false);
    }
  };

  const handleGroupSelect = (group) => {
    router.push(`/group?id=${group.group_id}`);
  };

  useEffect(() => {
    handleTabChange("discover");
  }, []);

  const handleDeleteGroup = (groupId) => {
    setMyGroups((prevGroups) =>
      prevGroups.filter((group) => group.group_id !== groupId)
    );
    setGroupData((prevGroups) =>
      prevGroups.filter((group) => group.group_id !== groupId)
    );
    setSelectedGroup(null);
    setShowRemoveGroupModal(false);
  };

  const handleJoinGroup = (group) => {
    joinGroup(group.group_id)
    setGroupData((prev) => prev.filter((g) => g.group_id !== group.group_id));
    setMyGroups((prev) => [...prev, { ...group, is_joined: true }]);
  };

  const handleLeaveGroup = (group) => {
    setMyGroups((prev) => prev.filter((g) => g.group_id !== group.group_id));
    setGroupData((prev) => [...prev, { ...group, is_joined: false }]);
  };

  const handleCancelRequest = (groupId) => {
    setGroupData((prev) => prev.filter((group) => group.group_id !== groupId));
  };

  const handleLeaveGroupAction = async (groupId) => {
    try {
      await leaveGroup(groupId);
      handleLeaveGroup({ group_id: groupId });
      setShowRemoveGroupModal(false);
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const removeGroupForModal = (groupId) => {
    handleDeleteGroup(groupId);
  };

  if (!isLoggedIn) {
    return <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className={styles.groupsPageContainer}>
      <div className={styles.groupsPageContent}>
        {showRemoveGroupModal && (
          <div className={styles.modalOverlay}>
            <RemoveGroupModal
              group={selectedGroup}
              onClose={() => setShowRemoveGroupModal(false)}
              onRemove={removeGroupForModal}
              onLeave={handleLeaveGroupAction}
              action={selectedGroup?.role === "admin" ? "remove" : "leave"}
            />
          </div>
        )}
        <div>
          <div className={styles.groupsHeader}>
            <h1>Groups</h1>
            <button
              className={styles.createGroupBtn}
              onClick={handleCreateGroup}
            >
              + Create Group
            </button>
          </div>
          {showGroupForm && (
            <GroupFormModal
              onClose={() => setShowGroupForm(false)}
              onGroupCreated={handleGroupCreated}
            />
          )}

          <div className={styles.groupsTabs}>
            <button
              className={`${styles.tabButton} ${activeTab === "my-groups" ? styles.activeTab : ""
                }`}
              onClick={() => handleTabChange("my-groups")}
            >
              My Groups
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "discover" ? styles.activeTab : ""
                }`}
              onClick={() => handleTabChange("discover")}
            >
              Discover
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "pending-groups" ? styles.activeTab : ""
                }`}
              onClick={() => handleTabChange("pending-groups")}
            >
              Pending Groups
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "invitations" ? styles.activeTab : ""
                }`}
              onClick={() => handleTabChange("invitations")}
            >
              Invitations
            </button>
          </div>

          <div className={styles.groupsSearch}>
            <input
              type="text"
              placeholder="Search groups..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.groupsGrid}>
            {isLoading ? (
              <div className={styles.loadingMessage}>Loading...</div>
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
                        fetchUserInvitationsData();
                      }}
                      onDecline={() => {
                        handleRejectOtherGroup(
                          invitation.user.user_id,
                          invitation.group.group_id
                        );
                        fetchUserInvitationsData();
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
                        fetchUserInvitationsData();
                      }}
                      onDecline={() => {
                        handleReject(
                          invitation.user.user_id,
                          invitation.group.group_id
                        );
                        fetchUserInvitationsData();
                      }}
                    />
                  )
                )
              ) : (
                <div className={styles.noInvitationsMessage}>
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
                    onLeave={() => {
                      setSelectedGroup(group);
                      setShowRemoveGroupModal(true);
                    }}
                    onDelete={() => {
                      setSelectedGroup(group);
                      setShowRemoveGroupModal(true);
                    }}
                  />
                ))
              ) : (
                <div className={styles.noGroupsMessage}>
                  <p>You haven't joined any groups yet.</p>
                  <button
                    className={styles.discoverGroupsBtn}
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
                    onJoin={() => {
                      handleJoinGroup(group);
                    }}
                    onClick={() => {
                      handleGroupSelect(group);
                    }}
                    isDiscoverTab={true}
                  />
                ))
              ) : (
                <div className={styles.noGroupsMessage}>
                  <p>No groups available for discovery.</p>
                  <button
                    className={styles.createGroupBtn}
                    onClick={() => setShowGroupForm(true)}
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
                  onCancelRequest={() => {
                    handleFollow(0, group.group_id);
                    handleCancelRequest(group.group_id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGroupSelect(group);
                  }}
                  onCancel={handleCancelRequest}
                />
              ))
            ) : (
              <div className={styles.noGroupsMessage}>
                <p>No pending group requests.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
