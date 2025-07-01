package database

import (
	structs "social-network/data"
)

func GetProfileInfo(user_id int64, following []structs.User) (structs.User, error) {
	var user structs.User
	err := DB.QueryRow("SELECT id, username, firstname, lastname, email, avatar, cover, about, privacy, date_of_birth, created_at, followers, following FROM users WHERE id = ?", user_id).Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Email, &user.Avatar, &user.Cover, &user.Bio, &user.Privacy, &user.DateOfBirth, &user.CreatedAt, &user.TotalFollowers, &user.TotalFollowing)
	if err != nil {
		return user, err
	}
	user.TotalPosts, err = GetCountUserPosts(user_id, 0)
	if err != nil {
		return user, err
	}
	user.TotalGroups, err = GetCountUserGroups(user_id)
	if err != nil {
		return user, err
	}
	user.TotalEvents, err = GetCountUserEvents(user_id)
	if err != nil {
		return user, err
	}
	user.TotalLikes, err = GetCountUserLikes(user_id)
	if err != nil {
		return user, err
	}
	user.TotalComments, err = GetCountUserComments(user_id)
	if err != nil {
		return user, err
	}
	user.TotalChatsMessages, user.TotalGroupsMessages, err = GetCountUserMessages(user_id)
	if err != nil {
		return user, err
	}
	user.TotalFollowers, err = GetCountFollowers(user_id)
	if err != nil {
		return user, err
	}
	user.TotalFollowing, err = GetCountFollowing(user_id)
	if err != nil {
		return user, err
	}
	user.TotalMessages = user.TotalChatsMessages + user.TotalGroupsMessages
	user.TotalNotifications, err = GetCountNotifications(user_id)
	if err != nil {
		return user, err
	}
	user.Stories, err = GetStories(user, following)
	if err != nil {
		return user, err
	}
	return user, err
}

func UpdateProfile(user_id int64, username, firstname, lastname, about, privacy string) error {
	_, err := DB.Exec("UPDATE users SET username = ?, firstname = ?, lastname = ?, privacy = ?, about = ? WHERE id = ?", username, firstname, lastname, privacy, about, user_id)
	return err
}
