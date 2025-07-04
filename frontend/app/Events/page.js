"use client";
import React, { useState, useEffect, useRef } from "react";
import AuthForm from "../components/AuthForm";
import { useRouter } from "next/navigation";
import EventFormModal from "../components/EventFormModal";
import styles from "../styles/EventsPage.module.css";
import useInfiniteScroll from "../components/useInfiniteScroll";
import CardOfEvent from "../components/CardOfEvent";

export default function EventsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("my-events");
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter();

  const eventsGridRef = useRef(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:8404/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data);
        }
      } catch (error) {
        console.log("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [isLoggedIn]);

  const fetchEvents = async (type, currentOffset = 0) => {
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8404/events?type=${type}&offset=${currentOffset}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch events.");
      }

      const data = await response.json();
      console.log("Fetched events:", data);
      // console.log("Type:", type);

      if (currentOffset === 0) {
        setEvents(data);
      } else {
        setEvents((prev) => [...prev, ...data]);
      }

      if (data?.length === 0 || data?.length < 10) {
        setHasMoreEvents(false);
      } else {
        setHasMoreEvents(true);
      }
      return data;
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
      setHasMoreEvents(false);
      return [];
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchEvents("my-events", 0);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      setEvents([]);
      setHasMoreEvents(true);
      fetchEvents(activeTab, 0);
    }
  }, [activeTab]);

  useInfiniteScroll({
    fetchMoreCallback: async () => {
      if (!isFetchingMore && hasMoreEvents) {
        setIsFetchingMore(true);
        await fetchEvents(activeTab, events?.length);
      }
    },
    containerRef: eventsGridRef,
    isFetching: isFetchingMore,
    hasMore: hasMoreEvents,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEventCreated = (newEvent) => {
    setEvents((prevEvents) => [newEvent, ...prevEvents]);
  };

  const handleInterestedClick = async (eventId, groupId, type) => {
    // setIsDisabled(true);

    try {
      const response = await fetch("http://localhost:8404/join_to_event", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: groupId,
          event_id: eventId,
          type: type,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to join/leave event.");
      console.log(eventId, type);
      
      setEvents(events.filter((event) => event.event_id !== eventId));
      // setEvents((prev) =>
      //   prev.map((e) =>
      //     e.event_id === eventId ? { ...e, is_attending: !e.is_attending } : e
      //   )
      // );
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading events...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>!</div>
        <h2 className={styles.errorTitle}>Error loading events</h2>
        <p className={styles.errorMessage}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.eventsPageContainer}>
      <div className={styles.eventsPageContent}>
        <div className={styles.eventsHeader}>
          <h1>Events</h1>
          <button
            className={styles.createEventBtn}
            onClick={() => setShowEventForm(true)}
          >
            + Create Event
          </button>
        </div>

        <div className={styles.eventsTabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "my-events" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabChange("my-events")}
          >
            My Events
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "discover" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabChange("discover")}
          >
            Discover
          </button>
        </div>

        <div className={styles.eventsGrid} ref={eventsGridRef}>
          {events?.length > 0 ? (
            events.map((event) => (
              <CardOfEvent
                key={event.event_id}
                event={event}
                handleInterestedClick={handleInterestedClick}
                going={event.is_attending}
              />
              // <div key={event.event_id} className={styles.eventCardContainer}>
              //   <div className={styles.eventCardWrapper}>
              //     <div className={styles.eventCardContent}>
              //       <h3 className={styles.eventTitle}>{event.title}</h3>

              //       <p className={styles.eventInfo}>
              //         <svg
              //           width="16"
              //           height="16"
              //           viewBox="0 0 24 24"
              //           fill="none"
              //           xmlns="http://www.w3.org/2000/svg"
              //         >
              //           <path
              //             d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
              //             stroke="currentColor"
              //             strokeWidth="2"
              //             strokeLinecap="round"
              //             strokeLinejoin="round"
              //           />
              //           <circle
              //             cx="9"
              //             cy="7"
              //             r="4"
              //             stroke="currentColor"
              //             strokeWidth="2"
              //             strokeLinecap="round"
              //             strokeLinejoin="round"
              //           />
              //         </svg>
              //         <span className={styles.eventInfoText}>
              //           {event.username}
              //         </span>
              //       </p>

              //       <p className={styles.eventInfo}>
              //         <svg
              //           width="16"
              //           height="16"
              //           viewBox="0 0 24 24"
              //           fill="none"
              //           xmlns="http://www.w3.org/2000/svg"
              //         >
              //           <path
              //             d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
              //             stroke="currentColor"
              //             strokeWidth="2"
              //             strokeLinecap="round"
              //             strokeLinejoin="round"
              //           />
              //           <circle
              //             cx="12"
              //             cy="10"
              //             r="3"
              //             stroke="currentColor"
              //             strokeWidth="2"
              //             strokeLinecap="round"
              //             strokeLinejoin="round"
              //           />
              //         </svg>
              //         <span className={styles.eventInfoText}>
              //           {event.location}
              //         </span>
              //       </p>

              //       <p className={styles.eventInfo}>
              //         <svg
              //           width="16"
              //           height="16"
              //           viewBox="0 0 24 24"
              //           fill="none"
              //           xmlns="http://www.w3.org/2000/svg"
              //         >
              //           <circle
              //             cx="12"
              //             cy="12"
              //             r="10"
              //             stroke="currentColor"
              //             strokeWidth="2"
              //             strokeLinecap="round"
              //             strokeLinejoin="round"
              //           />
              //           <path
              //             d="M12 6v6l4 2"
              //             stroke="currentColor"
              //             strokeWidth="2"
              //             strokeLinecap="round"
              //             strokeLinejoin="round"
              //           />
              //         </svg>
              //         <span className={styles.eventInfoText}>
              //           {new Date(event.start_date).toLocaleTimeString([], {
              //             hour: "2-digit",
              //             minute: "2-digit",
              //           })}{" "}
              //           -
              //           {new Date(event.end_date).toLocaleTimeString([], {
              //             hour: "2-digit",
              //             minute: "2-digit",
              //           })}
              //         </span>
              //       </p>

              //       <p className={styles.eventDescription}>
              //         {event.description}
              //       </p>

              //       <div className={styles.eventActions}>
              //         {event.is_attending ? (
              //           <button
              //             className={`${styles.eventActionButton} ${styles.attending}`}
              //           >
              //             <svg
              //               width="16"
              //               height="16"
              //               viewBox="0 0 24 24"
              //               fill="none"
              //               xmlns="http://www.w3.org/2000/svg"
              //             >
              //               <path
              //                 d="M20 6L9 17l-5-5"
              //                 stroke="currentColor"
              //                 strokeWidth="2"
              //                 strokeLinecap="round"
              //                 strokeLinejoin="round"
              //               />
              //             </svg>
              //             Going
              //           </button>
              //         ) : (
              //           <>
              //             <button
              //               className={styles.eventActionButton}
              //               // disabled={isDisabled}
              //               onClick={() =>
              //                 handleInterestedClick(
              //                   event.event_id,
              //                   event.group_id,
              //                   "going"
              //                 )
              //               }
              //             >
              //               Going
              //             </button>
              //             <button
              //               className={styles.eventDetailsBtn}
              //               // disabled={isDisabled}
              //               // onClick={() =>
              //               //   router.push(
              //               //     `/event?id=${event.group_id}&event=${event.event_id}`
              //               //   )
              //               // }
              //               onClick={() =>
              //                 handleInterestedClick(
              //                   event.event_id,
              //                   event.group_id,
              //                   "not_going"
              //                 )
              //               }
              //             >
              //               Not Going
              //             </button>
              //           </>
              //         )}
              //       </div>
              //     </div>
              //   </div>
              // </div>
            ))
          ) : (
            <div className={styles.noEventsMessage}>
              {activeTab === "my-events" ? (
                <>
                  <div className={styles.emptyStateIcon}>📅</div>
                  <h3>You're not attending any events yet</h3>
                  <p>Discover upcoming events or create your own!</p>
                  <button
                    className={styles.discoverEventsBtn}
                    onClick={() => handleTabChange("discover")}
                  >
                    Discover Events
                  </button>
                </>
              ) : activeTab === "discover" ? (
                <>
                  <div className={styles.emptyStateIcon}>🔍</div>
                  <h3>No events to discover right now</h3>
                  <p>Check back later or create your own event!</p>
                </>
              ) : (
                <>
                  <div className={styles.emptyStateIcon}>📅</div>
                  <h3>No events found</h3>
                  <p>Try adjusting your search or create a new event</p>
                </>
              )}
            </div>
          )}
          {isFetchingMore && hasMoreEvents && (
            <div className={styles.loadingMoreMessage}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading more events...</p>
            </div>
          )}
          {!hasMoreEvents && events.length > 0 && (
            <div className={styles.endOfEventsMessage}>
              <p>You've reached the end of the events list.</p>
            </div>
          )}
        </div>
      </div>

      {showEventForm && (
        <EventFormModal
          onClose={() => setShowEventForm(false)}
          onEventCreated={handleEventCreated}
          // my_groups={my_groups}
        />
      )}
    </div>
  );
}
