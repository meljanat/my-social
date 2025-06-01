import "../styles/RemoveGroupModal.css";
import { handleFollow } from "../functions/user";

export default function RemoveGroupModal({ group, onClose, onRemove, action }) {
  const handleRemoveGroup = async () => {
    handleFollow(group.admin_id, group.group_id)
  };

  return (
    <div className="modal-content">
      <h2>Remove Group</h2>
      <p>{`Are you sure you want to ${action} the group "${group.name}"?`}</p>
      <div className="modal-actions">
        <button onClick={handleRemoveGroup}>
          {action === "remove" ? "Remove" : "Leave"} Group
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
