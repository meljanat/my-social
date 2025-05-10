import React, { useState, useEffect } from "react";
import "../styles/FormModal.css";

export default function EventFormModal({
  onClose,
  //   user,
  onEventCreated,
  my_groups,
  group,
}) {
  const [eventFormInput, setEventFormInput] = useState({
    // user_id: user.id,
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
        console.log(data);
        throw new Error(data.error || "Failed to create the event");
      }

      const responseData = await response.json();

      //   const newEvent = {
      //     id: responseData.id || Date.now(),
      //     name: eventFormInput.name,
      //     description: eventFormInput.description,
      //     start_date: eventFormInput.start_date,
      //     end_date: eventFormInput.end_date,
      //     location: eventFormInput.location,
      //     creator: `${user.first_name} ${user.last_name}`,
      //     creator_id: user.id,
      //     created_at: "Just now",
      //     image: eventFormInput.eventImage
      //       ? URL.createObjectURL(eventFormInput.eventImage)
      //       : null,
      //   };

      //   if (onEventCreated) {
      //     onEventCreated(newEvent);
      //   }

      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create a new event</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="post-form" onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="event-name">Event Name</label>
              <input
                id="event-name"
                className="form-control"
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
            <div className="form-group">
              <label htmlFor="event-description">Description</label>
              <textarea
                id="event-description"
                className="form-control"
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
              <div className="form-group">
                <label htmlFor="event-group">Select Group</label>
                <select
                  id="event-group"
                  className="form-control"
                  value={eventFormInput.group_id}
                  onChange={(e) => {
                    setEventFormInput({
                      ...eventFormInput,
                      group_id: e.target.value,
                    });
                  }}
                >
                  <option value="0">No Group</option>
                  {my_groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}{" "}
            <div className="form-group">
              <label htmlFor="event-start-datetime">Start Date & Time</label>
              <input
                id="event-start-datetime"
                type="datetime-local"
                className="form-control"
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
            <div className="form-group">
              <label htmlFor="event-end-datetime">End Date & Time</label>
              <input
                id="event-end-datetime"
                type="datetime-local"
                className="form-control"
                value={eventFormInput.end_date}
                onChange={(e) => {
                  setEventFormInput({
                    ...eventFormInput,
                    end_date: e.target.value,
                  });
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="event-location">Location</label>
              <input
                id="event-location"
                className="form-control"
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
            <div className="form-group">
              <label>Upload Event Image</label>
              {eventFormInput.eventImage ? (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(eventFormInput.eventImage)}
                    alt="Selected Event Image"
                  />
                  <button
                    className="remove-image-button"
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
                <div className="file-upload">
                  <input
                    key={imageInputKey}
                    type="file"
                    id="event-image"
                    className="file-input"
                    name="eventImage"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label htmlFor="event-image" className="file-label">
                    <img src="/icons/upload.svg" alt="" />
                    Choose Event Image
                  </label>
                  <span className="file-name">
                    {eventFormInput.eventImage
                      ? eventFormInput.eventImage.name
                      : "No file chosen"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
