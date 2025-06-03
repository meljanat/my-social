import { useRouter } from 'next/navigation';

export default function SuggestionCard({ suggestion }) {
    const router = useRouter();
    
    const handleClick = () => {
        console.log("suggestion", suggestion.user_id);
        if (suggestion.username) {
            router.push(`/profile?id=${suggestion.user_id}`);
        } else if (suggestion.group_id) {
            router.push(`/group/${suggestion.group_id}`);
        } else if (suggestion.post_id) {
            router.push(`/post?id=${suggestion.post_id}`);
        } else if (suggestion.event_id) {
            router.push(`/event/${suggestion.event_id}`);
        }
    };

    return (
        <div className="suggestion-card" onClick={handleClick}>
            {suggestion.avatar && (
                <div className="sug-avatar">
                    <img
                        src={suggestion.avatar}
                        alt={suggestion.username || 'Avatar'}
                        className="avatar-image"
                    />
                </div>
            )}
            {suggestion.image && (
                <div className="sug-avatar">
                    <img
                        src={suggestion.image}
                        alt={suggestion.name || 'Image'}
                        className="avatar-image"
                    />
                </div>
            )}
            <div className="suggestion-details">
                {suggestion.username && (
                    <>
                        <span className="sug-name">@</span>
                        <span className="sug-name">{suggestion.username}</span>
                    </>
                )}
                {suggestion.group_id && (
                    <>
                        <div className="sug-name">{suggestion.name}</div>
                        <div className="sug-details">Group</div>
                    </>
                )}
                {suggestion.post_id && (
                    <>
                        <div className="sug-name">{suggestion.title}</div>
                        <span className="sug-details">Post . {suggestion.created_at}</span>
                    </>
                )}
                {suggestion.event_id && (
                    <>
                        <span className="sug-name">{suggestion.name}</span>
                        <span className="sug-details">Event . {suggestion.start_date}</span>
                    </>
                )}
            </div>
        </div>
    );
}
