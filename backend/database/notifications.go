package database

import (
	"fmt"
	"sync"
	"time"

	structs "social-network/data"
)

var (
	Clients = structs.Clients
	Mutex   sync.Mutex
)

func SendWsMessage(user_id int64, message map[string]interface{}) {
	if clients, ok := Clients[user_id]; ok {
		for _, client := range clients {
			err := client.WriteJSON(message)
			if err != nil {
				fmt.Println("Error sending message:", err)
				return
			}
		}
	}
}

func CreateNotification(user_id, notified_id, post_id, group_id, event_id int64, type_notification string) error {
	_, err := DB.Exec("INSERT INTO notifications (user_id, notified_id, post_id, group_id, event_id, type_notification) VALUES (?, ?, ?, ?, ?, ?)", user_id, notified_id, post_id, group_id, event_id, type_notification)
	Mutex.Lock()
	SendWsMessage(notified_id, map[string]interface{}{"type": "notifications"})
	Mutex.Unlock()
	return err
}

func GetNotifications(notified_id, offset int64) ([]structs.Notification, error) {
	var notifications []structs.Notification
	rows, err := DB.Query("SELECT n.id, u.id, u.username, u.avatar, n.post_id, n.group_id, n.event_id, n.type_notification, n.read, n.created_at FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.notified_id = ? ORDER BY n.created_at DESC LIMIT ? OFFSET ?", notified_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var notification structs.Notification
		var date time.Time
		err = rows.Scan(&notification.ID, &notification.UserID, &notification.Username, &notification.Avatar, &notification.PostID, &notification.GroupID, &notification.EventID, &notification.TypeNotification, &notification.Read, &date)
		if err != nil {
			return nil, err
		}
		notification.CreatedAt = TimeAgo(date)
		notification.NotificationMessage = SetNotificationMessage(notification.TypeNotification)
		notifications = append(notifications, notification)
	}
	return notifications, nil
}

func SetNotificationMessage(type_notification string) string {
	switch type_notification {
	case "like":
		return "liked your post"
	case "comment":
		return "commented on your post"
	case "save":
		return "saved your post"
	case "follow":
		return "started following you"
	case "follow_request":
		return "sent you a follow request"
	case "group":
		return "invited you to join a group"
	case "group_request":
		return "requested to join your group"
	case "event":
		return "invited you to an event"
	default:
		return "sent you a notification"
	}
}

func GetCountNotifications(user_id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE notified_id = ? AND read = 0", user_id).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func DeleteNotification(user_id, notified_id, post_id, group_id, event_id int64, type_notification string) error {
	_, err := DB.Exec("DELETE FROM notifications WHERE user_id = ? AND notified_id = ? AND post_id = ? AND group_id = ? AND event_id = ? AND type_notification = ?", user_id, notified_id, post_id, group_id, event_id, type_notification)
	return err
}

func MarkNotificationAsRead(user_id, notfication_id int64) error {
	_, err := DB.Exec("UPDATE notifications SET read = 1 WHERE notified_id = ? AND id = ?", user_id, notfication_id)
	return err
}

func MarkAllNotificationsAsRead(user_id int64) error {
	_, err := DB.Exec("UPDATE notifications SET read = 1 WHERE notified_id = ?", user_id)
	return err
}
