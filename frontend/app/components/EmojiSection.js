import styles from "../styles/EmojiSection.module.css";


export default function EmojiSection({ onEmojiSelect }) {
  const emojis = [
        "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊",
        "😋", "😎", "😍", "😘", "🥰", "😗", "🤗", "🤩", "🤔", "🤨",
        "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "🤭",
        "😯", "😪", "😫", "😴", "😌", "😛", "😜", "🤪", "🤨", "🧐",
        "🤓", "😕", "😟", "🙁", "😮‍💨", "😲", "😳", "🥺", "😦", "😧",];

  return (
    <div className={styles.emojiSection}>
      {emojis.map((emoji, index) => (
        <button
          key={index}
          className={styles.emojiButton}
          onClick={() => onEmojiSelect(emoji)}
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}