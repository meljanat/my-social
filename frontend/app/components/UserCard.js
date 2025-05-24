import { useState } from "react";
import { handleFollow } from "../functions/user";

export default function UserCard({ user, action, onClick }) {
  const [newStatus, setNewStatus] = useState("Follow");

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
              setNewStatus(handleFollow(user.user_id, 0));
            }}
          >
            {newStatus}
          </button>
        )}
      </div>
    </li>
  );
}
