export default function EmojiSection({ onEmojiSelect }) {
    const emojis = [
        "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊",
        "😋", "😎", "😍", "😘", "🥰", "😗", "🤗", "🤩", "🤔", "🤨",
        "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "🤭",
        "😯", "😪", "😫", "😴", "😌", "😛", "😜", "🤪", "🤨", "🧐",
        "🤓", "😕", "😟", "🙁", "😮‍💨", "😲", "😳", "🥺", "😦", "😧",];

    return (
        <div className="emoji-section">
            {emojis.map((emoji, index) => (
                <span
                    key={index}
                    className="emoji"
                    onClick={() => onEmojiSelect(emoji)}
                >
                    {emoji}
                </span>
            ))}
        </div>
    );
}
