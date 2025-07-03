import React from "react";
import styles from "../styles/EventsPage.module.css";
import { useRouter } from "next/navigation";


const CardOfEvent = ({ event, handleInterestedClick }) => {
  const router = useRouter();

  console.log("EventCard event:", event);

  return (
    <div key={event.event_id} className={styles.eventCardContainer}>
      <div className={styles.eventCardWrapper}>
        <div className={styles.eventCardContent}>
          <h3 className={styles.eventTitle}>{event.title}</h3>

          <p className={styles.eventInfo}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.eventInfoText}>{event.organizer}</span>
          </p>

          <p className={styles.eventInfo}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="10"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.eventInfoText}>{event.location}</span>
          </p>

          <p className={styles.eventInfo}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6v6l4 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.eventInfoText}>
              {new Date(event.start_date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -
              {new Date(event.end_date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>

          <p className={styles.eventDescription}>{event.description}</p>
          <span
            className={`${styles.eventActionButton} ${
              event.type === "going" ? styles.attending : styles.notAttending
            }`}
            style={{
              fontSize: "12px",
              color: event.type === "going" ? "rgb(103, 211, 103)" : "#ef4444",
            }}
          >
            {event.type.toUpperCase().replace("_", " ")}
          </span>
          {/* <p>Created At: {event.created_at}</p> */}

          <div className={styles.eventActions}>
            {event.type === "" ? (
              <>
                <button
                  onClick={() =>
                    handleInterestedClick(
                      event.event_id,
                      event.group_id,
                      "going"
                    )
                  }
                  className={`${styles.eventActionButton} ${styles.attending}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Going
                </button>
                <button
                  className={`${styles.eventActionButton} ${styles.attending}`}
                  onClick={() =>
                    handleInterestedClick(
                      event.event_id,
                      event.group_id,
                      "not_going"
                    )
                  }
                >
                  {/* <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg> */}
                  Not Going
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.eventDetailsBtn}
                  onClick={() =>
                    router.push(
                      `/event?id=${event.group_id}&event=${event.event_id}`
                    )
                  }
                >
                  View details
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardOfEvent;
