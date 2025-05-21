// import React, { useState } from "react";

// const GroupForm = () => {
//   const [groupName, setGroupName] = useState("");
//   const [groupDescription, setGroupDescription] = useState("");
//   const [privacy, setPrivacy] = useState("public");
//   const [groupImage, setGroupImage] = useState(null);
//   const [groups, setGroups] = useState([]);

//   const handleCreateGroup = async (e) => {
//     e.preventDefault();

//     const formData = new FormData();
//     formData.append("name", groupName);
//     formData.append("description", groupDescription);
//     formData.append("privacy", privacy);
//     if (groupImage) {
//       formData.append("groupImage", groupImage);
//     }

//     try {
//       const response = await fetch("http://localhost:8404/new_group", {
//         method: "POST",
//         body: formData,
//         credentials: "include",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data.error || "Failed to create group.");
//         return;
//       }

//       setGroups([...groups, { ...data, posts: [], events: [] }]);
//       setGroupName("");
//       setGroupDescription("");
//       setPrivacy("public");
//       setGroupImage(null);
//     } catch (error) {
//       console.error("Error creating group:", error);
//       alert("An error occurred.");
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Create a Group</h2>
//       <form onSubmit={handleCreateGroup}>
//         <input
//           type="text"
//           value={groupName}
//           onChange={(e) => setGroupName(e.target.value)}
//           placeholder="Group Name"
//           required
//         />
//         <textarea
//           value={groupDescription}
//           onChange={(e) => setGroupDescription(e.target.value)}
//           placeholder="Group Description"
//           rows="4"
//         />
//         <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
//           <option value="public">Public</option>
//           <option value="private">Private</option>
//         </select>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => setGroupImage(e.target.files[0])}
//           required
//         />
//         <button type="submit">Create</button>
//       </form>

//       {groups.length > 0 && (
//         <div style={{ marginTop: 20 }}>
//           <h3>Your Groups</h3>
//           {groups.map((group) => (
//             <div key={group.id} style={{ border: "1px solid #ccc", padding: 10 }}>
//               {/* <img src={group.image} alt="group" style={{ width: "100px" }} /> */}
//               <img
//               src={group.image || "https://via.placeholder.com/100?text=No+Image"}
//               alt="group"
//               style={{ width: "100px" }}
//              />

//               <h4>{group.name}</h4>
//               <p>{group.description}</p>
//               <small>Privacy: {group.privacy}</small>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GroupForm;

// import React, { useState, useEffect } from "react";

// const GroupForm = () => {
//   const [groupName, setGroupName] = useState("");
//   const [groupDescription, setGroupDescription] = useState("");
//   const [privacy, setPrivacy] = useState("public");
//   const [groupImage, setGroupImage] = useState(null);
//   const [groups, setGroups] = useState([]);
//   const [postContent, setPostContent] = useState("");
//   const [eventDetails, setEventDetails] = useState("");
//   const [eventDate, setEventDate] = useState("");
//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const [showPostForm, setShowPostForm] = useState(false);
//   const [showEventForm, setShowEventForm] = useState(false);

//   useEffect(() => {
//     const fetchGroups = async () => {
//       try {
//         const response = await fetch("http://localhost:8404/groups", {
//           method: "GET",
//           credentials: "include",
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch groups");
//         }

//         // const data = await response.json();
//         // setGroups(Array.isArray(data) ? data : []);

//         const data = await response.json();
//         setGroups(Array.isArray(data) ? data : []);

//       } catch (error) {
//         console.error("Error fetching groups:", error);
//       }
//     };

//     fetchGroups();
//   }, []);

//   const handleCreateGroup = async (e) => {
//     e.preventDefault();

//     const formData = new FormData();
//     formData.append("name", groupName);
//     formData.append("description", groupDescription);
//     formData.append("privacy", privacy);
//     if (groupImage) {
//       formData.append("groupImage", groupImage);
//     }

//     try {
//       const response = await fetch("http://localhost:8404/new_group", {
//         method: "POST",
//         body: formData,
//         credentials: "include",
//       });

//       const data = await response.json();
//       console.log("Group creation response:", data); // <-- ici

//       if (!response.ok) {
//       alert(data.error || "Failed to create group.");
//       return;
//       }

//       // setGroups((prevGroups) => {
//       //   if (!Array.isArray(prevGroups)) {
//       //     return [{ ...data, posts: [], events: [] }];
//       //   }
//       //   return [...prevGroups, { ...data, posts: [], events: [] }];
//       // });
//       // setGroups((prevGroups) => [...prevGroups, { ...data.group, posts: [], events: [] }]);

//       setGroups((prevGroups) => [...prevGroups, { ...data.group, posts: [], events: [] }]);

//       setGroupName("");
//       setGroupDescription("");
//       setPrivacy("public");
//       setGroupImage(null);
//     } catch (error) {
//       console.error("Error creating group:", error);
//       alert(`An error occurred while creating the group: ${error.message}`);
//     }
//   };

//   const handlePostSubmit = async (groupId) => {
//     if (!postContent) {
//       alert("Please enter some content for the post.");
//       return;
//     }

//     const postData = { content: postContent, groupId };

//     try {
//       const response = await fetch(`http://localhost:8404/groups/${groupId}/new_post_group`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(postData),
//         credentials: "include",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data.error || "Failed to create post.");
//         return;
//       }

//       setPostContent("");
//       alert("Post created successfully!");
//     } catch (error) {
//       console.error("Error creating post:", error);
//       alert("An error occurred while creating the post.");
//     }
//   };

//   const handleEventSubmit = async (groupId) => {
//     if (!eventDetails || !eventDate) {
//       alert("Please provide event details and date.");
//       return;
//     }

//     const eventData = { details: eventDetails, date: eventDate, groupId };

//     try {
//       const response = await fetch(`http://localhost:8404/groups/${groupId}/new_event`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(eventData),
//         credentials: "include",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data.error || "Failed to create event.");
//         return;
//       }

//       setEventDetails("");
//       setEventDate("");
//       alert("Event created successfully!");
//     } catch (error) {
//       console.error("Error creating event:", error);
//       alert("An error occurred while creating the event.");
//     }
//   };

//   const handleGroupClick = (group) => {
//     setSelectedGroup(group);
//     setShowPostForm(false);
//     setShowEventForm(false);
//   };

//   // console.log(groups);
//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Create a Group</h2>
//       <form onSubmit={handleCreateGroup}>
//         <input
//           type="text"
//           value={groupName}
//           onChange={(e) => setGroupName(e.target.value)}
//           placeholder="Group Name"
//           required
//         />
//         <textarea
//           value={groupDescription}
//           onChange={(e) => setGroupDescription(e.target.value)}
//           placeholder="Group Description"
//           rows="4"
//         />
//         <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
//           <option value="public">Public</option>
//           <option value="private">Private</option>
//         </select>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => setGroupImage(e.target.files[0])}
//         />
//         <button type="submit">Create</button>
//       </form>

//       {!selectedGroup && groups.length > 0 && (
//         <div style={{ marginTop: 20 }}>
//           <h3>Your Groups</h3>
//           {groups.map((group) => (
//   <div key={group.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
//     <img
//       src={group.image || "https://placehold.co/100x100?text=No+Image"}
//       alt="group"
//       style={{ width: "100px" }}
//     />
//     <h4>{group.name}</h4>
//     <p>{group.description}</p>
//     <small>Privacy: {group.privacy}</small>
//     <br />
//     <button onClick={() => handleGroupClick(group)}>View Group</button>
//   </div>
// ))}
//         </div>
//       )}

//       {selectedGroup && (
//         <div style={{ marginTop: 20 }}>
//           <button onClick={() => setSelectedGroup(null)}>← Back to All Groups</button>
//           <h3>{selectedGroup.name}</h3>
//           <img
//             src={selectedGroup.image || "https://placehold.co/100x100?text=No+Image"}
//             alt="group"
//             style={{ width: "100px" }}
//           />
//           <p>{selectedGroup.description}</p>
//           <small>Privacy: {selectedGroup.privacy}</small>

//           <div style={{ marginTop: 20 }}>
//             <button onClick={() => {
//               setShowPostForm(true);
//               setShowEventForm(false);
//             }}>➕ Create Post</button>

//             <button onClick={() => {
//               setShowEventForm(true);
//               setShowPostForm(false);
//             }}>📅 Create Event</button>
//           </div>

//           {showPostForm && (
//             <div style={{ marginTop: 20 }}>
//               <h4>Create a Post</h4>
//               <textarea
//                 value={postContent}
//                 onChange={(e) => setPostContent(e.target.value)}
//                 placeholder="Write your post here..."
//                 rows="4"
//               />
//               <button onClick={() => handlePostSubmit(selectedGroup.id)}>Publish Post</button>
//             </div>
//           )}

//           {showEventForm && (
//             <div style={{ marginTop: 20 }}>
//               <h4>Create an Event</h4>
//               <input
//                 type="text"
//                 value={eventDetails}
//                 onChange={(e) => setEventDetails(e.target.value)}
//                 placeholder="Event Details"
//               />
//               <input
//                 type="datetime-local"
//                 value={eventDate}
//                 onChange={(e) => setEventDate(e.target.value)}
//               />
//               <button onClick={() => handleEventSubmit(selectedGroup.id)}>Create Event</button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GroupForm;

import React, { useState, useEffect } from "react";

const GroupForm = () => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [groupImage, setGroupImage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [postImage, setPostImage] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventImage, setEventImage] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  // const handleImagePreview = (e) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setPostImage(URL.createObjectURL(e.target.files[0]));
  //   }
  // };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:8404/groups", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }

        const data = await response.json();
        setGroups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", groupName);
    formData.append("description", groupDescription);
    formData.append("privacy", privacy);
    if (groupImage) {
      formData.append("groupImage", groupImage);
    }

    try {
      const response = await fetch("http://localhost:8404/new_group", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Failed to create group.");
        return;
      }

      // setGroups((prevGroups) => [...prevGroups, { ...data, posts: [], events: [] }]);

      setGroups((prevGroups) => [
        ...prevGroups,
        { ...data, posts: [], events: [] },
      ]);
      setGroupName("");
      setGroupDescription("");
      setPrivacy("public");
      setGroupImage(null);
    } catch (error) {
      console.error("Error creating group:", error);
      alert(`An error occurred while creating the group: ${error.message}`);
    }
  };

  // const handleGroupClick = async (group) => {
  //   try {
  //     const response = await fetch(`http://localhost:8404/group?group_id=${group.id}`, {
  //       credentials: "include",
  //     });

  //     // console.log("Response status:", response.status);

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch group details");
  //     }

  //     const data = await response.json();
  //     // console.log("data response json:", data);
  //     // console.log("Raw response data from /groups?group_id=...", data);

  //     if (!Array.isArray(data) || data.length === 0) {
  //       console.error("Expected array with group info, got:", data);
  //       alert("Invalid group data received.");
  //       return;
  //     }

  //     const selected = data.find((g) => g.id === group.id);
  //     if (!selected) {
  //       console.error("Group not found in response data:", group.id);
  //       alert("Group not found.");
  //       return;
  //     }
  //     console.log("Selected group full data:", selected);
  //     setSelectedGroup({
  //       ...selected,
  //       posts: [],
  //       events: [],
  //     });

  //     setShowPostForm(false);
  //     setShowEventForm(false);
  //   } catch (error) {
  //     console.error("Error fetching group details:", error);
  //     alert("Unable to load group details.");
  //   }
  // };

  const handleGroupClick = async (group) => {
    try {
      const response = await fetch(
        `http://localhost:8404/group?group_id=${group.id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group details");
      }

      const data = await response.json();

      if (!data || !data.id) {
        console.error("Invalid group data received:", data);
        alert("Invalid group data received.");
        return;
      }

      console.log("Selected group full data:", data);

      setSelectedGroup(data);

      setShowPostForm(false);
      setShowEventForm(false);
    } catch (error) {
      console.error("Error fetching group details:", error);
      alert("Unable to load group details.");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const groupId = selectedGroup?.id;
        if (!groupId) return;
        console.log("Fetching categories for group:", groupId);

        const response = await fetch(
          `http://localhost:8404/new_post_group?group_id=${groupId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch categories");

        const data = await response.json();
        console.log("Categories fetched:", data);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [selectedGroup]);

  const handlePostSubmit = async (groupId) => {
    console.log("selectedGroup.id:", groupId);

    if (!groupId || isNaN(Number(groupId))) {
      alert("Group ID is missing or invalid.");
      return;
    }

    if (!postTitle || !postContent || !postCategory) {
      alert(
        "Please fill in all required fields: title, content, and category."
      );
      return;
    }

    const formData = new FormData();
    formData.append("group_id", groupId);
    formData.append("title", postTitle);
    formData.append("content", postContent);
    formData.append("category", postCategory);

    if (postImage) {
      formData.append("postImage", postImage);
    }

    try {
      const response = await fetch("http://localhost:8404/new_post_group", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create post.");
        return;
      }

      setSelectedGroup((prev) => ({
        ...prev,
        posts: [...prev.posts, data],
      }));

      setPostTitle("");
      setPostContent("");
      setPostCategory("");
      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("An error occurred while creating the post.");
    }
  };

  const handleEventSubmit = async (groupId) => {
    if (
      !eventName ||
      !eventDescription ||
      !eventLocation ||
      !eventStartDate ||
      !eventEndDate
    ) {
      alert("Please fill in all event fields.");
      return;
    }

    console.log("Sending start_date:", eventStartDate);
    console.log("Sending end_date:", eventEndDate);
    const formData = new FormData();
    formData.append("name", eventName);
    formData.append("description", eventDescription);
    formData.append("location", eventLocation);
    formData.append("start_date", eventStartDate);
    formData.append("end_date", eventEndDate);
    formData.append("group_id", groupId);
    if (eventImage) {
      formData.append("groupImage", eventImage);
    }

    try {
      const response = await fetch("http://localhost:8404/new_event", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      console.log("Event creation response:", data);
      if (!response.ok) {
        console.error("Server error response:", data);
        alert(data.error || "Failed to create event.");
        return;
      }

      setSelectedGroup((prev) => ({
        ...prev,
        events: [...prev.events, data],
      }));

      setEventName("");
      setEventDescription("");
      setEventLocation("");
      setEventStartDate("");
      setEventEndDate("");
      setEventImage(null);
      alert("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("An error occurred while creating the event.");
    }
  };

  const handleCategoryChange = (e) => {
    setPostCategory(e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create a Group</h2>
      <form onSubmit={handleCreateGroup}>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group Name"
          required
        />
        <textarea
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          placeholder="Group Description"
          rows="4"
        />
        <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setGroupImage(e.target.files[0])}
        />
        <button type="submit">Create</button>
      </form>

      {!selectedGroup && groups.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Your Groups</h3>
          {groups.map((group, index) => (
            <div
              key={group.id || index}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <img
                src={
                  group.image || "https://placehold.co/100x100?text=No+Image"
                }
                alt="group"
                style={{ width: "100px" }}
              />
              <h4>{group.name}</h4>
              <p>{group.description}</p>
              <small>Privacy: {group.privacy}</small>
              <br />
              <button onClick={() => handleGroupClick(group)}>
                View Group
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedGroup && (
        <div style={{ marginTop: 20 }}>
          <button onClick={() => setSelectedGroup(null)}>
            ← Back to All Groups
          </button>
          <h3>{selectedGroup.name}</h3>
          <img
            src={
              selectedGroup.image ||
              "https://placehold.co/100x100?text=No+Image"
            }
            alt="group"
            style={{ width: "100px" }}
          />
          <p>{selectedGroup.description}</p>
          <small>Privacy: {selectedGroup.privacy}</small>

          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => {
                setShowPostForm(true);
                setShowEventForm(false);
              }}
            >
              ➕ Create Post
            </button>

            <button
              onClick={() => {
                setShowEventForm(true);
                setShowPostForm(false);
              }}
            >
              📅 Create Event
            </button>
          </div>

          {showPostForm && (
            <div style={{ marginTop: 20 }}>
              <h4>Create a Post</h4>

              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Post Title"
              />
              <br />

              <select value={postCategory} onChange={handleCategoryChange}>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories available</option>
                )}
              </select>

              <br />
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your post here..."
                rows="4"
              />
              <br />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPostImage(e.target.files[0])}
              />
              {postImage && (
                <img
                  src={URL.createObjectURL(postImage)}
                  alt="Preview"
                  style={{ width: 100, marginTop: 10 }}
                />
              )}

              <br />
              <button
                disabled={!selectedGroup?.id}
                onClick={() => handlePostSubmit(selectedGroup?.id)}
              >
                Publish Post
              </button>
            </div>
          )}

          {showEventForm && (
            <div style={{ marginTop: 20 }}>
              <h4>Create an Event</h4>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Event Name"
              />
              <br />
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Description"
              />
              <br />
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Location"
              />
              <br />
              <input
                type="date"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
              />
              <br />
              <input
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
              />
              <br />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEventImage(e.target.files[0])}
              />
              {eventImage && (
                <img
                  src={URL.createObjectURL(eventImage)}
                  alt="Preview"
                  style={{ width: 100, marginTop: 10 }}
                />
              )}
              <br />
              <button onClick={() => handleEventSubmit(selectedGroup.id)}>
                Create Event
              </button>
            </div>
          )}

          {selectedGroup.posts && selectedGroup.posts.length > 0 && (
            <div
              style={{
                marginTop: 40,
                padding: "10px",
                background: "#f0f4f8",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{ borderBottom: "2px solid #ccc", paddingBottom: "5px" }}
              >
                📌 Group Posts
              </h3>
              {selectedGroup.posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    padding: 15,
                    marginBottom: 15,
                    borderRadius: "6px",
                  }}
                >
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                  <p>
                    <strong>🏷️ Category:</strong> {post.category}
                  </p>
                  <p>
                    <strong>✍️ By:</strong> {post.author_username || "Unknown"}
                  </p>
                  <p>
                    <strong>🕒 Posted on:</strong>{" "}
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      style={{ width: 150, marginTop: 10, borderRadius: "4px" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedGroup.events && selectedGroup.events.length > 0 && (
            <div
              style={{
                marginTop: 40,
                padding: "10px",
                background: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{ borderBottom: "2px solid #ccc", paddingBottom: "5px" }}
              >
                📅 Upcoming Events
              </h3>
              {selectedGroup.events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    padding: 15,
                    marginBottom: 15,
                    borderRadius: "6px",
                  }}
                >
                  <h4>{event.name}</h4>
                  <p>
                    <strong>Description:</strong> {event.description}
                  </p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>📅 From:</strong>{" "}
                    {new Date(event.start_date).toLocaleDateString()} <br />
                    <strong>📅 To:</strong>{" "}
                    {new Date(event.end_date).toLocaleDateString()}
                  </p>
                  {event.image && (
                    <img
                      src={event.image}
                      alt="Event"
                      style={{ width: 150, marginTop: 10, borderRadius: "4px" }}
                    />
                  )}
                  <p>
                    <strong>🕒 Created at:</strong>{" "}
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupForm;
