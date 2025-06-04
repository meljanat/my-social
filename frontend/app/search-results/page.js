"use client";
import "../styles/SearchPage.css";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import UserCard from "../components/UserCard";
import GroupCard from "../components/GroupCard";
import EventCard from "../components/EventCard";
import PostCard from "../components/PostCard";

export default function SearchResults() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('query') || '';
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [events, setEvents] = useState([]);
    const [posts, setPosts] = useState([]);
    const router = useRouter();

    const fetchSuggestions = async (searchParams, type = "all", offset = 0) => {
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
            setUsers((prev) => [...(prev || []), ...(data?.users || [])]);
            setGroups((prev) => [...(prev || []), ...(data?.groups || [])]);
            setEvents((prev) => [...(prev || []), ...(data?.events || [])]);
            setPosts((prev) => [...(prev || []), ...(data?.posts || [])]);
            setIsLoading(false);

            if (data.error) {
                throw new Error("Failed to fetch suggestions", data.error);
            }

        } catch (error) {
            console.log("Error fetching suggestions:", error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setUsers([]);
        setGroups([]);
        setEvents([]);
        setPosts([]);
        if (searchQuery) {
            setIsLoading(true);
            fetchSuggestions(searchQuery);
        }
    }, [searchQuery]);

    const handleShowMore = async (searchParams, type, offset) => {
        try {
            setIsLoading(true);
            await fetchSuggestions(searchParams, type, offset);
        } catch (error) {
            console.error("Error showing more results:", error);
        }
    }

    if (!searchQuery) {
        return <p>Try to search for something.</p>;
    }

    return (
        <div className="search-results">
            <h1>Search Results for: {searchQuery}</h1>
            <div className="sections">
                <h1>Users:</h1>
                {isLoading ? (
                    <p>Loading...</p>
                ) : users.length > 0 ? (
                    <div className="result-sections">
                        {users.map((user, index) => (
                            <UserCard
                                key={index}
                                user={user}
                                onClick={() => router.push(`/profile?id=${user.user_id}`)}
                            />
                        ))}
                        <button className="show-more-buttons" onClick={() => {
                            handleShowMore(searchQuery, "users", users.length);
                        }}>Show more</button>
                    </div>
                ) : (
                    <p>No results found</p>
                )}
            </div>
            <div className="sections">
                <h1>Groups:</h1>
                {isLoading ? (
                    <p>Loading...</p>
                ) : groups.length > 0 ? (
                    <div className="result-sections">
                        {groups.map((group, index) => (
                            <GroupCard
                                key={index}
                                group={group}
                                onClick={() => console.log(`Clicked on group: ${group.name}`)}
                            />
                        ))}
                        <button className="show-more-buttons" onClick={() => {
                            handleShowMore(searchQuery, "groups", groups.length);
                        }}>Show more</button>
                    </div>
                ) : (
                    <p>No results found</p>
                )}
            </div>
            <div className="sections">
                <h1>Events:</h1>
                {isLoading ? (
                    <p>Loading...</p>
                ) : events.length > 0 ? (
                    <div className="result-sections">
                        {events.map((event, index) => (
                            <EventCard
                                key={index}
                                event={event}
                                onClick={() => console.log(`Clicked on event: ${event.name}`)}
                            />
                        ))}
                        <button className="show-more-buttons" onClick={() => {
                            handleShowMore(searchQuery, "events", events.length);
                        }}>Show more</button>
                    </div>
                ) : (
                    <p>No results found</p>
                )}
            </div>
            <div className="sections">
                <h1>Posts:</h1>
                {isLoading ? (
                    <p>Loading...</p>
                ) : posts.length > 0 ? (
                    <div className="result-sections">
                        {posts.map((post, index) => (
                            <PostCard
                                key={index}
                                post={post}
                                onClick={() => console.log(`Clicked on post: ${post.title}`)}
                            />
                        ))}
                        <button className="show-more-buttons" onClick={() => {
                            handleShowMore(searchQuery, "posts", posts.length);
                        }}>Show more</button>
                    </div>
                ) : (
                    <p>No results found</p>
                )}
            </div>
        </div>
    );
}
