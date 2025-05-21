package database

import (
	structs "social-network/data"
)

func LikePost(user_id int64, post structs.Post) (int64, error) {
	var err error
	if !post.IsLiked {
		_, err = DB.Exec("INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)", user_id, post.ID)
	} else {
		_, err = DB.Exec("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?", user_id, post.ID)
	}
	if err != nil {
		return 0, err
	}

	var count int64
	err = DB.QueryRow("SELECT COUNT(*) FROM post_likes WHERE post_id = ?", post.ID).Scan(&count)
	if err != nil {

	}
	_, err = DB.Exec("UPDATE posts SET total_likes = ? WHERE id = ?", count, post.ID)
	return count, err
}

func PostIsLiked(post_id, user_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM post_likes WHERE post_id = ? AND user_id = ?", post_id, user_id).Scan(&count)
	return count > 0, err
}

func GetCountUserLikes(user_id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM post_likes WHERE user_id = ?", user_id).Scan(&count)
	return count, err
}

func GetUsersLiked(post_id int64) ([]structs.User, error) {
	var users []structs.User
	rows, err := DB.Query("SELECT u.id, u.username, u.avatar FROM users u JOIN post_likes pl ON u.id = pl.user_id WHERE pl.post_id = ?", post_id)
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
