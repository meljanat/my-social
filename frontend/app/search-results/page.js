import { useEffect, useState } from "react";

export default function SearchResults({ searchParams }) {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [events, setEvents] = useState([]);
    const [posts, setPosts] = useState([]);

    const fetchSuggestions = async (searchParams, type, offset = 0) => {
        try {
            const response = await fetch(`http://localhost:8404/search?query=${searchParams}&offset=${offset}&type=${type}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch suggestions");
            }

            const data = await response.json();
            console.log(data);
            setUsers([...(users || []), ...(users || [])]);
            setGroups([...(groups || []), ...(groups || [])]);
            setEvents([...(events || []), ...(events || [])]);
            setPosts([...(posts || []), ...(posts || [])]);

            if (data.error) {
                throw new Error("Failed to fetch suggestions", data.error);
            }

        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    }

    return (
        <div>
            <h1>Users:</h1>
            {isLoading ? (
                <p>Loading...</p>
            ) : results.users.length > 0 ? (
                <ul>
                    {results.map((result) => (
                        <li key={result.id}>{result.title}</li>
                    ))}
                </ul>
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}