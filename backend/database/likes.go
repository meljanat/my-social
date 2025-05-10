package database

import (
	structs "social-network/data"
)

func LikePost(user_id int64, post structs.Post) (int64, error) {
	var err error
	var notification bool
	if !post.IsLiked {
		notification = true
		_, err = DB.Exec("INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)", user_id, post.ID)
	} else {
		_, err = DB.Exec("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?", user_id, post.ID)
	}
	if err != nil {
		return 0, err
	}

	if notification {
		if err = CreateNotification(user_id, post.ID, post.UserID, "like"); err != nil {
			return 0, err
		}
	} else if err = DeleteNotification(user_id, post.ID, post.UserID, "like"); err != nil {
		return 0, err
	}

	var count int64
	err = DB.QueryRow("SELECT COUNT(*) FROM post_likes WHERE post_id = ?", post.ID).Scan(&count)
	if err != nil {

	}
	_, err = DB.Exec("UPDATE posts SET total_likes = ? WHERE id = ?", count, post.ID)
	return count, err
}

func LikeGroupPost(user_id, group_id int64, post structs.Post) (int64, error) {
	var err error
	var notification bool
	if !post.IsLiked {
		notification = true
		_, err = DB.Exec("INSERT INTO group_post_likes (group_id, user_id, post_id) VALUES (?, ?, ?)", group_id, user_id, post.ID)
	} else {
		_, err = DB.Exec("DELETE FROM group_post_likes WHERE group_id = ? AND user_id = ? AND post_id = ?", group_id, user_id, post.ID)
	}
	if err != nil {
		return 0, err
	}

	if notification {
		if err = CreateNotification(user_id, post.ID, post.UserID, "like"); err != nil {
			return 0, err
		}
	} else if err = DeleteNotification(user_id, post.ID, post.UserID, "like"); err != nil {
		return 0, err
	}

	var count int64
	err = DB.QueryRow("SELECT COUNT(*) FROM group_post_likes WHERE post_id = ?", post.ID).Scan(&count)
	if err != nil {
		return 0, err
	}
	_, err = DB.Exec("UPDATE group_posts SET total_likes = ? WHERE id = ?", count, post.ID)
	return count, err
}

func PostIsLiked(post_id, user_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM post_likes WHERE post_id = ? AND user_id = ?", post_id, user_id).Scan(&count)
	return count > 0, err
}

func PostGroupIsLiked(post_id, group_id, user_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM group_post_likes WHERE post_id = ? AND group_id = ? AND user_id = ?", post_id, group_id, user_id).Scan(&count)
	return count > 0, err
}

func GetCountUserLikes(user_id int64) (int64, error) {
	var count int64
	var count2 int64
	err := DB.QueryRow("SELECT COUNT(*) FROM post_likes WHERE user_id = ?", user_id).Scan(&count)
	if err != nil {
		return 0, err
	}
	err = DB.QueryRow("SELECT COUNT(*) FROM group_post_likes WHERE user_id = ?", user_id).Scan(&count2)
	return count + count2, err
}
