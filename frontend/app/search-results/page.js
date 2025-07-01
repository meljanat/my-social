"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import UserCard from "../components/UserCard";
import GroupCard from "../components/GroupCard";
import EventCard from "../components/EventCard";
import PostCard from "../components/PostCard";
import styles from "../styles/SearchResults.module.css";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchSuggestions = async (query, type = "all", offset = 0) => {
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8404/search?query=${query}&offset=${offset}&type=${type}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch suggestions.");
      }

      const data = await response.json();

      if (type === "all" || type === "users") {
        setUsers((prev) => [
          ...(offset === 0 ? [] : prev),
          ...(data?.users || []),
        ]);
      }
      if (type === "all" || type === "groups") {
        setGroups((prev) => [
          ...(offset === 0 ? [] : prev),
          ...(data?.groups || []),
        ]);
      }
      if (type === "all" || type === "events") {
        setEvents((prev) => [
          ...(offset === 0 ? [] : prev),
          ...(data?.events || []),
        ]);
      }
      if (type === "all" || type === "posts") {
        setPosts((prev) => [
          ...(offset === 0 ? [] : prev),
          ...(data?.posts || []),
        ]);
      }

      if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      setError(error.message || "Network error while fetching search results.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setUsers([]);
    setGroups([]);
    setEvents([]);
    setPosts([]);
    setError(null);

    if (searchQuery) {
      setIsLoading(true);
      fetchSuggestions(searchQuery);
    } else {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const handleShowMore = async (query, type, currentOffset) => {
    setIsLoading(true);
    await fetchSuggestions(query, type, currentOffset);
  };

  if (!searchQuery) {
    return (
      <div className={styles.searchPageContainer}>
        <div className={styles.noQueryMessage}>
          <div className={styles.emptyStateIcon}>🔍</div>
          <h3>Start searching!</h3>
          <p>Enter a query to find users, groups, events, or posts.</p>
        </div>
      </div>
    );
  }

  if (
    isLoading &&
    users.length === 0 &&
    groups.length === 0 &&
    events.length === 0 &&
    posts.length === 0
  ) {
    return (
      <div className={styles.searchPageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Searching...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.searchPageContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>!</div>
          <h2 className={styles.errorTitle}>Error searching</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasAnyResults =
    users.length > 0 ||
    groups.length > 0 ||
    events.length > 0 ||
    posts.length > 0;

  return (
    <div className={styles.searchPageContainer}>
      <h1 className={styles.searchResultsTitle}>
        Search Results for: "{searchQuery}"
      </h1>

      {!hasAnyResults && !isLoading ? (
        <div className={styles.noResultsFound}>
          <div className={styles.emptyStateIcon}>😔</div>
          <h3>No results found for "{searchQuery}"</h3>
          <p>Try a different search query.</p>
        </div>
      ) : (
        <>
          <div className={styles.sections}>
            <h2 className={styles.sectionTitle}>Users</h2>
            {users.length > 0 ? (
              <div className={styles.resultCardsGrid}>
                {users.map((user, index) => (
                  <UserCard
                    key={user.user_id || index}
                    user={user}
                    onClick={() => router.push(`/profile?id=${user.user_id}`)}
                  />
                ))}
                <button
                  className={styles.showMoreButton}
                  onClick={() => {
                    handleShowMore(searchQuery, "users", users.length);
                  }}
                >
                  Show more users
                </button>
              </div>
            ) : (
              <p className={styles.noResultsMessage}>No user results found.</p>
            )}
          </div>

          <div className={styles.sections}>
            <h2 className={styles.sectionTitle}>Groups</h2>
            {groups.length > 0 ? (
              <div className={styles.resultCardsGrid}>
                {groups.map((group, index) => (
                  <GroupCard
                    key={group.group_id || index}
                    group={group}
                    onClick={() => router.push(`/group?id=${group.group_id}`)}
                  />
                ))}
                <button
                  className={styles.showMoreButton}
                  onClick={() => {
                    handleShowMore(searchQuery, "groups", groups.length);
                  }}
                >
                  Show more groups
                </button>
              </div>
            ) : (
              <p className={styles.noResultsMessage}>No group results found.</p>
            )}
          </div>

          <div className={styles.sections}>
            <h2 className={styles.sectionTitle}>Events</h2>
            {events.length > 0 ? (
              <div className={styles.resultCardsGrid}>
                {events.map((event, index) => (
                  <EventCard
                    key={event.event_id || index}
                    event={event}
                    onClick={() =>
                      router.push(
                        `/event?id=${event.group_id}&event=${event.event_id}`
                      )
                    }
                  />
                ))}
                <button
                  className={styles.showMoreButton}
                  onClick={() => {
                    handleShowMore(searchQuery, "events", events.length);
                  }}
                >
                  Show more events
                </button>
              </div>
            ) : (
              <p className={styles.noResultsMessage}>No event results found.</p>
            )}
          </div>

          <div className={styles.sections}>
            <h2 className={styles.sectionTitle}>Posts</h2>
            {posts.length > 0 ? (
              <div className={styles.resultCardsGrid}>
                {posts.map((post, index) => (
                  <PostCard
                    key={post.post_id || index}
                    post={post}
                    onClick={() => router.push(`/post?id=${post.post_id}`)}
                  />
                ))}
                <button
                  className={styles.showMoreButton}
                  onClick={() => {
                    handleShowMore(searchQuery, "posts", posts.length);
                  }}
                >
                  Show more posts
                </button>
              </div>
            ) : (
              <p className={styles.noResultsMessage}>No post results found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
