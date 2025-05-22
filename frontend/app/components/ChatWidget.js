"use client";
import { useState, useEffect, useRef } from "react";
import "../styles/ChatWidget.css";
// import UserCard from "./UserCard";
import ChatContact from "./ChatContact";
import Message from "./Message";
import { websocket } from "../websocket/ws";
import { addToListeners, removeFromListeners } from "../websocket/ws";
import 'emoji-picker-element';

export default function ChatWidget({ users, groups, myData }) {
  const [activeTab, setActiveTab] = useState("friends");
  // const [userData, setUserData] = useState();
  // const [myMessages, setMyMessages] = useState([]);
  // const [receivedMessages, setReceivedMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [openWidget, setOpenWidget] = useState(true);
  const [openChatWidget, setOpenChatWidget] = useState(true);
  const [openEmojiSection, setOpenEmojiSection] = useState(false);
  const [messageSending, setMessageSending] = useState("");
  const messagesEndRef = useRef(null);

  const listToRender = activeTab === "friends" ? users : groups;

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

  async function showUserTab(user) {
    setSelectedUser(user);

    try {
      const response = await fetch(
        `http://localhost:8404/chats?id=${user.user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch messages");
      }

      const data = await response.json();
      console.log("User Data: ", data);

      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
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

  const emojiPickerRef = useRef(null);

  useEffect(() => {
    if (!openEmojiSection) return;

    const picker = emojiPickerRef.current;
    if (!picker) return;

    const handleEmojiClick = (event) => {
      const emoji = event.detail.unicode;
      console.log(emoji);

      setMessageSending((prev) => prev + emoji);
    };

    picker.addEventListener("emoji-click", handleEmojiClick);

    return () => {
      picker.removeEventListener("emoji-click", handleEmojiClick);
    };
  }, [openEmojiSection]);

  return (
    <div className="chat-wrapper-fixed">
      {selectedUser && (
        <div className="chat-box">
          <div
            className={`chat-header ${openChatWidget ? "opened" : "closed"}`}
            onClick={toggleChatWidget}
          >
            <img
              src={
                selectedUser.avatar
                  ? `${selectedUser.avatar}`
                  : `${selectedUser.image}`
              }
              className="chat-header-avatar"
              alt={selectedUser.username}
            />
            <h4 className="chat-title">{selectedUser.username}</h4>
            {/* {openChatWidget && (
              <span className="close-tab" onClick={setSelectedUser(false)}>
                X
              </span>
            )} */}
          </div>

          {openChatWidget && messages && (
            <div className="chat-messages">
              <div className="messages-container">
                {messages.map((msg) => (
                  <Message
                    key={msg.message_id}
                    message={msg}
                    isSent={msg.username !== selectedUser.username}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
          {openChatWidget && !messages && (
            <div className="chat-messages">
              <div className="messages-container">
                <h4>No Messages yet.</h4>
                {/* {messages.map((msg) => (
                <Message
                  key={msg.id}
                  message={msg}
                  isSent={msg.username !== selectedUser.username}
                />
              ))} */}
              </div>
            </div>
          )}
          {openChatWidget && (
            <div className="message-input">
              <div className="emoji-toggle">
                <button onClick={() => {
                  toggleEmojiSection()
                }}>emoji</button>
              </div>
              <input
                onChange={(e) => {
                  setMessageSending(e.target.value);
                }}
                className="message-input-input"
                placeholder="your message..."
                value={messageSending}
              ></input>
              <div
                className="send-message-container"
                onClick={(e) => {
                  e.preventDefault();
                  handleMessagesSend(selectedUser.user_id);

                  // handleMessagesSending(selectedUser.id);
                }}
              >
                <img className="send-message-icon" src="./icons/send.svg"></img>
                <p>Send</p>
              </div>
              {openEmojiSection && (
                <div className="emoji-section">
                  <emoji-picker ref={emojiPickerRef}></emoji-picker>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!openWidget && (
        <div className="overall-chat-container-closed">
          <div className="chats-header" onClick={toggleWidget}>
            <h4 className="chat-title">Messages</h4>
            <div className="unread-messages">
              <p className="unread-message-number">{myData.total_messages}</p>
            </div>
          </div>
        </div>
      )}
      {openWidget && (
        <div className="overall-chat-container">
          <div className="chats-header" onClick={toggleWidget}>
            <h4 className="chat-title">Messages</h4>
            <div className="unread-messages">
              <p className="unread-message-number">
                {myData.total_messages} New Messages
              </p>
            </div>
          </div>

          <div className="chat-tabs">
            <div
              className={`users-chat-tab ${activeTab === "friends" ? "active-tab" : ""
                }`}
              onClick={() => setActiveTab("friends")}
            >
              <h4 className="friends-message-labes">Friends (5)</h4>
            </div>
            <div
              className={`users-chat-tab ${activeTab === "groups" ? "active-tab" : ""
                }`}
              onClick={() => setActiveTab("groups")}
            >
              <h4 className="groups-message-labes">Groups (2)</h4>
            </div>
          </div>

          <div className="chat-container">
            <ul className="chat-content">
              {(!listToRender ||
                (listToRender && listToRender.length === 0)) && (
                  <div className="no-users">
                    <div className="no-users-icon-container">
                      <svg
                        className="no-users-icon"
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
                    <p className="no-users-description">
                      Connect with friends to start messaging
                    </p>
                    <button className="no-users-action">
                      {/* <svg
                      className="action-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg> */}
                      Find Friends
                    </button>
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
