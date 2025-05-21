import { useState } from "react";

export default function UserCard({ user, action, onClick }) {
  const [isFollowing, setIsFollowing] = useState();
  const [newStatus, setNewStatus] = useState("Follow");

  async function handleFollow(user_id) {
    // console.log(`Following user with ID: ${userId}`);
    try {
      const response = await fetch(`http://localhost:8404/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user_id),
        credentials: "include",
      });

      if (response.ok) {
        console.log("Followed successfully");
        response.json().then((data) => {
          if (data === "unfollow") {
            setNewStatus("Following");
          } else if (data === "cancel") {
            setNewStatus("Cancel");
          }
        });
      }
      const data = await response.json();
      console.log("Followed user:", data);
    } catch (error) {
      console.error("Error following user:", error);
    }
  }

  return (
    <li
      className="user-item"
    // onClick={}
    >
      <img
        src={user.avatar || user.image}
        className="user-avatar"
        alt={user.username || user.name}
      />
      <div className="user-details">
        <div className="user-info">
          {/* <a key={user.id} href={`/profile/${user.id}`} className="user-link"> */}
          <h4 className="user-name">
            {user.first_name
              ? `${user.first_name} ${user.last_name}`
              : user.name}
          </h4>
          {/* </a> */}
          {/* <h4 className="user-name">{`${user.first_name} ${user.last_name}`}</h4> */}
          <p className="user-username">
            {user.username
              ? `@${user.username}`
              : `(${user.total_members}) Members`}
          </p>
        </div>

        {action === "follow" && (
          <button
            className="follow-btn"
            onClick={() => {
              setIsFollowing(!isFollowing);
              handleFollow(user.user_id);
            }}
          >
            {newStatus}
          </button>
        )}
      </div>
    </li>
  );
}
