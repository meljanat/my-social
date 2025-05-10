// "use client";
// import React, { useState, useEffect, useRef } from 'react';
// import "../styles/Notifications.css";

// const Notifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [notificationType, setNotificationType] = useState("all");
//   const notificationRef = useRef(null);

//   const fetchNotifications = async () => {
//     try {
//       console.log("aaaaaaa");
//       const response = await fetch("http://localhost:8404/notifications", {
//         method: "GET",
//         credentials: "include",
//       });

//       console.log("Status:", response.status);

//       if (!response.ok) throw new Error('Failed to fetch notifications');

//       const data = await response.json();
//       console.log("المحتوى:", data);

//       setNotifications(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error(error.message);
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       const response = await fetch("http://localhost:8404/notifications/mark_all_as_read", {
//         method: 'PUT',
//         credentials: 'include',
//       });

//       if (!response.ok) throw new Error('Failed to mark all as read');

//       setNotifications((prev) =>
//         prev.map((n) => ({ ...n, read: true }))
//       );
//     } catch (error) {
//       console.error(error.message);
//     }
//   };

//   const markAsRead = async (id) => {
//     try {
//       const response = await fetch("http://localhost:8404/notifications/mark_as_read", {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify(id),
//       });

//       if (!response.ok) throw new Error('Failed to mark as read');

//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//       );
//     } catch (error) {
//       console.error(error.message);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (notificationRef.current && !notificationRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // const toggleDropdown = () => setIsOpen(!isOpen);

//   const unreadCount = notifications.filter((n) => !n.read).length;

//   const filteredNotifications = notifications.filter((n) => {
//     if (notificationType === "all") return true;
//     return n.type_notification === notificationType;
//   });

//   return (
//     <div className="notification-wrapper" ref={notificationRef}>
//       <div className="notification-dropdown open-always">
//         <div className="notification-header">
//           <span>Notifications</span>
//           <button onClick={markAllAsRead}>Mark all as read</button>
//         </div>

//         <div className="notification-type-toggle">
//           <button
//             onClick={() => setNotificationType("all")}
//             className={notificationType === "all" ? "active" : ""}
//           >
//             All
//           </button>
//           <button
//             onClick={() => setNotificationType("general")}
//             className={notificationType === "general" ? "active" : ""}
//           >
//             General
//           </button>
//           <button
//             onClick={() => setNotificationType("chat")}
//             className={notificationType === "chat" ? "active" : ""}
//           >
//             Chat
//           </button>
//         </div>

//         <ul className="notification-list">
//           {filteredNotifications.length === 0 ? (
//             <li className="no-notifications">No notifications</li>
//           ) : (
//             filteredNotifications.map((n) => (
//               <li
//                 key={n.id}
//                 className={n.read ? 'read' : 'unread'}
//                 onClick={() => markAsRead(n.id)}
//               >
//                 {n.message}
//               </li>
//             ))
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default Notifications;

// // "use client";
// // import { useEffect, useState } from "react";
// // import "../styles/Notifications.css";

// // export default function NotificationsComponent() {
// //   const [notifications, setNotifications] = useState([]);

// //   useEffect(() => {
// //     const fetchNotifications = async () => {
// //       try {
// //         const response = await fetch("http://localhost:8404/notifications", {
// //           method: "GET",
// //           credentials: "include",
// //         });

// //         if (!response.ok) throw new Error("Failed to fetch notifications");

// //         // const data = await response.json();
// //         // setNotifications(data);

// //         const data = await response.json();
// //         setNotifications(Array.isArray(data) ? data : []);

// //       } catch (error) {
// //         console.error("Error fetching notifications:", error);
// //       }
// //     };

// //     fetchNotifications();
// //   }, []);

// //   if (!notifications.length) return <p>No notifications found.</p>;

// //   return (
// //     <div className="notifications-container">
// //       <h2>Notifications</h2>
// //       <ul>
// //         {notifications.map((n) => (
// //           <li key={n.id} style={{ fontWeight: n.read ? "normal" : "bold" }}>
// //             {n.message}
// //           </li>
// //         ))}
// //       </ul>
// //     </div>
// //   );
// // }

"use client";
import React, { useState, useEffect, useRef } from "react";
import "../styles/Notifications.css";
// import { connectSocket, subscribeToMessages } from "./websocket";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationType, setNotificationType] = useState("all");
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:8404/notifications", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        "http://localhost:8404/notifications/mark_all_as_read",
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error(error.message);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(
        "http://localhost:8404/notifications/mark_as_read",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(id),
        }
      );

      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // connectSocket();
    // subscribeToMessages((data) => {
    //   if (data.type === "notification") {
    //     console.log("aaaaa");

    //     setNotifications((prev) => [data.notification, ...prev]);
    //   }
    // });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notificationType === "all") return true;
    return n.type_notification === notificationType;
  });

  return (
    <div className="notification-wrapper" ref={notificationRef}>
      <div className="notification-dropdown open-always">
        <div className="notification-header">
          <span>Notifications</span>
          <button onClick={markAllAsRead}>Mark all as read</button>
        </div>

        <div className="notification-type-toggle">
          <button
            onClick={() => setNotificationType("all")}
            className={notificationType === "all" ? "active" : ""}
          >
            All
          </button>
          <button
            onClick={() => setNotificationType("general")}
            className={notificationType === "general" ? "active" : ""}
          >
            General
          </button>
          <button
            onClick={() => setNotificationType("chat")}
            className={notificationType === "chat" ? "active" : ""}
          >
            Chat
          </button>
        </div>

        <ul className="notification-list">
          {filteredNotifications.length === 0 ? (
            <li className="no-notifications">No notifications</li>
          ) : (
            filteredNotifications.map((n) => (
              <li
                key={n.id}
                className={n.read ? "read" : "unread"}
                onClick={() => markAsRead(n.id)}
              >
                {n.message}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
