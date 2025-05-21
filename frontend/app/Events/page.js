"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/NavBar";
import EventCard from "../components/EventCard";
import EventFormModal from "../components/EventFormModal";
import "../styles/EventsPage.css";

export default function EventsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my-events");
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [homeData, setHomeData] = useState(null);
  // const [filteredEvents, setFilteredEvents] = useState([]);


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
          setIsLoggedIn(data === true);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const fetchEvents = async (type) => {
    try {
      const response = await fetch(
        `http://localhost:8404/events?type=${type}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        setEvents(data);
        // setFilteredEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  useEffect(() => {
    if (isLoggedIn) {
      fetchEvents("my-events");
      fetchHomeData();
    }
  }, [isLoggedIn]);

  //useEffect(() => {
  //if (isLoggedIn) {
  //fetchHomeData();

  //setEvents(sampleEvents);
  //setFilteredEvents(sampleEvents);
  // }
  //}, [isLoggedIn]);

  const fetchHomeData = async () => {
    try {
      const response = await fetch("http://localhost:8404/home", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setHomeData(data);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    }
  };

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

  return (
    <div className="events-page-container">
      {homeData && <Navbar user={homeData.user} />}

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
            className={`tab-button ${
              activeTab === "my-events" ? "active-tab" : ""
            }`}
            onClick={() => handleTabChange("my-events")}
          >
            My Events
          </button>
          <button
            className={`tab-button ${
              activeTab === "discover" ? "active-tab" : ""
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
              <div key={event.id} className="event-card-container">
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
                        <button className="event-action-btn">Interested</button>
                      )}

                      <button className="event-details-btn">
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
