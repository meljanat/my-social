package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	structs "social-network/data"
	"social-network/database"
)

func CreateEventHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "group_events") {
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	var event structs.Event
	event.Name = r.FormValue("name")
	event.Description = r.FormValue("description")
	event.Location = r.FormValue("location")
	event.GroupID, err = strconv.ParseInt(r.FormValue("group_id"), 10, 64)
	if err != nil {
		fmt.Println("Error parsing group ID:", err)
		response := map[string]string{"error": "Invalid group ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	event.StartDate, err = time.Parse("2006-01-02T15:04", r.FormValue("start_date"))
	if err != nil {
		fmt.Println("Error parsing start date:", err)
		response := map[string]string{"error": "Invalid start date"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	event.EndDate, err = time.Parse("2006-01-02T15:04", r.FormValue("end_date"))
	if err != nil {
		fmt.Println("Error parsing end date:", err)
		response := map[string]string{"error": "Invalid end date"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	group, err := database.GetGroupById(event.GroupID)
	if err != nil {
		fmt.Println("Error retrieving group:", err)
		response := map[string]string{"error": "Failed to retrieve group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if member, err := database.IsMemberGroup(user.ID, event.GroupID); err != nil || !member {
		fmt.Println("User is not a member of the group", err)
		response := map[string]string{"error": "User is not a member of the group"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	errors, valid := ValidateEvent(event.Name, event.Description, event.Location, event.StartDate, event.EndDate)
	if !valid {
		fmt.Println("Validation error", errors)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":  "Validation error",
			"fields": errors,
		})
		return
	}

	var imagePath string
	image, header, err := r.FormFile("eventImage")
	if err != nil && err.Error() != "http: no such file" {
		fmt.Println("Error retrieving image:", err)
		response := map[string]string{"error": "Failed to retrieve image"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if image != nil {
		imagePath, err = SaveImage(image, header, "../frontend/public/events/")
		if err != nil {
			fmt.Println("Error saving image:", err)
			response := map[string]string{"error": err.Error()}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		newpath := strings.Split(imagePath, "/public")
		imagePath = newpath[1]
	} else {
		imagePath = "/inconnu/event.jpg"
	}

	id, err := database.CreateEvent(user.ID, event.Name, event.Description, event.Location, event.StartDate, event.EndDate, event.GroupID, imagePath)
	if err != nil {
		fmt.Println("Error creating event:", err)
		response := map[string]string{"error": "Failed to create event"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return

	}

	members, err := database.GetGroupMembers(user.ID, event.GroupID, group.TotalMembers)
	if err != nil {
		fmt.Println("Error retrieving group members:", err)
		response := map[string]string{"error": "Failed to retrieve group members"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	for _, member := range members {
		if member.ID != user.ID {
			if err = database.CreateNotification(user.ID, member.ID, 0, event.GroupID, id, "event"); err != nil {
				fmt.Println("Error creating notification:", err)
				response := map[string]string{"error": "Failed to create notification"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
		}
	}

	newEvent := structs.Event{
		ID:          id,
		Name:        event.Name,
		Description: event.Description,
		Location:    event.Location,
		StartDate:   event.StartDate,
		EndDate:     event.EndDate,
		GroupID:     event.GroupID,
		GroupName:   group.Name,
		Image:       imagePath,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newEvent)
}

func GetEventHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	group_id, err := strconv.ParseInt(r.URL.Query().Get("group_id"), 10, 64)
	if err != nil {
		fmt.Println("Error parsing group ID:", err)
		response := map[string]string{"error": "Invalid group ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	event_id, err := strconv.ParseInt(r.URL.Query().Get("event_id"), 10, 64)
	if err != nil {
		fmt.Println("Error parsing event ID:", err)
		response := map[string]string{"error": "Invalid event ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	_, err = database.GetGroupById(group_id)
	if err != nil {
		fmt.Println("Error retrieving group:", err)
		response := map[string]string{"error": "Failed to retrieve group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	member, err := database.IsMemberGroup(user.ID, group_id)
	if err != nil || !member {
		fmt.Println("User is not a member of the group", err)
		response := map[string]string{"error": "User is not a member of the group"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	event, err := database.GetEvent(event_id)
	if err != nil {
		fmt.Println("Error retrieving event:", err)
		response := map[string]string{"error": "Failed to retrieve event"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
	event.ID = event_id
	event.GroupID = group_id

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

func GetEventsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	Type := r.URL.Query().Get("type")
	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Error parsing offset:", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var events []structs.Event

	if Type != "my-events" && Type != "discover" {
		fmt.Println("Invalid type events")
		response := map[string]string{"error": "Invalid type events"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
	}

	events, err = database.GetEvents(user.ID, offset, Type)
	if err != nil {
		fmt.Println("Error retrieving events:", err)
		response := map[string]string{"error": "Failed to retrieve events"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func JoinToEventHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	type Event struct {
		GroupID int64 `json:"group_id"`
		EventID int64 `json:"event_id"`
	}
	var event Event
	err = json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		fmt.Println("Error decoding request body:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	_, err = database.GetGroupById(event.GroupID)
	if err != nil {
		fmt.Println("Error retrieving group:", err)
		response := map[string]string{"error": "Failed to retrieve group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	member, err := database.IsMemberGroup(user.ID, event.GroupID)
	if err != nil || !member {
		fmt.Println("User is not a member of the group", err)
		response := map[string]string{"error": "User is not a member of the group"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	_, err = database.GetEvent(event.EventID)
	if err != nil {
		fmt.Println("Error retrieving event:", err)
		response := map[string]string{"error": "Failed to retrieve event"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	member, err = database.IsMemberEvent(user.ID, event.EventID)
	if err != nil {
		fmt.Println("Error checking user", err)
		response := map[string]string{"error": "Error checking user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	if member {
		if err = database.LeaveEvent(user.ID, event.EventID); err != nil {
			fmt.Println("Error leaving event:", err)
			response := map[string]string{"error": "Failed to leave event"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		response := map[string]string{"message": "Left event successfully"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	} else {
		if err = database.JoinToEvent(user.ID, event.EventID); err != nil {
			fmt.Println("Error joining to event:", err)
			response := map[string]string{"error": "Failed to join to event"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		response := map[string]string{"message": "Joined to event successfully"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

func ValidateEvent(name, description, location string, startDate, endDate time.Time) (map[string]string, bool) {
	errors := make(map[string]string)
	const maxNameLength = 30
	const maxDescriptionLength = 500
	const maxLocationLength = 100

	if name == "" {
		errors["name"] = "Name is required"
	} else if len(name) > maxNameLength {
		errors["name"] = "Name must be at most " + strconv.Itoa(maxNameLength) + " characters"
	}

	if description == "" {
		errors["description"] = "Description is required"
	} else if len(description) > maxDescriptionLength {
		errors["description"] = "Description must be at most " + strconv.Itoa(maxDescriptionLength) + " characters"
	}

	if location == "" {
		errors["location"] = "Location is required"
	} else if len(location) > maxLocationLength {
		errors["location"] = "Location must be at most " + strconv.Itoa(maxLocationLength) + " characters"
	}

	if startDate.IsZero() {
		errors["start_date"] = "Start date is required"
	}

	if endDate.IsZero() {
		errors["end_date"] = "End date is required"
	}

	if endDate.Before(startDate) {
		errors["end_date"] = "End date must be after start date"
	}

	if startDate.Before(time.Now()) {
		errors["start_date"] = "Start date must be in the future"
	}

	if len(errors) > 0 {
		return errors, false
	}

	return nil, true
}
