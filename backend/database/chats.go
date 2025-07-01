package database

import (
	"slices"
	"time"

	structs "social-network/data"
)

func GetConnections(user_id, offset int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT DISTINCT u.id, u.username, u.firstname, u.lastname, u.avatar FROM users u JOIN follows f ON (u.id = f.follower_id OR u.id = f.following_id) WHERE (f.follower_id  = ? OR f.following_id = ?) LIMIT ? OFFSET ?", user_id, user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var connections []structs.User
	for rows.Next() {
		var connection structs.User
		err = rows.Scan(&connection.ID, &connection.Username, &connection.FirstName, &connection.LastName, &connection.Avatar)
		if err != nil {
			return nil, err
		}
		if connection.ID != user_id {
			connection.TotalMessages, err = GetCountConversationMessages(connection.ID, user_id)
			if err != nil {
				return nil, err
			}
			connections = append(connections, connection)
		}
	}
	return connections, nil
}

func SendMessage(sender_id, receiver_id, group_id int64, content, image string) error {
	_, err := DB.Exec("INSERT INTO messages (sender_id, receiver_id, group_id, content) VALUES (?, ?, ?, ?)", sender_id, receiver_id, 0, content)
	return err
}

func GetConversation(user_id, receiver_id, offset int64) ([]structs.Message, error) {
	rows, err := DB.Query("SELECT m.id, u.username, u.avatar, m.content, m.created_at FROM messages m JOIN users u ON u.id = m.sender_id WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?) ORDER BY m.created_at DESC LIMIT ? OFFSET ?", user_id, receiver_id, receiver_id, user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var chats []structs.Message
	for rows.Next() {
		var chat structs.Message
		var date time.Time
		if err := rows.Scan(&chat.ID, &chat.Username, &chat.Avatar, &chat.Content, &date); err != nil {
			return nil, err
		}
		chat.CreatedAt = TimeAgo(date)
		chats = append(chats, chat)
	}
	slices.Reverse(chats)
	return chats, nil
}

func GetGroupConversation(group_id, offset int64) ([]structs.Message, error) {
	rows, err := DB.Query("SELECT c.id, u.username, u.avatar, c.content, c.created_at FROM messages c JOIN users u ON u.id = c.sender_id WHERE c.group_id = ? ORDER BY c.created_at ASC LIMIT ? OFFSET ?", group_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var chats []structs.Message
	for rows.Next() {
		var chat structs.Message
		var date time.Time
		if err := rows.Scan(&chat.ID, &chat.Username, &chat.Avatar, &chat.Content, &date); err != nil {
			return nil, err
		}

		chat.CreatedAt = TimeAgo(date)
		chats = append(chats, chat)
	}
	return chats, nil
}

func GetCountUserMessages(user_id int64) (int64, int64, error) {
	var count int64
	var count2 int64
	rows, err := DB.Query("SELECT messages_not_read FROM messages WHERE receiver_id = ? AND group_id = ?", user_id, 0)
	if err != nil {
		return 0, 0, err
	}
	defer rows.Close()
	var count1 int64
	for rows.Next() {
		if err := rows.Scan(&count1); err != nil {
			return 0, 0, err
		}
		count += count1
	}
	rows, err = DB.Query("SELECT messages_not_read FROM messages WHERE receiver_id = ? AND group_id != ?", user_id, 0)
	if err != nil {
		return 0, 0, err
	}
	defer rows.Close()
	for rows.Next() {
		if err := rows.Scan(&count1); err != nil {
			return 0, 0, err
		}
		count2 += count1
	}
	return count, count2, nil
}

func GetCountConversationMessages(sender_id, user_id int64) (int64, error) {
	var count int64
	rows, err := DB.Query("SELECT messages_not_read FROM messages WHERE sender_id = ? AND receiver_id = ? AND group_id = ?", sender_id, user_id, 0)
	if err != nil {
		return 0, err
	}
	defer rows.Close()
	var count1 int64
	for rows.Next() {
		if err := rows.Scan(&count1); err != nil {
			return 0, err
		}
		count += count1
	}
	return count, err
}

func ReadMessages(sender_id, reciever_id, group_id int64) error {
	if group_id != 0 {
		_, err := DB.Exec("UPDATE group_chats SET status = ? WHERE sender_id = ? AND group_id = ?", "read", sender_id, group_id)
		if err != nil {
			return err
		}
		_, err = DB.Exec("UPDATE group_status_messages SET messages_not_read = 0 WHERE user_id = ? AND group_id = ?", reciever_id, group_id)
		return err
	}
	_, err := DB.Exec("UPDATE messages SET status = ? WHERE receiver_id = ? AND sender_id = ?", "read", reciever_id, reciever_id)
	return err
}
