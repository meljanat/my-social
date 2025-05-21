package database

import (
	structs "social-network/data"
)

func JoinGroup(user_id, group_id int64) error {
	_, err := DB.Exec("INSERT INTO group_members (user_id, group_id) VALUES (?, ?)", user_id, group_id)
	if err != nil {
		return err
	}
	_, err = DB.Exec("UPDATE groups SET members = members + 1 WHERE id = ?", group_id)
	return err
}

func LeaveGroup(user_id, group_id int64) error {
	_, err := DB.Exec("DELETE FROM group_members WHERE user_id = ? AND group_id = ?", user_id, group_id)
	if err != nil {
		return err
	}
	_, err = DB.Exec("UPDATE groups SET members = members - 1 WHERE id = ?", group_id)
	return err
}

func IsMemberGroup(group_id, user_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM group_members WHERE group_id = ? AND user_id = ?", group_id, user_id).Scan(&count)
	return count > 0, err
}

func GetGroupMembers(user_id, group_id, offset int64) ([]structs.User, error) {
	var members []structs.User
	rows, err := DB.Query("SELECT u.id, u.username, u.avatar, u.last_name, u.first_name FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = ? LIMIT ? OFFSET ?", group_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var member structs.User
		err = rows.Scan(&member.ID, &member.Username, &member.Avatar, &member.LastName, &member.FirstName)
		if err != nil {
			return nil, err
		}
		if member.ID == user_id {
			member.Role = "admin"
		} else {
			member.Role = "member"
		}
		members = append(members, member)
	}
	return members, nil
}

func GetMembers(user_id, group_id int64) ([]structs.User, error) {
	var users []structs.User
	rows, err := DB.Query("SELECT DISTINCT u.id, u.username, u.avatar FROM users u JOIN follows f ON u.id = f.follower_id OR u.id = f.following_id AND u.id NOT IN (SELECT user_id FROM group_members WHERE group_id = ?)", user_id, user_id, group_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var user structs.User
		err = rows.Scan(&user.ID, &user.Username, &user.Avatar)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}
