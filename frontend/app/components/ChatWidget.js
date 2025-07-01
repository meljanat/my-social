"use client";
import { useState, useEffect, useRef } from "react";
// import "../styles/ChatWidget.css";
import styles from "../styles/ChatWidget.module.css";

// import UserCard from "./UserCard";
import ChatContact from "./ChatContact";
import Message from "./Message";
import { websocket } from "../websocket/ws";
import { addToListeners, removeFromListeners } from "../websocket/ws";
import EmojiSection from "./EmojiSection";

export default function ChatWidget({ users, groups, myData }) {
  const [activeTab, setActiveTab] = useState("friends");
  // const [userData, setUserData] = useState();
  // const [myMessages, setMyMessages] = useState([]);
  // const [receivedMessages, setReceivedMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [openWidget, setOpenWidget] = useState(false);
  const [openChatWidget, setOpenChatWidget] = useState(true);
  const [openEmojiSection, setOpenEmojiSection] = useState(false);
  const [messageSending, setMessageSending] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const listToRender = activeTab === "friends" ? users : groups;
    const handleUserSelected = (user, offset = 0) => {
      setSelectedUser(user);
      let fetchMessages = user.group_id
        ? `chats_group?group_id=${user.group_id}&offset=${offset}`
        : `chats?id=${user.user_id}&offset=${offset}`;
      fetch(`http://localhost:8404/${fetchMessages}`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setMessages(data);
        })
        .catch((error) => {
          console.error("Error fetching messages:", error);
          setMessages([]);
        });
    };

  async function handleMessagesSend() {
    if (!messageSending.trim() || !selectedUser) return;
    const message = {
      id: Date.now(),
      content: messageSending,
      username: "me",
      created_at: 'just now',
    };

    setMessages(messages ? [...messages, message] : [message]);
    websocket.send(JSON.stringify({ type: 'message', content: messageSending, user_id: selectedUser.user_id }));

    setMessageSending("")
  }
    const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessagesSend();
    }
  };

  async function showUserTab(user) {
    setSelectedUser(user);
    handleUserSelected(user, 0)
    // try {
    //   const response = await fetch(
    //     `http://localhost:8404/chats?id=${user.user_id}&offset=0`,
    //     {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "include",
    //     }
    //   );

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || "Failed to fetch messages");
    //   }

    //   const data = await response.json();
    //   console.log("User Data: ", data);

    //   setMessages(data);
    // } catch (error) {
    //   console.error("Error fetching messages:", error);
    // }
  }

  useEffect(() => {
    const handleMessage = (msg) => {
      if (msg.type === 'message') {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            content: msg.content,
            username: msg.username,
            created_at: 'Just now',
          },
        ]);
      }
    };

    addToListeners('message', handleMessage);

    return () => {
      removeFromListeners('message', handleMessage);
    };
  }, []);

  const toggleWidget = () => {
    setOpenWidget(!openWidget);
  };
  const toggleChatWidget = () => {
    setOpenChatWidget(!openChatWidget);
  };
  const toggleEmojiSection = () => {
    console.log(openEmojiSection ? 'emo closed' : 'emo opened');

    setOpenEmojiSection(!openEmojiSection);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

return (
    <div className={styles.chatWrapperFixed}>
      {selectedUser && (
        <div
          className={`${styles.chatBox} ${
            openChatWidget ? styles.chatBoxExpanded : styles.chatBoxCollapsed
          }`}
        >
          <div
            className={`${styles.chatHeader} ${
              openChatWidget ? styles.opened : styles.closed
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
                  onKeyPress={handleKeyPress}
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
              className={`${styles.usersChatTab} ${
                activeTab === "friends" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("friends")}
            >
              <h4 className={styles.friendsMessageLabes}>Friends (5)</h4>
            </div>
            <div
              className={`${styles.usersChatTab} ${
                activeTab === "groups" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("groups")}
            >
              <h4 className={styles.groupsMessageLabes}>Groups (2)</h4>
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
                    key={user.user_id}
                    user={user}
                    isOnline={user.is_online}
                    onClick={() => {
                      console.log("user: ", user);
                      showUserTab(user);
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
