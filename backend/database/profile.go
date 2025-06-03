package database

import (
	"fmt"
	structs "social-network/data"
)

func GetProfileInfo(user_id int64, following []structs.User) (structs.User, error) {
	var user structs.User
	err := DB.QueryRow("SELECT id, username, firstname, lastname, email, avatar, cover, about, privacy, date_of_birth, created_at, followers, following FROM users WHERE id = ?", user_id).Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Email, &user.Avatar, &user.Cover, &user.Bio, &user.Privacy, &user.DateOfBirth, &user.CreatedAt, &user.TotalFollowers, &user.TotalFollowing)
	if err != nil {
		return user, err
	}
	user.Post.TotalPosts, err = GetCountUserPosts(user_id, 0)
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
	user.Post.TotalLikes, err = GetCountUserLikes(user_id)
	if err != nil {
		return user, err
	}
	user.Post.TotalComments, err = GetCountUserComments(user_id)
	if err != nil {
		return user, err
	}
	user.Message.TotalChatsMessages, user.Message.TotalGroupsMessages, err = GetCountUserMessages(user_id)
	if err != nil {
		return user, err
	}
	user.Message.TotalMessages = user.Message.TotalChatsMessages + user.Message.TotalGroupsMessages
	user.TotalNotifications, err = GetCountNotifications(user_id)
	if err != nil {
		return user, err
	}
	if following != nil {
		following = append(following, user)
		user.Stories, err = GetStories(following)
		if err != nil {
			return user, err
		}
		fmt.Println("following", user.Stories)
	}
	return user, err
}

func UpdateProfile(user_id int64, username, firstname, lastname, about, privacy string) error {
	_, err := DB.Exec("UPDATE users SET username = ?, firstname = ?, lastname = ?, privacy = ?, about = ? WHERE id = ?", username, firstname, lastname, privacy, about, user_id)
	return err
}
