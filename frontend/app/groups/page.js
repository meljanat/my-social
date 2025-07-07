"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GroupCard from "../components/GroupCard";
import InvitationCard from "../components/InvitationCard";
import styles from "../styles/GroupsPage.module.css";
import PendingGroupRequestCard from "../components/PendingCard";
import GroupFormModal from "../components/GroupFromModal";
import RemoveGroupModal from "../components/RemoveGroupModal";
import {
  handleFollow,
  handelAccept,
  handleReject,
  handelAcceptOtherGroup,
  handleRejectOtherGroup,
} from "../functions/user";

export default function GroupsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [groupData, setGroupData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [myGroups, setMyGroups] = useState([]);
  const [showRemoveGroupModal, setShowRemoveGroupModal] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchGroupData("suggested");
  }, []);

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

  const handleDeleteGroup = async (groupId) => {
    await handleFollow(0, groupId);
    fetchGroupData("joined");
    setShowRemoveGroupModal(false);
  };

  const handleJoinGroup = async (group_id) => {
    await handleFollow(0, group_id);
    fetchGroupData("suggested");
  };

  const handleLeaveGroup = async (group_id) => {
    await handleFollow(0, group_id);
    fetchGroupData("joined");
    setShowRemoveGroupModal(false);
  };

  const handleCancelRequest = () => {
    fetchGroupData("pending");
  };

  const handleGroupCreated = () => {
    setShowGroupForm(false);
    setActiveTab("my-groups");
    fetchGroupData("joined");
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.groupsPageContainer}>
      <div className={styles.groupsPageContent}>
        {showRemoveGroupModal && (
          <div className={styles.modalOverlay}>
            <RemoveGroupModal
              group={selectedGroup}
              onClose={() => {
                setShowRemoveGroupModal(false);
                setSelectedGroup(null);
              }}
              onRemove={() => {
                handleDeleteGroup(selectedGroup.group_id);
                setSelectedGroup(null);
              }}
              onLeave={() => {
                handleLeaveGroup(selectedGroup.group_id);
                setSelectedGroup(null);
              }}
              action={selectedGroup?.role === "admin" ? "remove" : "leave"}
            />
          </div>
        )}
        <div>
          <div className={styles.groupsHeader}>
            <h1>Groups</h1>
            <button
              className={styles.createGroupBtn}
              onClick={() => setShowGroupForm(true)}
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
                      onAccept={async () => {
                        await handelAcceptOtherGroup(
                          invitation.user.user_id,
                          invitation.group.group_id
                        );
                        fetchUserInvitationsData();
                      }}
                      onDecline={async () => {
                        await handleRejectOtherGroup(
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
                      onAccept={async () => {
                        await handelAccept(
                          invitation.user.user_id,
                          invitation.group.group_id
                        );
                        fetchUserInvitationsData();
                      }}
                      onDecline={async () => {
                        await handleReject(
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
                    onAction={() => {
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
                      handleJoinGroup(group.group_id);
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
                    handleCancelRequest();
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
