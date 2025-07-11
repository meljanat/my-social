import { useRouter } from "next/navigation";
import styles from "../styles/SuggestionCard.module.css";

export default function SuggestionCard({ suggestion, onclick }) {
  const router = useRouter();

  const handleClick = () => {
    if (suggestion.username) {
      router.push(`/profile?id=${suggestion.user_id}`);
    } else if (suggestion.group_id) {
      router.push(`/group?id=${suggestion.group_id}`);
    } else if (suggestion.post_id) {
      router.push(`/post?id=${suggestion.post_id}`);
    } else if (suggestion.event_id) {
      router.push(`/event?id=${suggestion.event_id}`);
    }
    onclick();
  };

  console.log("SuggestionCard", suggestion);


  return (
    <div className={styles.suggestionCard} onClick={handleClick}>
      {suggestion.avatar ? (
        <div className={styles.sugAvatar}>
          <img
            src={suggestion.avatar || "/inconnu/avatar.png"}
            alt={suggestion.username || "Avatar"}
            className={styles.avatarImage}
          />
        </div>
      ) : null}
      {suggestion.image && !suggestion.post_id ? (
        <div className={styles.sugAvatar}>
          <img
            src={suggestion.image || "/inconnu/placeholder.png"}
            alt={suggestion.name || "Image"}
            className={styles.avatarImage}
          />
        </div>
      ) : null}
      <div className={styles.suggestionDetails}>
        {suggestion.username ? (
          <>
            <span className={styles.sugName}>@{suggestion.username}</span>
          </>
        ) : null}
        {suggestion.group_id ? (
          <>
            <div className={styles.sugName}>Group: {suggestion.name}</div>
          </>
        ) : null}
        {suggestion.post_id ? (
          <>
            <div className={styles.sugName}>Post: {suggestion.title}</div>
          </>
        ) : null}
        {suggestion.event_id ? (
          <>
            <span className={styles.sugName}>Event: {suggestion.name}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}