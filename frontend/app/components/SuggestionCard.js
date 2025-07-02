import { useRouter } from "next/navigation";
import styles from "../styles/SuggestionCard.module.css";

export default function SuggestionCard({ suggestion }) {
  const router = useRouter();

  const handleClick = () => {
    console.log("suggestion", suggestion.user_id);
    if (suggestion.username) {
      router.push(`/profile?id=${suggestion.user_id}`);
    } else if (suggestion.group_id) {
      router.push(`/group?id=${suggestion.group_id}`);
    } else if (suggestion.post_id) {
      router.push(`/post?id=${suggestion.post_id}`);
    } else if (suggestion.event_id) {
      router.push(`/event?id=${suggestion.event_id}`);
    }
  };

  return (
    <div className={styles.suggestionCard} onClick={handleClick}>
      {suggestion.avatar && (
        <div className={styles.sugAvatar}>
          <img
            src={suggestion.avatar || "/inconnu/avatar.png"}
            alt={suggestion.username || "Avatar"}
            className={styles.avatarImage}
          />
        </div>
      )}
      {suggestion.image && (
        <div className={styles.sugAvatar}>
          <img
            src={suggestion.image || "/inconnu/placeholder.png"}
            alt={suggestion.name || "Image"}
            className={styles.avatarImage}
          />
        </div>
      )}
      <div className={styles.suggestionDetails}>
        {suggestion.username && (
          <>
            <span className={styles.sugName}>@</span>
            <span className={styles.sugName}>{suggestion.username}</span>
          </>
        )}
        {suggestion.group_id && (
          <>
            <div className={styles.sugName}>{suggestion.name}</div>
            <div className={styles.sugDetails}>Group</div>
          </>
        )}
        {suggestion.post_id && (
          <>
            <div className={styles.sugName}>{suggestion.title}</div>
            <span className={styles.sugDetails}>
              Post . {suggestion.created_at}
            </span>
          </>
        )}
        {suggestion.event_id && (
          <>
            <span className={styles.sugName}>{suggestion.name}</span>
            <span className={styles.sugDetails}>
              Event . {suggestion.start_date}
            </span>
          </>
        )}
      </div>
    </div>
  );
}