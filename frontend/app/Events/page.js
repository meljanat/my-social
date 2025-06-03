"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/NavBar";
import EventCard from "../components/EventCard";
import EventFormModal from "../components/EventFormModal";
import "../styles/EventsPage.css";
import useInfiniteScroll from "../components/useInfiniteScroll";

export default function EventsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my-events");
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  let offset = 0;

  const fetchEvents = async (type) => {
    try {
      const response = await fetch(
        `http://localhost:8404/events?type=${type}&offset=${offset}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        if (offset === 0) {
          setEvents(data);
        } else {
          setEvents((prev) => [...prev, ...data]);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents("my-events");
  }, []);



  useInfiniteScroll({
    fetchMoreCallback: async () => {
      if (!selectedType || !hasMoreEvents) return;

      setIsFetchingMore(true);
      const currentEvents = events || [];
      const newEvents = await fetchEvents(selectedType, currentEvents.length);

      if (!newEvents || newEvents.length === 0) {
        console.log("No more events to fetch");
        setHasMoreEvents(false);
      }

      setIsFetchingMore(false);
    },
    offset: events?.length || 0,
    isFetching: isFetchingMore,
    hasMore: hasMoreEvents,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "my-events") {
      fetchEvents("my-events");
      // setFilteredEvents(events.filter((event) => event.is_attending));
    } else if (tab === "discover") {
      fetchEvents("discover");

      // setFilteredEvents(events.filter((event) => !event.is_attending));
    }
    // else {
    //   setFilteredEvents(events);
    // }
  };

  // const handleSearch = (e) => {
  //   const query = e.target.value.toLowerCase();
  //   setSearchQuery(query);

  //   let filtered;
  //   if (activeTab === "my-events") {
  //     filtered = events.filter(
  //       (event) =>
  //         event.is_attending &&
  //         (event.title.toLowerCase().includes(query) ||
  //           event.location.toLowerCase().includes(query) ||
  //           event.description.toLowerCase().includes(query))
  //     );
  //   } else if (activeTab === "discover") {
  //     filtered = events.filter(
  //       (event) =>
  //         !event.is_attending &&
  //         (event.title.toLowerCase().includes(query) ||
  //           event.location.toLowerCase().includes(query) ||
  //           event.description.toLowerCase().includes(query))
  //     );
  //   } else {
  //     filtered = events.filter(
  //       (event) =>
  //         event.title.toLowerCase().includes(query) ||
  //         event.location.toLowerCase().includes(query) ||
  //         event.description.toLowerCase().includes(query)
  //     );
  //   }

  //   setFilteredEvents(filtered);
  // };

  const handleEventCreated = (newEvent) => {
    setEvents((prevEvents) => [newEvent, ...prevEvents]);
    setFilteredEvents((prevFiltered) => [newEvent, ...prevFiltered]);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  const handleInterestedClick = async (eventId, groupId) => {
    console.log(groupId, eventId);
    
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
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");

      setEvents((prev) =>
        prev.map((e) =>
          e.event_id === eventId ? { ...e, is_attending: !e.is_attending } : e
        )
      );
    } catch (err) {
      console.error("Error joining/leaving event:", err.message);
    }
  };
  console.log(events);
  

  return (
    <div className="events-page-container">
      <div className="events-page-content">
        <div className="events-header">
          <h1>Events</h1>
          <button
            className="create-event-btn"
            onClick={() => setShowEventForm(true)}
          >
            + Create Event
          </button>
        </div>

        <div className="events-tabs">
          <button
            className={`tab-button ${activeTab === "my-events" ? "active-tab" : ""
              }`}
            onClick={() => handleTabChange("my-events")}
          >
            My Events
          </button>
          <button
            className={`tab-button ${activeTab === "discover" ? "active-tab" : ""
              }`}
            onClick={() => handleTabChange("discover")}
          >
            Discover
          </button>
          {/* <button
            className={`tab-button ${activeTab === "all" ? "active-tab" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            All Events
          </button> */}
        </div>

        <div className="events-grid">
          {events?.length > 0 ? (
            events.map((event) => (
              <div key={event.event_id} className="event-card-container">
                <div className="event-card-wrapper">
                  {/* <div className="event-date-badge">
            <span className="event-month">
              {new Date(event.start_date).toLocaleString("default", {
                month: "short",
              })}
            </span>
            <span className="event-day">
              {new Date(event.start_date).getDate()}
            </span>
            <span className="event-year">
              {new Date(event.start_date).getFullYear()}
            </span>
          </div> */}

                  <div className="event-card-content">
                    <h3 className="event-title">{event.title}</h3>

                    <p className="event-organizer">
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
                      {event.organizer}
                    </p>

                    <p className="event-location">
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
                      {event.location}
                    </p>

                    <p className="event-time">
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
                      {new Date(event.start_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -
                      {new Date(event.end_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <p className="event-description">{event.description}</p>

                    <div className="event-actions">
                      {event.is_attending ? (
                        <button className="event-action-btn attending">
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
                          Attending
                        </button>
                      ) : (
                        <button
                          className={`event-action-btn ${event.is_attending ? "attending" : ""}`}
                          onClick={() => handleInterestedClick(event.event_id, event.group.group_id)}
                        >
                          {event.is_attending ? "Attending" : "Interested"}
                        </button>


                      )}

                      <button
                        className="event-details-btn"
                        onClick={() => router.push(`/event/${event.event_id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events-message">
              {activeTab === "my-events" ? (
                <>
                  <div className="empty-state-icon">📅</div>
                  <h3>You're not attending any events yet</h3>
                  <p>Discover upcoming events or create your own!</p>
                  <button
                    className="discover-events-btn"
                    onClick={() => handleTabChange("discover")}
                  >
                    Discover Events
                  </button>
                </>
              ) : activeTab === "discover" ? (
                <>
                  <div className="empty-state-icon">🔍</div>
                  <h3>No events to discover right now</h3>
                  <p>Check back later or create your own event!</p>
                </>
              ) : (
                <>
                  <div className="empty-state-icon">📅</div>
                  <h3>No events found</h3>
                  <p>Try adjusting your search or create a new event</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showEventForm && (
        <EventFormModal
          onClose={() => setShowEventForm(false)}
          onEventCreated={handleEventCreated}
          my_groups={[]}
        />
      )}
    </div>
  );
}
