package database

import (
	"fmt"
	structs "social-network/data"
)

func AddFollower(follower_id, following_id int64) error {
	_, err := DB.Exec("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", follower_id, following_id)
	if err == nil {
		if err = CreateNotification(follower_id, 0, following_id, "follow"); err != nil {
			fmt.Println(err, "Error creating notification")
			return err
		}
	}
	return err
}

func RemoveFollower(follower_id, following_id int64) error {
	_, err := DB.Exec("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", follower_id, following_id)
	if err != nil {
		return err
	}
	err = DeleteNotification(follower_id, 0, following_id, "follow")
	return err
}

func GetFollowers(user_id int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT u.id, u.username, u.avatar FROM users u JOIN follows f ON u.id = f.follower_id WHERE f.following_id = ?", user_id)
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

func GetFollowing(user_id int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT u.id, u.username, u.avatar FROM users u JOIN follows f ON u.id = f.following_id WHERE f.follower_id = ?", user_id)
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

func GetNotFollowing(user_id int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT id, username, avatar, lastname, firstname FROM users WHERE id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?) AND id NOT IN (SELECT recipient_id FROM invitations WHERE invited_id = ?) AND id != ?", user_id, user_id, user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var notFollowing []structs.User
	for rows.Next() {
		var user structs.User
		err = rows.Scan(&user.ID, &user.Username, &user.Avatar, &user.LastName, &user.FirstName)
		if err != nil {
			return nil, err
		}
		notFollowing = append(notFollowing, user)
	}
	return notFollowing, nil
}

func GetSuggestedUsers(user_id int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT id, username, avatar, lastname, firstname FROM users WHERE id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?) AND id NOT IN (SELECT recipient_id FROM invitations WHERE invited_id = ?) AND id != ?", user_id, user_id, user_id)
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

func GetPendingUsers(user_id int64) ([]structs.User, error) {
	rows, err := DB.Query("SELECT u.id, u.username, u.avatar FROM users u JOIN invitations i ON u.id = i.invited_id WHERE i.recipient_id = ?", user_id)
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
