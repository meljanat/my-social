"use client";
import { useState, useEffect, useRef } from "react";
import styles from "../styles/ChatWidget.module.css";
import ChatContact from "./ChatContact";
import Message from "./Message";
import { websocket } from "../websocket/ws";
import { addToListeners, removeFromListeners } from "../websocket/ws";
import EmojiSection from "./EmojiSection";

export default function ChatWidget({ myusers, mygroups, mydata }) {
  console.log(mydata);
  console.log(myusers);
  console.log(mygroups);



  const [myData, setMyData] = useState(mydata);
  const [activeTab, setActiveTab] = useState("friends");
  const [listToRender, setListToRender] = useState([])
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [openWidget, setOpenWidget] = useState(false);
  const [openChatWidget, setOpenChatWidget] = useState(true);
  const [openEmojiSection, setOpenEmojiSection] = useState(false);
  const [messageSending, setMessageSending] = useState("");
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isFirstFetch, setisFirstFetch] = useState(false);
  const [scrollRein, setScrollRein] = useState();

  useEffect(() => {
    setListToRender(activeTab === "groups" ? mygroups : myusers);
  }, [activeTab]);

  useEffect(() => {
    setMessages([]);
    setScrollRein([]);
    fetchMessages(selectedUser?.user_id || selectedUser?.group_id, activeTab, 0);
  }, [selectedUser]);

  useEffect(() => {
    if (!isFirstFetch) return;
    scrollIntoLastMsg();
  }, [isFirstFetch, messages, selectedUser]);

  useEffect(() => {
    addToListeners("message", handleMessage);
    addToListeners("new_connection", handleMessage);
    addToListeners("disconnection", handleMessage);
    addToListeners("read_messages", handleMessage);

    return () => {
      removeFromListeners("message", handleMessage);
      removeFromListeners("new_connection", handleMessage);
      removeFromListeners("disconnection", handleMessage);
      removeFromListeners("read_messages", handleMessage);
    };
  }, []);

  useEffect(() => {
    const convScroll = messagesContainerRef.current;
    if (!convScroll) return;

    convScroll.addEventListener("scroll", handleScroll);

    return () => {
      convScroll.removeEventListener("scroll", handleScroll);
    };
  }, [messages, isFirstFetch]);

  useEffect(() => {
    if (!scrollRein || !messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTop = scrollRein;
  }, [scrollRein]);

  const handleMessage = async (msg) => {
    if (msg.type === "message") {
      await fetchMessages(selectedUser.user_id || selectedUser.group_id, activeTab, 0);
      if (activeTab === "friends") {
        await fetchUsers();
      } else if (activeTab === "groups") {
        await fetchGroups();
      }
    } else if (msg.type === "new_connection" || msg.type === "disconnection") {
      await fetchUsers();
    }
    await fetchUser();
  };

  const handleScroll = async () => {
    if (messagesContainerRef.current.scrollTop === 0 && isFetchingMore && !isFirstFetch) {
      const scrollBeforeFetch = messagesContainerRef.current.scrollHeight / ((messages.length / 20));
      await fetchMessages(selectedUser.user_id || selectedUser.group_id, activeTab, messages.length, scrollBeforeFetch);
    }
  };

  const scrollIntoLastMsg = () => {
    const lastMessage = messagesEndRef.current;
    if (lastMessage) {
      lastMessage.scrollIntoView();
    }
    setisFirstFetch(false);
  }

  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:8404/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setMyData(data);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.log("Failed to fetch user data:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `http://localhost:8404/connections`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      setListToRender(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(
        `http://localhost:8404/groups?type=joined&offset=-1`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      setListToRender(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchMessages = async (id, tab, offset = 0, scrollPos) => {
    if (!id) return;

    let fetchMsgs = tab === "groups"
      ? `chats_group?group_id=${id}&offset=${offset}`
      : `chats?id=${id}&offset=${offset}`;

    try {
      if (offset === 0) {
        setMessages([]);
      }
      const response = await fetch(`http://localhost:8404/${fetchMsgs}`, {
        method: "GET",
        credentials: "include",
      })
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        return;
      }
      if (data.length == 20) {
        setIsFetchingMore(true);
      } else {
        setIsFetchingMore(false);
      }
      if (offset === 0) {
        setMessages(data);
        setisFirstFetch(true);
      } else {
        setMessages((prevMessages) => [...data, ...prevMessages]);
        if (scrollPos) {
          setScrollRein(scrollPos);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  }

  const readMessages = async (id, tab) => {
    if (!id) return;

    try {
      const response = await fetch('http://localhost:8404/read_messages', {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: parseInt(tab === "friends" ? id : 0),
          group_id: parseInt(tab === "groups" ? id : 0),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }
      if (tab === "friends") {
        fetchUsers();
      } else if (tab === "groups") {
        fetchGroups();
      }
      fetchUser();
    } catch (error) {
      console.error("Error reading messages:", error);
    }
  }

  const handleMessagesSend = async () => {
    if (!messageSending.trim() || !selectedUser) return;

    const mssg = {
      type: "message",
      group_id: selectedUser.group_id || 0,
      user_id: selectedUser.user_id || 0,
      content: messageSending,
    };

    websocket.send(JSON.stringify(mssg));
    setMessageSending("");
    readMessages(selectedUser.user_id || selectedUser.group_id, activeTab);
    setisFirstFetch(true);
  };

  const toggleWidget = () => {
    setOpenWidget(!openWidget);
  };
  const toggleChatWidget = () => {
    setOpenChatWidget(!openChatWidget);
  };
  const toggleEmojiSection = () => {
    setOpenEmojiSection(!openEmojiSection);
  };

  return (
    <div className={styles.chatWrapperFixed}>
      {selectedUser && (
        <div
          className={`${styles.chatBox} ${openChatWidget ? styles.chatBoxExpanded : styles.chatBoxCollapsed
            }`}
        >
          <div
            className={`${styles.chatHeader} ${openChatWidget ? styles.opened : styles.closed
              }`}
            onClick={toggleChatWidget}
          >
            <img
              src={
                selectedUser.avatar
                  ? `${selectedUser.avatar}`
                  : `${selectedUser.image}`
              }
              className={styles.chatHeaderAvatar}
              alt={selectedUser.username}
            />
            <h4 className={styles.chatTitle}>{selectedUser.username}</h4>
            <div className={styles.toggleIndicator}>
              {openChatWidget ? "−" : "+"}
            </div>
          </div>

          {openChatWidget && (
            <>
              <div className={styles.chatMessages}>
                <div
                  className={styles.messagesContainer}
                  ref={messagesContainerRef}
                >
                  {messages && messages.length > 0 ? (
                    messages.map((msg) => (
                      <Message
                        key={msg.message_id || msg.id}
                        message={msg}
                        isSent={msg.username !== selectedUser.username}
                      />
                    ))
                  ) : (
                    <div className={styles.noMessagesContainer}>
                      <h4 className={styles.noMessagesText}>
                        No Messages yet.
                      </h4>
                      <p className={styles.noMessagesSubtext}>
                        Start the conversation!
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className={styles.messageInput}>
                <div className={styles.emojiToggle}>
                  <button
                    onClick={toggleEmojiSection}
                    className={styles.emojiButton}
                  >
                    😄
                  </button>
                </div>
                <input
                  onChange={(e) => setMessageSending(e.target.value)}
                  className={styles.messageInputInput}
                  placeholder="Type your message..."
                  value={messageSending}
                />
                <div
                  className={styles.sendMessageContainer}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMessagesSend();
                  }}
                >
                  <img
                    className={styles.sendMessageIcon}
                    src="./icons/send.svg"
                    alt="Send"
                  />
                  <p>Send</p>
                </div>
                {openEmojiSection && (
                  <div className={styles.emojiSectionContainer}>
                    <EmojiSection
                      onEmojiSelect={(emoji) => {
                        setMessageSending((prev) => prev + emoji);
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {!openWidget && (
        <div className={styles.overallChatContainerClosed}>
          <div className={styles.chatsHeader} onClick={toggleWidget}>
            <h4 className={styles.chatTitle}>Messages</h4>
            <div className={styles.unreadMessages}>
              <p className={styles.unreadMessageNumber}>
                {myData.total_messages}
              </p>
            </div>
          </div>
        </div>
      )}

      {openWidget && (
        <div className={styles.overallChatContainer}>
          <div className={styles.chatsHeader} onClick={toggleWidget}>
            <h4 className={styles.chatTitle}>Messages</h4>
            <div className={styles.unreadMessages}>
              <p className={styles.unreadMessageNumber}>
                {myData.total_messages} New Messages
              </p>
            </div>
          </div>

          <div className={styles.chatTabs}>
            <div
              className={`${styles.usersChatTab} ${activeTab === "friends" ? styles.activeTab : ""
                }`}
              onClick={() => setActiveTab("friends")}
            >
              <h4 className={styles.friendsMessageLabes}>Friends ({myData.total_chats_messages})</h4>
            </div>
            <div
              className={`${styles.usersChatTab} ${activeTab === "groups" ? styles.activeTab : ""
                }`}
              onClick={() => setActiveTab("groups")}
            >
              <h4 className={styles.groupsMessageLabes}>Groups ({myData.total_groups_messages})</h4>
            </div>
          </div>

          <div className={styles.chatContainer}>
            <ul className={styles.chatContent}>
              {(!listToRender ||
                (listToRender && listToRender.length === 0)) && (
                  <div className={styles.noUsers}>
                    <div className={styles.noUsersIconContainer}>
                      <svg
                        className={styles.noUsersIcon}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <h4>No conversations</h4>
                    <p className={styles.noUsersDescription}>
                      Connect with friends to start messaging
                    </p>
                    <button className={styles.noUsersAction}>Find Friends</button>
                  </div>
                )}
              {listToRender &&
                listToRender.map((user) => (
                  <ChatContact
                    key={user.user_id || user.group_id}
                    user={user}
                    isOnline={user.is_online}
                    onClick={() => {
                      setSelectedUser(user);
                    }}
                  />
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
