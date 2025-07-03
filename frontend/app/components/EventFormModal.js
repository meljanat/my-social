import React, { useState, useEffect } from "react";
import styles from "../styles/EventFormModal.module.css";

export default function EventFormModal({
  onClose,
  user,
  onEventCreated,
  my_groups,
  group,
}) {
  // console.log("dasasddasd");

  const [eventFormInput, setEventFormInput] = useState({
    user_id: user.id,
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    eventImage: null,
    group_id: 0,
  });
  const [imageInputKey, setImageInputKey] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myGroups, setMyGroups] = useState([]);
  useEffect(() => {
    if (group && !my_groups) {
      setEventFormInput((prev) => ({
        ...prev,
        group_id: group.id,
      }));
    }
  }, [group, my_groups]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setEventFormInput({
      ...eventFormInput,
      eventImage: file,
    });
  };

  useEffect(() => {
    setIsLoading(true);
    const getGroups = async () => {
      try {
        const response = await fetch("http://localhost:8404/new_event", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();

          setError(data.error || "Failed to retreive groups");
          isLoading(false);
          return;
        }

        const responseData = await response.json();
        setMyGroups(responseData || []);

      } catch (error) {
        console.error("Error creating event:", error);
      } finally {
        setIsSubmitting(false);
      }
    };
    getGroups()
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("user_id", eventFormInput.user_id);
    formData.append("name", eventFormInput.name);
    formData.append("description", eventFormInput.description);
    formData.append("start_date", eventFormInput.start_date);
    formData.append("end_date", eventFormInput.end_date);
    formData.append("location", eventFormInput.location);
    formData.append("group_id", eventFormInput.group_id);

    if (eventFormInput.eventImage) {
      formData.append("eventImage", eventFormInput.eventImage);
    }

    try {
      const response = await fetch("http://localhost:8404/new_event", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();

        setError(data.error || "Failed to create the event");
        setIsSubmitting(false);
        return;
      }

      const responseData = await response.json();
      console.log(responseData);

      const newEvent = {
        event_id: responseData.id || Date.now(),
        name: eventFormInput.name,
        description: eventFormInput.description,
        start_date: eventFormInput.start_date,
        end_date: eventFormInput.end_date,
        location: eventFormInput.location,
        creator: `${user.first_name} ${user.last_name}`,
        creator_id: user.id,
        created_at: "Just now",
        image: eventFormInput.eventImage
          ? URL.createObjectURL(eventFormInput.eventImage)
          : null,
      };

      if (onEventCreated) {
        onEventCreated(newEvent);
      }

      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Create a new event</h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <form className={styles.postForm} onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label htmlFor="event-name">Event Name</label>
              <input
                id="event-name"
                className={styles.formControl}
                placeholder="Enter event name"
                required
                value={eventFormInput.name}
                onChange={(e) => {
                  setEventFormInput({
                    ...eventFormInput,
                    name: e.target.value,
                  });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="event-description">Description</label>
              <textarea
                id="event-description"
                className={styles.formControl}
                placeholder="Event Description..."
                required
                value={eventFormInput.description}
                onChange={(e) => {
                  setEventFormInput({
                    ...eventFormInput,
                    description: e.target.value,
                  });
                }}
              />
            </div>
            {my_groups && (
              <div className={styles.formGroup}>
                <label htmlFor="event-group">Select Group</label>
                <select
                  id="event-group"
                  className={styles.formControl}
                  value={eventFormInput.group_id}
                  onChange={(e) => {
                    setEventFormInput({
                      ...eventFormInput,
                      group_id: e.target.value,
                    });
                  }}
                >
                  <option value="">Select Group</option>
                  {myGroups.map((group) => (
                    <option key={group.group_id} value={group.group_id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}{" "}
            <div className={styles.formGroup}>
              <label htmlFor="event-start-datetime">Start Date & Time</label>
              <input
                id="event-start-datetime"
                type="datetime-local"
                className={styles.formControl}
                required
                value={eventFormInput.start_date}
                onChange={(e) => {
                  console.log(eventFormInput.start_date);
                  setEventFormInput({
                    ...eventFormInput,
                    start_date: e.target.value,
                  });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="event-end-datetime">End Date & Time</label>
              <input
                id="event-end-datetime"
                type="datetime-local"
                className={styles.formControl}
                value={eventFormInput.end_date}
                onChange={(e) => {
                  setEventFormInput({
                    ...eventFormInput,
                    end_date: e.target.value,
                  });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="event-location">Location</label>
              <input
                id="event-location"
                className={styles.formControl}
                placeholder="Enter event location"
                required
                value={eventFormInput.location}
                onChange={(e) => {
                  setEventFormInput({
                    ...eventFormInput,
                    location: e.target.value,
                  });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Upload Event Image</label>
              {eventFormInput.eventImage ? (
                <div className={styles.imagePreview}>
                  <img
                    src={URL.createObjectURL(eventFormInput.eventImage)}
                    alt="Selected Event Image"
                  />
                  <button
                    className={styles.removeImageButton}
                    onClick={(e) => {
                      e.preventDefault();
                      setEventFormInput({
                        ...eventFormInput,
                        eventImage: null,
                      });
                      setImageInputKey(Date.now());
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className={styles.fileUpload}>
                  <input
                    key={imageInputKey}
                    type="file"
                    id="event-image"
                    className={styles.fileInput}
                    name="eventImage"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label htmlFor="event-image" className={styles.fileLabel}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="16"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        fill="#475569"
                        d="M10 0C6.834.025 3.933 2.153 3.173 5.536 1.232 6.352 0 8.194 0 10.376 0 13.385 2.376 16 5.312 16H6a1 1 0 1 0 0-2h-.688C3.526 14 2 12.321 2 10.375c0-1.493.934-2.734 2.344-3.156a.98.98 0 0 0 .687-.813C5.417 3.7 7.592 2.02 10 2c2.681-.02 5.021 2.287 5 5v1.094c0 .465.296.864.75.968C17.066 9.367 18 10.4 18 11.5c0 1.35-1.316 2.5-3 2.5h-1a1 1 0 0 0 0 2h1c2.734 0 5-1.983 5-4.5 0-1.815-1.215-3.42-3.013-4.115.002-.178.013-.359.013-.385.03-3.836-3.209-7.03-7-7m0 6L6.988 9.013 9 9v6a1 1 0 0 0 2 0V9l2.012.01z"
                      ></path>
                    </svg>
                    Choose Event Image
                  </label>
                  <span className={styles.fileName}>
                    {eventFormInput.eventImage
                      ? eventFormInput.eventImage.name
                      : "No file chosen"}
                  </span>
                </div>
              )}
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
