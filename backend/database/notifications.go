package database

import (
	structs "social-network/data"
)

func CreateNotification(user_id, post_id, notified_id int64, type_notification string) error {
	if post_id != 0 {
		_, err := DB.Exec("INSERT INTO notifications (user_id, notified_id, type_notification, post_id) VALUES (?, ?, ?, ?)", user_id, notified_id, type_notification, post_id)
		return err
	}
	_, err := DB.Exec("INSERT INTO notifications (user_id, notified_id, type_notification) VALUES (?, ?, ?)", user_id, notified_id, type_notification)
	return err
}

func GetNotifications(notified_id int64) ([]structs.Notification, error) {
	var notifications []structs.Notification
	rows, err := DB.Query("SELECT n.id, u.username, u.avatar, n.type_notification FROM notifications n JOIN users u ON u.id = n.notified_id WHERE n.notified_id = ? ORDER BY n.created_at DESC", notified_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var notification structs.Notification
		err = rows.Scan(&notification.ID, &notification.Username, &notification.Avatar, &notification.TypeNotification)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}
	return notifications, nil
}

func DeleteNotification(user_id, post_id, post_user_id int64, type_notification string) error {
	if post_id != 0 {
		_, err := DB.Exec("DELETE FROM notifications WHERE user_id = ? AND post_id = ? AND type_notification = ?", user_id, post_id, type_notification)
		return err
	}
	_, err := DB.Exec("DELETE FROM notifications WHERE user_id = ? AND type_notification = ?", user_id, type_notification)
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
