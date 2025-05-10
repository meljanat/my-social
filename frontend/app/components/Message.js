import "../styles/Message.css";

export default function Message({ message, isSent }) {
  return (
    <div className={`message ${isSent ? "sent" : "received"}`}>
      {!isSent && (
        <div className="message-user-header">
          {/* <img
            className="message-user-avatar"
            src={message.avatar || "./inconnus/avatar.png"}
            alt={message.username}
          /> */}
          {/* <span className="message-username">{message.username}</span> */}
        </div>
      )}
      <div className="message-content">{message.content}</div>
      <div className="message-footer">
        <span className="message-time">{message.created_at}</span>
        {/* {isSent && (
          <span className="message-status">
            <img src="./icons/message.svg"></img>
          </span>
        )} */}
      </div>
    </div>
  );
}
