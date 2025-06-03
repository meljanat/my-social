package database

import (
	"database/sql"
	"strings"
	"time"

	structs "social-network/data"
)

func CreateEvent(user_id int64, name, description, location string, start, end time.Time, group_id int64, image string) (int64, error) {
	result, err := DB.Exec("INSERT INTO group_events (created_by, group_id, name, description, start_date, end_date, location, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", user_id, group_id, name, description, start, end, location, image)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	return id, err
}

func GetEvents(user_id, offset int64, Type string) ([]structs.Event, error) {
	var rows *sql.Rows
	var err error
	if Type == "my-events" {
		rows, err = DB.Query("SELECT DISTINCT e.id, e.created_by, g.name, g.id, e.name, e.description, e.start_date, e.end_date, e.location, e.created_at, e.image FROM group_events e JOIN event_members em ON e.id = em.event_id JOIN groups g ON e.group_id = g.id WHERE em.user_id = ? AND e.end_date > CURRENT_TIMESTAMP ORDER BY e.start_date DESC LIMIT ? OFFSET ?", user_id, 10, offset)
	} else {
		rows, err = DB.Query("SELECT DISTINCT e.id, e.created_by, g.name, g.id, e.name, e.description, e.start_date, e.end_date, e.location, e.created_at, e.image FROM group_events e JOIN groups g ON e.group_id = g.id JOIN group_members gm ON gm.group_id = g.id WHERE NOT EXISTS (SELECT 1 FROM event_members em WHERE em.event_id = e.id AND em.user_id = ?) AND gm.user_id = ? AND e.end_date > CURRENT_TIMESTAMP ORDER BY e.start_date DESC LIMIT ? OFFSET ?", user_id, user_id, 10, offset)
	}
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
		member, err := IsMemberGroup(user_id, event.GroupID)
		if err != nil {
			return nil, err
		}
		if member {
			events = append(events, event)
		}
	}
	return events, nil
}

func GetEvent(id int64) (structs.Event, error) {
	var event structs.Event
	var date time.Time
	err := DB.QueryRow("SELECT u.username, g.name, e.name, e.description, e.start_date, e.end_date, e.location, e.created_at, e.image FROM group_events e JOIN users u ON u.id = e.created_by JOIN groups g ON g.id = e.group_id WHERE e.id = ?", id).Scan(&event.Creator, &event.GroupName, &event.Name, &event.Description, &event.StartDate, &event.EndDate, &event.Location, &date, &event.Image)
	if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
		return structs.Event{}, err
	}
	event.CreatedAt = TimeAgo(date)
	return event, err
}

func GetEventGroup(group_id, offset int64) ([]structs.Event, error) {
	rows, err := DB.Query("SELECT e.id, u.username, e.name, e.description, e.start_date, e.end_date, e.location, e.created_at, e.image FROM group_events e JOIN users u ON u.id = e.created_by WHERE  e.group_id = ? ORDER BY e.created_at DESC LIMIT ? OFFSET ?", group_id, 10, offset)
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
		event.GroupID = group_id
		event.CreatedAt = TimeAgo(date)
		events = append(events, event)
	}
	return events, nil
}

func IsMemberEvent(user_id, event_id int64) (bool, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM event_members WHERE user_id = ? AND event_id = ?", user_id, event_id).Scan(&count)
	return count > 0, err
}

func GetCountUserEvents(id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM event_members WHERE user_id = ?", id).Scan(&count)
	return count, err
}

func JoinToEvent(user_id, event_id int64) error {
	_, err := DB.Exec("INSERT INTO event_members (user_id, event_id) VALUES (?, ?)", user_id, event_id)
	return err
}

func LeaveEvent(user_id, event_id int64) error {
	_, err := DB.Exec("DELETE FROM event_members WHERE user_id = ? AND event_id = ?", user_id, event_id)
	return err
}

func DeleteEvent(event_id int64) error {
	_, err := DB.Exec("DELETE FROM group_events WHERE id = ?", event_id)
	return err
}
