"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventCard from "../components/EventCard";
import styles from "../styles/EventPage.module.css";

export default function EventPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const eventId = searchParams.get("event");
  const groupId = searchParams.get("id");

  useEffect(() => {
    async function fetchEvent(group_id, event_id) {
      setIsLoading(true);
      setEvent(null);
      try {
        const response = await fetch(
          `http://localhost:8404/event?event_id=${event_id}&group_id=${group_id}`,
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
          throw new Error(errorData.error || "Failed to retrieve event data");
        }

        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event:", error);
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (groupId && eventId) {
      fetchEvent(groupId, eventId);
    } else {
      setIsLoading(false);
      setEvent(null);
    }
  }, [groupId, eventId]);

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading Event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.notFoundContainer}>
        <p className={styles.notFoundText}>Event not found</p>
        <button onClick={handleGoBack} className={styles.goBackButton}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.eventPageContainer}>
      <div className={styles.eventContentWrapper}>
        <button onClick={handleGoBack} className={styles.goBackButton}>
          Go Back
        </button>
        <EventCard key={event.event_id} event={event} />
      </div>
    </div>
  );
}
