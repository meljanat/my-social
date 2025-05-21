import "../styles/RemoveGroupModal.css";

export default function RemoveGroupModal({ group, onClose, onRemove }) {
  const group_id = parseInt(group.group_id);
  const handleRemoveGroup = async () => {
    try {
      const response = await fetch(`http://localhost:8404/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ group_id }),
        credentials: "include",
      });
      if (response.ok) {
        onRemove(group.group_id);
        onClose();
      } else {
        console.error("Failed to remove group");
      }
    } catch (error) {
      console.error("Error removing group:", error);
    }
  };

  return (
    // <div className="modal">
    <div className="modal-content">
      <h2>Remove Group</h2>
      <p>Are you sure you want to remove the group "{group.name}"?</p>
      <div className="modal-actions">
        <button onClick={handleRemoveGroup}>Remove Group</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
    // </div>
  );
}
