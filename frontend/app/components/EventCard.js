// EventCard.js - Enhanced Visual Design
import React from "react";
import "../styles/EventCard.css";

export default function EventCard({ event, compact = false }) {
  // Format dates
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  // Format date for display
  const formatDate = (date) => {
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    return { month, day, year };
  };

  const { month, day, year } = formatDate(startDate);
  const {endMonth,endDay, endYear } = formatDate(endDate);
  // Format time range
  const StartRange = `Start Date: ${startDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} ${day}/${month}/${year}`
  const EndRange = `End Date: ${endDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}${endDay}/${endMonth}/${endYear}`;

  const JoinToEvent = () => {
    try {
      console.log("Joining event:", event.event_id, event.group.group_id);
      
      fetch(`http://localhost:8404/join_to_event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"},
          credentials: "include",
          body: JSON.stringify({
            event_id: event.event_id,
            group_id: parseInt(event.group_id),
          })
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

  // Generate gradient colors based on event name
  const generateGradient = (name) => {
    const colors = [
      ["#FF9966", "#FF5E62"], // Warm orange to red
      ["#56CCF2", "#2F80ED"], // Light blue to blue
      ["#A770EF", "#CF8BF3"], // Purple to light purple
      ["#11998e", "#38ef7d"], // Teal to green
      ["#FC466B", "#3F5EFB"], // Pink to purple
      ["#FDBB2D", "#22C1C3"], // Yellow to teal
    ];

    // Use the sum of char codes to select a gradient
    const charSum = name
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorIndex = charSum % colors.length;

    return `linear-gradient(135deg, ${colors[colorIndex][0]}, ${colors[colorIndex][1]})`;
  };

  return (
    <div className={`event-card ${compact ? "event-card-compact" : ""}`}>
      {event.image ? (
        <div className="event-image-container">
          <img src={event.image} alt={event.name} className="event-image" />
          <div className="event-date-badge">
            <span className="event-month">{month}</span>
            <span className="event-day">{day}</span>
          </div>
        </div>
      ) : (
        <div
          className="event-gradient-header"
          style={{ background: generateGradient(event.name) }}
        >
          <div className="event-date-badge">
            <span className="event-month">{month}</span>
            <span className="event-day">{day}</span>
          </div>
          <div className="event-gradient-title">
            {event.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      )}

      <div className="event-card-content">
        <h3 className="event-name">{event.name}</h3>

        <div className="event-meta">
          <div className="event-meta-item">
            <svg viewBox="0 0 24 24" className="event-icon">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{event.location}</span>
          </div>

          <div className="event-meta-item">
            <svg viewBox="0 0 24 24" className="event-icon">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{StartRange}</span>
            <span>{EndRange}</span>
          </div>

          {!compact && event.group_name && (
            <div className="event-meta-item">
              <svg viewBox="0 0 24 24" className="event-icon">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              <span>{event.group_name}</span>
            </div>
          )}

          {!compact && event.creator && (
            <div className="event-meta-item">
              <svg viewBox="0 0 24 24" className="event-icon">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Created by {event.creator}</span>
            </div>
          )}
        </div>

        {!compact && event.description && (
          <p className="event-description">{event.description}</p>
        )}
      </div>

      <div className="event-card-footer">
        <button className="event-action-button"
        onClick={JoinToEvent}>
          <svg viewBox="0 0 24 24" className="event-button-icon">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>Interested</span>
        </button>

        {!compact && (
          <button className="event-details-button">
            <svg viewBox="0 0 24 24" className="event-button-icon">
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
