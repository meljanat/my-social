import React from "react";
import styles from "../styles/EventCard.module.css";
import { joinGroup } from "../functions/group";

export default function EventCard({ event }) {
  console.log("EventCard event:", event);

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

  const JoinToEvent = async (eventId, groupId, eventType) => {
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
          type: eventType,
        }),
      });
      const data = await response.json();
      console.log("Join to event response:", data);

      if (!response.ok) {
        throw new Error("Failed to join the event.");
      }
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  return (
    <div className={styles.eventCard}>
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
            <span>{event.location}</span>
          </div>

          <div className={styles.eventMetaItem}>
            <span>{StartRange}</span>
          </div>

          <div className={styles.eventMetaItem}>
            <span>{EndRange}</span>
          </div>

          {event.group_name && (
            <div className={styles.eventMetaItem}>
              <span>{event.group_name}</span>
            </div>
          )}

          {event.creator && (
            <div className={styles.eventMetaItem}>
              <span>Created by {event.creator}</span>
            </div>
          )}
        </div>

        {event.description && (
          <>
            <p className={styles.eventDescription}>{event.description}</p>
            <p
              style={
                event.type === "GOING"
                  ? { color: "rgb(103, 211, 103)" }
                  : { color: "#ef4444" }
              }
              className={styles.isAttending}
            >
              {event.type}
            </p>
          </>
        )}
      </div>

      <div className={styles.eventCardFooter}>
        <button
          className={styles.eventActionButton}
          disabled={event.type === "GOING"}
          onClick={() => JoinToEvent(event.event_id, event.group_id, "going")}
        >
          <span>Going</span>
        </button>

        <button
          className={styles.eventDetailsButton}
          disabled={event.type === "NOT GOING"}
          onClick={() =>
            JoinToEvent(event.event_id, event.group_id, "not_going")
          }
        >
          <span>Not Going</span>
        </button>
      </div>
    </div>
  );
}
