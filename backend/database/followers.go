package database

import (
	structs "social-network/data"
)

func AddFollower(follower_id, following_id int64) error {
	_, err := DB.Exec("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", follower_id, following_id)
	return err
}

func RemoveFollower(follower_id, following_id int64) error {
	_, err := DB.Exec("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", follower_id, following_id)
	return err
}

func GetFollowers(user_id, offset int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT u.id, u.username, u.avatar FROM users u JOIN follows f ON u.id = f.follower_id WHERE f.following_id = ? LIMIT ? OFFSET ?", user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var followers []structs.User
	for rows.Next() {
		var follower structs.User
		err = rows.Scan(&follower.ID, &follower.Username, &follower.Avatar)
		if err != nil {
			return nil, err
		}
		followers = append(followers, follower)
	}
	return followers, nil
}

func GetAllFollowers(user_id int64) ([]int64, error) {
	rows, err := DB.Query("SELECT u.id FROM users u JOIN follows f ON u.id = f.follower_id WHERE f.following_id = ?", user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var followers []int64
	for rows.Next() {
		var follower int64
		err = rows.Scan(&follower)
		if err != nil {
			return nil, err
		}
		followers = append(followers, follower)
	}
	return followers, nil
}

func GetFollowing(user_id, offset, limit int64) ([]structs.User, error) {
	if limit == 0 {
		limit = 10
	}
	rows, err := DB.Query("SELECT u.id, u.username, u.avatar FROM users u JOIN follows f ON u.id = f.following_id WHERE f.follower_id = ? LIMIT ? OFFSET ?", user_id, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var following []structs.User
	for rows.Next() {
		var follower structs.User
		err = rows.Scan(&follower.ID, &follower.Username, &follower.Avatar)
		if err != nil {
			return nil, err
		}
		following = append(following, follower)
	}
	return following, nil
}

func GetCountFollowing(user_id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM follows WHERE follower_id = ?", user_id).Scan(&count)
	return count, err
}

func GetSuggestedUsers(user_id, offset int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT id, username, avatar, lastname, firstname FROM users WHERE id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?) AND id NOT IN (SELECT recipient_id FROM invitations WHERE invited_id = ?) AND id != ? LIMIT ? OFFSET ?", user_id, user_id, user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var suggestedUsers []structs.User
	for rows.Next() {
		var user structs.User
		err = rows.Scan(&user.ID, &user.Username, &user.Avatar, &user.LastName, &user.FirstName)
		if err != nil {
			return nil, err
		}
		suggestedUsers = append(suggestedUsers, user)
	}
	return suggestedUsers, nil
}

func GetReceivedUsers(user_id, offset int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT u.id, u.username, u.avatar FROM users u JOIN invitations i ON u.id = i.invited_id WHERE i.recipient_id = ? LIMIT ? OFFSET ?", user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var receivedUsers []structs.User
	for rows.Next() {
		var user structs.User
		err = rows.Scan(&user.ID, &user.Username, &user.Avatar)
		if err != nil {
			return nil, err
		}
		receivedUsers = append(receivedUsers, user)
	}
	return receivedUsers, nil
}

func GetPendingUsers(user_id, offset int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT u.id, u.username, u.avatar FROM users u JOIN invitations i ON u.id = i.recipient_id WHERE i.group_id = 0 AND i.invited_id = ? LIMIT ? OFFSET ?", user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var pendingUsers []structs.User
	for rows.Next() {
		var user structs.User
		err = rows.Scan(&user.ID, &user.Username, &user.Avatar)
		if err != nil {
			return nil, err
		}
		pendingUsers = append(pendingUsers, user)
	}
	return pendingUsers, nil
}

func IsFollowed(follower_id, following_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = ?", follower_id, following_id).Scan(&count)
	return count > 0, err
}

func GetCountFollowers(user_id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM follows WHERE following_id = ?", user_id).Scan(&count)
	return count, err
}
