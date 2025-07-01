import React from "react";
import styles from "../styles/EventCard.module.css";

export default function EventCard({ event, compact = false }) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formatDate = (date, endDate) => {
    const month = date.toLocaleString("default", { month: "short" });
    const endMonth = endDate.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const endDay = endDate.getDate();
    const year = date.getFullYear();
    const endYear = endDate.getFullYear();
    return { month, day, year, endMonth, endDay, endYear };
  };

  const { month, day, year, endMonth, endDay, endYear } = formatDate(
    startDate,
    endDate
  );
  console.log("Formatted dates", month, day, year, endMonth, endDay, endYear);

  const StartRange = `Start Date: ${startDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} ${day}/${month}/${year}`;

  const EndRange = `End Date: ${endDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} ${endDay}/${endMonth}/${endYear}`;

  const JoinToEvent = (eventId, groupId) => {
    try {
      console.log("Joining event:", eventId, groupId);

      fetch(`http://localhost:8404/join_to_event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          event_id: eventId,
          group_id: groupId,
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log("Event joined successfully");
          } else {
            console.log("Failed to join the event.");
          }
        })
        .catch((error) => {
          console.error("Error joining event:", error);
        });
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const generateGradient = (name) => {
    const colors = [
      ["#FF9966", "#FF5E62"],
      ["#56CCF2", "#2F80ED"],
      ["#A770EF", "#CF8BF3"],
      ["#11998e", "#38ef7d"],
      ["#FC466B", "#3F5EFB"],
      ["#FDBB2D", "#22C1C3"],
    ];

    const charSum = name
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorIndex = charSum % colors.length;

    return `linear-gradient(135deg, ${colors[colorIndex][0]}, ${colors[colorIndex][1]})`;
  };

  return (
    <div
      className={`${styles.eventCard} ${
        compact ? styles.eventCardCompact : ""
      }`}
    >
      {event.image ? (
        <div className={styles.eventImageContainer}>
          <img
            src={event.image}
            alt={event.name}
            className={styles.eventImage}
          />
          <div className={styles.eventDateBadge}>
            <span className={styles.eventMonth}>{month}</span>
            <span className={styles.eventDay}>{day}</span>
          </div>
        </div>
      ) : (
        <div
          className={styles.eventGradientHeader}
          style={{ background: generateGradient(event.name) }}
        >
          <div className={styles.eventDateBadge}>
            <span className={styles.eventMonth}>{month}</span>
            <span className={styles.eventDay}>{day}</span>
          </div>
          <div className={styles.eventGradientTitle}>
            {event.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      )}

      <div className={styles.eventCardContent}>
        <h3 className={styles.eventName}>{event.name}</h3>

        <div className={styles.eventMeta}>
          <div className={styles.eventMetaItem}>
            <svg viewBox="0 0 24 24" className={styles.eventIcon}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{event.location}</span>
          </div>

          <div className={styles.eventMetaItem}>
            <svg viewBox="0 0 24 24" className={styles.eventIcon}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{StartRange}</span>
          </div>

          <div className={styles.eventMetaItem}>
            <svg viewBox="0 0 24 24" className={styles.eventIcon}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{EndRange}</span>
          </div>

          {!compact && event.group_name && (
            <div className={styles.eventMetaItem}>
              <svg viewBox="0 0 24 24" className={styles.eventIcon}>
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
              <svg viewBox="0 0 24 24" className={styles.eventIcon}>
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
          <svg viewBox="0 0 24 24" className={styles.eventButtonIcon}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>Interested</span>
        </button>

        {!compact && (
          <button className={styles.eventDetailsButton}>
            <svg viewBox="0 0 24 24" className={styles.eventButtonIcon}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span>Details</span>
          </button>
        )}
      </div>
    </div>
  );
}