package database

import (
	structs "social-network/data"
	"strings"
	"time"
)

func CreateEvent(user_id int64, name, description, location string, start, end time.Time, group_id int64, image string) (int64, error) {
	result, err := DB.Exec("INSERT INTO group_events (created_by, group_id, name, description, start_date, end_date, location, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", user_id, group_id, name, description, start, end, location, image)
	if err != nil {
		return 0, err
	}

	members, err := GetGroupMembers(group_id)
	if err != nil {
		return 0, err
	}

	for _, member := range members {
		if err = CreateNotification(user_id, 0, member.ID, "event_created"); err != nil {
			return 0, err
		}
	}

	id, err := result.LastInsertId()
	return id, err
}

func GetEvents(user_id int64) ([]structs.Event, error) {
	rows, err := DB.Query("SELECT e.id, u.username, g.name, g.id, e.name, e.description, e.start_date, e.end_date, e.location, e.created_at, e.image FROM group_events e JOIN users u ON e.created_by = u.id JOIN groups g ON e.group_id = g.id JOIN event_members em ON e.id = em.event_id WHERE em.user_id = ? ORDER BY e.start_date DESC LIMIT 5", user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var events []structs.Event
	for rows.Next() {
		var event structs.Event
		var date time.Time
		err = rows.Scan(&event.ID, &event.Creator, &event.GroupName, &event.GroupID, &event.Name, &event.Description, &event.StartDate, &event.EndDate, &event.Location, &date, &event.Image)
		if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
			return nil, err
		}
		event.CreatedAt = TimeAgo(date)
		events = append(events, event)
	}
	return events, nil
}

func GetEvent(id int64) (structs.Event, error) {
	var event structs.Event
	var date time.Time
	err := DB.QueryRow("SELECT u.username, g.name, e.name, e.description, e.start_date, e.end_date, e.location, e.created_at, e.image FROM group_events e JOIN users u ON u.id = e.created_by JOIN groups g ON g.id = e.group_id WHERE e.id = ?", id).Scan(&event.Creator, &event.Group, &event.Name, &event.Description, &event.StartDate, &event.EndDate, &event.Location, &date, &event.Image)
	if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
		return structs.Event{}, err
	}
	event.CreatedAt = TimeAgo(date)
	return event, err
}

func GetEventGroup(group_id int64) ([]structs.Event, error) {
	rows, err := DB.Query("SELECT e.id, u.username, e.name, e.description, e.start_date, e.end_date, e.location, e.created_at, e.image FROM group_events e JOIN users u ON u.id = e.created_by WHERE  e.group_id = ?", group_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var events []structs.Event
	for rows.Next() {
		var event structs.Event
		var date time.Time
		err = rows.Scan(&event.ID, &event.Creator, &event.Name, &event.Description, &event.StartDate, &event.EndDate, &event.Location, &date, &event.Image)
		if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
			return nil, err
		}
		event.CreatedAt = TimeAgo(date)
		events = append(events, event)
	}
	return events, nil
}

func GetCountUserEvents(id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM event_members WHERE user_id = ?", id).Scan(&count)
	return count, err
}
