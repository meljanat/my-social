import "../../styles/GroupsPage.css";

export default function EventCard({ event }) {
  // function handleEventSelect(event) {
  //   console.log("Interested: ", event);
  // }
  return (
    <div className="event-card">
      <div className="event-date">
        <span className="event-day">
        </span>
        <span className="event-month">
          {/* <img src={event.image}></img> */}
          {/* {new Date(event.day).toLocaleString("default", {
            month: "short",
          })} */}
          {/* {event.month} */}
        </span>
      </div>
      <div className="event-details">
        <h3>{event.title}</h3>
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
          {/* {event.time} */}
        </p>
        <button
          className="event-action-btn"
          // onClick={handleEventSelect(event)}
        >
          Interested
        </button>
      </div>
    </div>
  );
}
