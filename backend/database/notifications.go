package database

import (
	structs "social-network/data"
)

func CreateNotification(user_id, notified_id, post_id, group_id, event_id int64, type_notification string) error {
	_, err := DB.Exec("INSERT INTO notifications (user_id, notified_id, post_id, group_id, event_id, type_notification) VALUES (?, ?, ?, ?, ?, ?)", user_id, notified_id, post_id, group_id, event_id, type_notification)
	return err
}

func GetNotifications(notified_id, offset int64) ([]structs.Notification, error) {
	var notifications []structs.Notification
	rows, err := DB.Query("SELECT n.id, u.username, u.avatar, n.post_id, n.group_id, n.event_id, n.type_notification, n.read, n.created_at FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.notified_id = ? ORDER BY n.created_at DESC LIMIT ? OFFSET ?", notified_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var notification structs.Notification
		err = rows.Scan(&notification.ID, &notification.User.Username, &notification.User.Avatar, &notification.PostID, &notification.GroupID, &notification.EventID, &notification.TypeNotification, &notification.Read, &notification.CreatedAt)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}
	return notifications, nil
}

func DeleteNotification(user_id, notified_id, post_id, group_id, event_id int64, type_notification string) error {
	_, err := DB.Exec("DELETE FROM notifications WHERE user_id = ? AND notified_id = ? AND post_id = ? AND group_id = ? AND event_id = ? AND type_notification = ?", user_id, notified_id, post_id, group_id, event_id, type_notification)
	return err
}

func MarkNotificationAsRead(user_id, notfication_id int64) error {
	_, err := DB.Exec("UPDATE notifications SET read = 1 WHERE user_id = ? AND id = ?", user_id, notfication_id)
	return err
}

func MarkAllNotificationsAsRead(user_id int64) error {
	_, err := DB.Exec("UPDATE notifications SET read = 1 WHERE user_id = ?", user_id)
	return err
}
