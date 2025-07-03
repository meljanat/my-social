import React from "react";
import styles from "../styles/EventCard.module.css";

export default function EventCard({ event, compact = false }) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formatDate = (date) => {
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    return { month, day, year };
  };

  const { month, day, year } = formatDate(startDate);
  const { month: endMonth, day: endDay, year: endYear } = formatDate(endDate);


  const StartRange = `${startDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} ${day}/${month}/${year}`;

  const EndRange = `${endDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} ${endDay}/${endMonth}/${endYear}`;

  const JoinToEvent = async (eventId, groupId) => {
    try {
      const response = await fetch(`http://localhost:8404/join_to_event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          event_id: eventId,
          group_id: groupId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to join the event.");
      }
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const handleNotGoing = () => {
    console.log("User is not going to the event.");
  };

  return (
    <div
      className={`${styles.eventCard} ${
        compact ? styles.eventCardCompact : ""
      }`}
    >
      <div className={styles.eventImageContainer}>
        <img
          src={event.image || "/inconnu/event-placeholder.png"}
          alt={event.name}
          className={styles.eventImage}
        />
        <div className={styles.eventDateBadge}>
          <span className={styles.eventMonth}>{month}</span>
          <span className={styles.eventDay}>{day}</span>
        </div>
      </div>

      <div className={styles.eventCardContent}>
        <h3 className={styles.eventName}>{event.name}</h3>

        <div className={styles.eventMeta}>
          <div className={styles.eventMetaItem}>
            <svg viewBox="0 0 24 24" className={styles.eventIcon} fill="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{event.location}</span>
          </div>

          <div className={styles.eventMetaItem}>
            <svg viewBox="0 0 24 24" className={styles.eventIcon} fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{StartRange}</span>
          </div>

          <div className={styles.eventMetaItem}>
            <svg viewBox="0 0 24 24" className={styles.eventIcon} fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{EndRange}</span>
          </div>

          {!compact && event.group_name && (
            <div className={styles.eventMetaItem}>
              <svg viewBox="0 0 24 24" className={styles.eventIcon} fill="currentColor">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>{event.group_name}</span>
            </div>
          )}

          {!compact && event.creator && (
            <div className={styles.eventMetaItem}>
              <svg viewBox="0 0 24 24" className={styles.eventIcon} fill="currentColor">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Created by {event.creator}</span>
            </div>
          )}
        </div>

        {!compact && event.description && (
          <p className={styles.eventDescription}>{event.description}</p>
        )}
      </div>

      <div className={styles.eventCardFooter}>
        <button
          className={styles.eventActionButton}
          onClick={() => JoinToEvent(event.event_id, event.group_id)}
        >
          <span>Going</span>
        </button>

        {!compact && (
          <button className={styles.eventDetailsButton} onClick={handleNotGoing}>
            <span>Not Going</span>
          </button>
        )}
      </div>
    </div>
  );
}
