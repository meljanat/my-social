import styles from "../styles/Message.module.css";

export default function Message({ message, isSent }) {
  return (
    <div
      className={`${styles.message} ${isSent ? styles.sent : styles.received}`}
    >
      {!isSent && (
        <div className={styles.messageUserHeader}>
          {/* <img
            className={styles.messageUserAvatar}
            src={message.avatar || "./inconnus/avatar.png"}
            alt={message.username}
          /> */}
          {/* <span className={styles.messageUsername}>{message.username}</span> */}
        </div>
      )}
      <div className={styles.messageContent}>{message.content}</div>
      <div className={styles.messageFooter}>
        <span className={styles.messageTime}>{message.created_at}</span>
        {/* {isSent && (
          <span className={styles.messageStatus}>
            <img src="./icons/message.svg"></img>
          </span>
        )} */}
      </div>
    </div>
  );
}
