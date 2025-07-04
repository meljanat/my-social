"use client";
import React, { useEffect, useState, useRef, use } from "react";
import AuthForm from "../components/AuthForm";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../styles/MessagesPage.module.css";
import { addToListeners, removeFromListeners } from "../websocket/ws.js";
import { websocket } from "../websocket/ws.js";
import EmojiSection from "../components/EmojiSection";

const Message = ({ message, isSent }) => {
  return (
    <div
      className={`${styles.message} ${isSent ? styles.sent : styles.received}`}
    >
      {!isSent && (
        <div className={styles.messageUserHeader}>
          <img
            className={styles.messageUserAvatar}
            src={message.avatar || "/inconnu/avatar.png"}
            alt={message.username}
          />
          <p>{message.username}</p>
        </div>
      )}
      <p className={styles.messageContent}>{message.content}</p>
      <span className={styles.messageTime}>{message.created_at}</span>
    </div>
  );
};

const UserCard = ({ user, isActive, onClick }) => {
  // const handleMessage = (msg) => {
  //   console.log(isActive, msg);

  //   if (
  //     !isActive &&
  //     msg.type === "message" &&
  //     ((user.username && msg.username === user.username) || (user.name && msg.name === user.name))
  //   ) {
  //     user.total_messages++;
  //   }
  // };
  // useEffect(() => {
  //   addToListeners("message", handleMessage);

  //   return () => {
  //     removeFromListeners("message", handleMessage);
  //   };
  // }, []);
  // console.log("user", user, isActive);
  console.log(user.total_messages);

  return (
    <li
      className={`${styles.userItem} ${isActive ? styles.activeUser : ""}`}
      onClick={() => {
        onClick();
        if (user.total_messages > 0) {
          user.total_messages = 0;
        }
      }}
      data-id={user.user_id || user.group_id}
    >
      <img
        src={user.avatar || user.image || "/inconnu/avatar.png"}
        className={styles.userAvatar}
        alt={user.username || user.name}
      />
      <div className={styles.userDetails}>
        <div className={styles.userInfo}>
          <h4 className={styles.userName}>
            {user.first_name
              ? `${user.first_name} ${user.last_name}`
              : user.name}
          </h4>
          <p className={styles.userUsername}>
            {user.username
              ? `@${user.username}`
              : user.total_members
              ? `(${user.total_members}) Members`
              : ""}
          </p>
        </div>
        {user && user.total_messages > 0 && (
          <div className={styles.unreadBadge}>{user.total_messages}</div>
        )}
      </div>
    </li>
  );
};

export default function MessagesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [activeTab, setActiveTab] = useState("friends");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [openEmojiSection, setOpenEmojiSection] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const conversationRef = useRef(null);
  const usersListRef = useRef(null);
  const sidebarRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const selectedUserId = searchParams.get("user");
  const selectedGroupId = searchParams.get("group");

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
    if (!isLoggedIn) return;

    if (selectedGroupId) {
      setActiveTab("groups");
    } else {
      setActiveTab("friends");
    }
  }, [selectedUserId, selectedGroupId]);

  const getUserChat = async (user_id = 0) => {
    const response = await fetch(
      `http://localhost:8404/profile?user_id=${user_id}`,
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
      // setUsers([data, ...users]);
      setSelectedUser(data);
    } else {
      console.log("Error fetching user chat:", response.statusText);
    }
  };

  const handleSeeProfile = () => {
    if (!selectedUser) return;

    if (selectedUser.user_id) {
      router.push(`/profile?id=${selectedUser.user_id}`);
    } else if (selectedUser.group_id) {
      router.push(`/group?id=${selectedUser.group_id}`);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `http://localhost:8404/connections?offset=${offset}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(
        `http://localhost:8404/groups?type=joined&offset=${offset}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      setGroups(data);
      console.log("Fetched groups:", data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetchGroups();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || (!selectedUserId && !selectedGroupId)) return;

    handleUserSelect(selectedUserId, selectedGroupId, 0);
  }, [selectedUserId, selectedGroupId, users, groups]);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = () => {
    if (conversationRef.current) {
      const { scrollTop } = conversationRef.current;
      if (scrollTop === 0) {
        fetchMoreMessages(selectedUser, messages.length);
      }
    }
  };

  const handleSidebarScroll = () => {
    if (!sidebarRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;

    if (scrollHeight - (scrollTop + clientHeight) < 50 && !isLoading) {
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    if (selectedUser && usersListRef.current) {
      const selectedElement = usersListRef.current.querySelector(
        `.${styles.userItem}[data-id="${
          selectedUser.user_id || selectedUser.group_id
        }"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedUser]);

  const handleUserSelect = (user_id, group_id, offset = 0) => {
    const user = user_id ? users?.find((u) => u.user_id == user_id) : null;
    const group = group_id ? groups?.find((g) => g.group_id == group_id) : null;

    if (user || group) {
      setSelectedUser(user || group);
    } else {
      getUserChat(user_id);
    }

    let fetchMessages = group_id
      ? `chats_group?group_id=${group_id}&offset=${offset}`
      : `chats?id=${user_id}&offset=${offset}`;
    fetch(`http://localhost:8404/${fetchMessages}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setMessages(data);
        console.log("Fetched messages:", data);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        setMessages([]);
      });
  };

  const fetchMoreMessages = (user, offset) => {
    let fetchMessages = `id=${user.user_id}&offset=${offset}`;
    fetch(`http://localhost:8404/chats?${fetchMessages}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setMessages(messages ? [...data, ...messages] : data);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  };

  const handleMessage = (msg) => {
    if (msg.type === "message") {
      if (
        selectedUser &&
        ((selectedUser.username && msg.username === selectedUser.username) ||
          (selectedUser.name && msg.name === selectedUser.name) ||
          msg.user_id === msg.current_user)
      ) {
        setMessages((prevMessages) => [
          ...(prevMessages ? prevMessages : []),
          msg,
        ]);
      }

      if (!selectedUser) {
        fetchUsers();
        fetchGroups();
      }
    } else if (msg.type === "new_connection" || msg.type === "disconnection") {
      fetchUsers();
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    addToListeners("message", handleMessage);
    addToListeners("new_connection", handleMessage);
    addToListeners("disconnection", handleMessage);

    return () => {
      removeFromListeners("message", handleMessage);
      removeFromListeners("new_connection", handleMessage);
      removeFromListeners("disconnection", handleMessage);
    };
  }, []);

  const readMessages = async () => {
    await fetch("http://localhost:8404/read_messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: selectedUser.user_id || 0,
        group_id: selectedUser.group_id || 0,
      }),
      credentials: "include",
    });
  };

  useEffect(() => {
    if (!isLoggedIn || !selectedUser) return;

    readMessages();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedUser) return;

    const mssg = {
      type: "message",
      group_id: selectedUser.group_id || 0,
      user_id: selectedUser.user_id || 0,
      content: newMessage,
    };

    websocket.send(JSON.stringify(mssg));
    setNewMessage("");
  };

  const toggleEmojiSection = () => {
    setOpenEmojiSection(!openEmojiSection);
  };
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className={styles.messagesPageContainer}>
      {showNewMessageModal && (
        <div className={styles.newMessageModalOverlay}>
          <div className={styles.newMessageModal}>
            <h2>Create New Message</h2>
            <button
              className={styles.closeButton}
              onClick={() => setShowNewMessageModal(false)}
            >
              &times;
            </button>
            <form
              className={styles.newMessageForm}
              onSubmit={(e) => {
                e.preventDefault();
                if (newMessage.trim()) {
                  handleSendMessage(e);
                  setShowNewMessageModal(false);
                }
              }}
            >
              <input
                type="textArea"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className={styles.newMessageInput}
              />
              <select
                className={styles.newMessageSelect}
                onChange={(e) => {
                  const userId = e.target.value;
                  // if (userId) {
                  //   handleUserSelect(userId, 0, 0);
                  //   setSelectedUser(users.find((u) => u.user_id == userId));
                  // } else {
                  //   setSelectedUser(null);
                  // }
                }}
              >
                <option value="">Select User</option>
                {/* {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.first_name ? `${user.first_name} ${user.last_name}` : user.name}
                  </option>
                ))} */}
              </select>
              <button type="submit" className={styles.sendButton}>
                Send message
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={styles.messagesPageContent}>
        <div className={styles.messagesSidebar}>
          <div className={styles.messagesHeader}>
            <h2>Messages</h2>
            <div
              className={styles.newMessageButton}
              onClick={() => setShowNewMessageModal(true)}
            >
              <span className={styles.newMessageIconContainer}>
                {/* <img
                  src="/icons/message.svg"
                  alt="User Avatar"
                  className={styles.newMessageIcon}
                /> */}
                +
              </span>
            </div>
          </div>

          <div className={styles.messagesTabs}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "friends" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("friends")}
            >
              Friends
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "groups" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("groups")}
            >
              Groups
            </button>
          </div>

          {/* <div className={styles.searchMessages}>
            <input
              type="text"
              placeholder="Search messages..."
              className={styles.searchInput}
            />
          </div> */}

          <div
            className={styles.usersListContainer}
            ref={sidebarRef}
            onScroll={handleSidebarScroll}
          >
            <ul className={styles.usersList} ref={usersListRef}>
              {activeTab === "friends"
                ? users?.length > 0 &&
                  users.map((user) => (
                    <UserCard
                      key={user.user_id}
                      user={user}
                      isActive={
                        selectedUser && selectedUser.user_id === user.user_id
                      }
                      onClick={() => {
                        router.push(`/messages?user=${user.user_id}`);
                      }}
                    />
                  ))
                : groups?.length > 0 &&
                  groups.map((group) => (
                    <UserCard
                      key={group.group_id}
                      user={group}
                      isActive={
                        selectedUser && selectedUser.group_id === group.group_id
                      }
                      onClick={() => {
                        router.push(`/messages?group=${group.group_id}`);
                      }}
                    />
                  ))}
              {!users?.length && activeTab === "friends" && (
                <div className={styles.noUsersMessage}>
                  You have no chats yet.
                </div>
              )}
              {!groups?.length && activeTab === "groups" && (
                <div className={styles.noUsersMessage}>
                  You haven't joined any groups yet.
                </div>
              )}
            </ul>
          </div>
        </div>

        <div className={styles.messagesMain}>
          {selectedUser ? (
            <>
              <div className={styles.conversationHeader}>
                <div className={styles.conversationUserInfo}>
                  <img
                    src={
                      selectedUser.avatar ||
                      selectedUser.image ||
                      "/inconnu/avatar.png"
                    }
                    alt={selectedUser.username || selectedUser.name}
                    className={styles.conversationAvatar}
                  />
                  <div className={styles.conversationUserDetails}>
                    <h3 className={styles.conversationUserName}>
                      {selectedUser.first_name
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : selectedUser.name}
                    </h3>
                    {selectedUser.username && (
                      <p className={styles.conversationUserStatus}>
                        <span
                          className={`${styles.statusDot} ${
                            selectedUser.online ? styles.online : styles.offline
                          }`}
                        ></span>
                        {selectedUser.online ? "Online" : "Offline"}
                      </p>
                    )}
                  </div>
                </div>
                <div className={styles.conversationActions}>
                  <button
                    className={styles.actionButton}
                    onClick={handleSeeProfile}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    See Profile
                  </button>
                </div>
              </div>

              <div
                className={styles.conversationMessages}
                ref={conversationRef}
                onScroll={handleScroll}
              >
                {messages && messages.length > 0 ? (
                  messages.map((message, index) => (
                    <Message
                      key={index}
                      message={message}
                      isSent={
                        message.current_user
                          ? message.user_id === message.current_user
                          : message.username !== selectedUser.username
                      }
                    />
                  ))
                ) : (
                  <div className={styles.noMessagesYet}>
                    No messages in this conversation.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedUser.is_following ||
              selectedUser.privacy === "public" ||
              (selectedUser.role !== "guest" && selectedUser.group_id) ? (
                <form
                  className={styles.messageInputForm}
                  onSubmit={handleSendMessage}
                >
                  <button type="button" className={styles.attachmentButton}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className={styles.emojiToggle}>
                    <button type="button" onClick={toggleEmojiSection}>
                      😄
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                    }}
                    className={styles.messageInput}
                  />
                  <button type="submit" className={styles.sendButton}>
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
                  {openEmojiSection && (
                    <EmojiSection
                      onEmojiSelect={(emoji) => {
                        setNewMessage((prev) => prev + emoji);
                      }}
                    />
                  )}
                </form>
              ) : (
                <div className={styles.messageInputDisabled}>
                  <p>You are not allowed to send messages in this chat.</p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noConversationSelected}>
              <div className={styles.noConversationContent}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="687"
                  height="687"
                  fill="none"
                  viewBox="0 0 687 687"
                >
                  <g filter="url(#filter0_f_64_1159)">
                    <circle
                      cx="343.5"
                      cy="343.5"
                      r="193.5"
                      fill="#C1CBFF"
                    ></circle>
                  </g>
                  <circle
                    cx="343.5"
                    cy="343.5"
                    r="215.5"
                    fill="#EFF2FF"
                    stroke="#fff"
                    strokeWidth="12"
                  ></circle>
                  <mask
                    id="mask0_64_1159"
                    width="417"
                    height="417"
                    x="135"
                    y="135"
                    maskUnits="userSpaceOnUse"
                    style={{ maskType: "alpha" }}
                  >
                    <circle
                      cx="343.5"
                      cy="343.5"
                      r="208.5"
                      fill="#fff"
                    ></circle>
                  </mask>
                  <g mask="url(#mask0_64_1159)">
                    <path
                      fill="#4D64DE"
                      fillRule="evenodd"
                      d="M347.301 247.77a15 15 0 0 0-17.37 0L177.344 356.123c-5.002 3.551-6.849 8.919-6.228 13.953v177.027c0 13.807 11.193 25 25 25h285c13.807 0 25-11.193 25-25V370.077c.621-5.034-1.226-10.402-6.228-13.954z"
                      clipRule="evenodd"
                    ></path>
                    <mask
                      id="mask1_64_1159"
                      width="336"
                      height="328"
                      x="171"
                      y="245"
                      maskUnits="userSpaceOnUse"
                      style={{ maskType: "alpha" }}
                    >
                      <path
                        fill="#4D64DE"
                        fillRule="evenodd"
                        d="M343.887 247.308a9 9 0 0 0-10.543 0L175.4 361.454c-1.377.995-2.348 2.219-2.957 3.547a6.97 6.97 0 0 0-1.327 4.102v178c0 13.807 11.193 25 25 25h285c13.807 0 25-11.193 25-25v-178c0-1.532-.493-2.95-1.328-4.102-.608-1.328-1.58-2.552-2.957-3.547z"
                        clipRule="evenodd"
                      ></path>
                    </mask>
                    <g mask="url(#mask1_64_1159)">
                      <path
                        fill="#fff"
                        d="M218.116 385.603h244v108h-244z"
                      ></path>
                      <path
                        fill="url(#paint0_linear_64_1159)"
                        d="M171.116 573.498v-189l337 189z"
                      ></path>
                      <path
                        fill="url(#paint1_linear_64_1159)"
                        d="M508.116 573.498v-189l-337 189z"
                      ></path>
                      <path
                        fill="#B5C0FF"
                        d="M324.781 444.044c8.205-6.95 20.233-6.95 28.438 0l137.443 116.419c15.634 13.242 6.269 38.787-14.219 38.787H201.557c-20.488 0-29.853-25.545-14.219-38.787z"
                      ></path>
                    </g>
                    <path
                      fill="#fff"
                      d="M218.116 297.603h196c26.509 0 48 21.49 48 48v43h-244z"
                    ></path>
                    <path
                      fill="#fff"
                      d="M218.116 297.603h196c26.509 0 48 21.49 48 48v43h-244z"
                    ></path>
                    <path
                      fill="url(#paint2_linear_64_1159)"
                      fillRule="evenodd"
                      d="M171.116 341.499h43v.104h156c.665-23.699 19.535-42.845 43.122-43.949a44 44 0 0 0-2.122-.051H219.493a46 46 0 0 0-3.101-.104c-24.583 0-44.591 19.583-45.276 44"
                      clipRule="evenodd"
                    ></path>
                    <path
                      fill="url(#paint3_linear_64_1159)"
                      fillRule="evenodd"
                      d="M276.116 365.499h125v6h-125zm0 20h125v6h-125zm125 20h-125v6h125z"
                      clipRule="evenodd"
                    ></path>
                  </g>
                  <g filter="url(#filter1_f_64_1159)">
                    <circle
                      cx="471.5"
                      cy="306.5"
                      r="48.5"
                      fill="#FF7070"
                      fillOpacity="0.7"
                    ></circle>
                  </g>
                  <circle
                    cx="460.5"
                    cy="295.5"
                    r="48.5"
                    fill="url(#paint4_linear_64_1159)"
                  ></circle>
                  <path
                    fill="#fff"
                    fillRule="evenodd"
                    d="M453.133 307.633 469.03 280.1c-2.341-1.352-5.717 1.081-12.468 5.945l-10.693 7.706c-4.1 2.954-6.149 4.431-6.738 5.766-.85 1.929-.468 4.104.946 5.383.979.886 3.327 1.103 8.021 1.537 1.737.161 2.605.241 3.402.485.572.176 1.12.415 1.633.711"
                    clipRule="evenodd"
                  ></path>
                  <path
                    fill="#FFE8E8"
                    d="m468.788 306.984 1.326-13.114c.838-8.279 1.257-12.418-1.084-13.77l-15.897 27.533q.773.447 1.433 1.06c.609.567 1.113 1.279 2.121 2.703 2.723 3.848 4.084 5.773 5.341 6.178 1.815.585 3.89-.172 5.135-1.873.862-1.177 1.116-3.69 1.625-8.717"
                    opacity="0.5"
                  ></path>
                  <defs>
                    <linearGradient
                      id="paint0_linear_64_1159"
                      x1="171.116"
                      x2="307.116"
                      y1="468.804"
                      y2="468.804"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#A2B1FF"></stop>
                      <stop offset="1" stopColor="#4D64DE"></stop>
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_64_1159"
                      x1="508.116"
                      x2="365.116"
                      y1="468.804"
                      y2="468.804"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#A2B1FF"></stop>
                      <stop offset="1" stopColor="#4D64DE"></stop>
                    </linearGradient>
                    <linearGradient
                      id="paint2_linear_64_1159"
                      x1="295.184"
                      x2="295.184"
                      y1="297.499"
                      y2="341.499"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#899BFF"></stop>
                      <stop offset="1" stopColor="#DEE3FF"></stop>
                    </linearGradient>
                    <linearGradient
                      id="paint3_linear_64_1159"
                      x1="276.116"
                      x2="401.116"
                      y1="411.499"
                      y2="411.499"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#B5C0FF"></stop>
                      <stop
                        offset="1"
                        stopColor="#B5C0FF"
                        stopOpacity="0"
                      ></stop>
                    </linearGradient>
                    <linearGradient
                      id="paint4_linear_64_1159"
                      x1="460.5"
                      x2="460.5"
                      y1="247"
                      y2="344"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FF9898"></stop>
                      <stop offset="1" stopColor="#FF4F4F"></stop>
                    </linearGradient>
                    <filter
                      id="filter0_f_64_1159"
                      width="687"
                      height="687"
                      x="0"
                      y="0"
                      colorInterpolationFilters="sRGB"
                      filterUnits="userSpaceOnUse"
                    >
                      <feFlood
                        floodOpacity="0"
                        result="BackgroundImageFix"
                      ></feFlood>
                      <feBlend
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      ></feBlend>
                      <feGaussianBlur
                        result="effect1_foregroundBlur_64_1159"
                        stdDeviation="75"
                      ></feGaussianBlur>
                    </filter>
                    <filter
                      id="filter1_f_64_1159"
                      width="177"
                      height="177"
                      x="383"
                      y="218"
                      colorInterpolationFilters="sRGB"
                      filterUnits="userSpaceOnUse"
                    >
                      <feFlood
                        floodOpacity="0"
                        result="BackgroundImageFix"
                      ></feFlood>
                      <feBlend
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      ></feBlend>
                      <feGaussianBlur
                        result="effect1_foregroundBlur_64_1159"
                        stdDeviation="20"
                      ></feGaussianBlur>
                    </filter>
                  </defs>
                </svg>
                <h3>Select a conversation</h3>
                <p>Choose a friend or group to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
