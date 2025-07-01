package database

import (
	structs "social-network/data"
	"strings"
	"time"
)

func SavePost(user_id, post_id, group_id int64) error {
	_, err := DB.Exec("INSERT INTO saves (user_id, post_id, group_id) VALUES (?, ?, ?)", user_id, post_id, group_id)
	return err
}

func UnsavePost(user_id, post_id, group_id int64) error {
	_, err := DB.Exec("DELETE FROM saves WHERE user_id = ? AND post_id = ? AND group_id = ?", user_id, post_id, group_id)
	return err
}

func GetSavedPosts(user_id, group_id, offset int64) ([]structs.Post, error) {
	rows, err := DB.Query("SELECT p.id, p.group_id, u.username, u.avatar, p.title, p.content, c.name, c.color, c.background, p.created_at, p.total_likes, p.total_comments, p.privacy, p.image FROM saves s JOIN posts p ON s.post_id = p.id JOIN categories c ON c.id = p.category_id JOIN users u ON u.id = p.user_id WHERE s.user_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?", user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []structs.Post
	for rows.Next() {
		var post structs.Post
		var date time.Time
		err := rows.Scan(&post.ID, &post.GroupID, &post.Author, &post.Avatar, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &date, &post.TotalLikes, &post.TotalComments, &post.Privacy, &post.Image)
		if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
			return nil, err
		}
		post.CreatedAt = TimeAgo(date)
		post.IsLiked, err = PostIsLiked(post.ID, user_id)
		if err != nil {
			return nil, err
		}

		if group_id != 0 && post.GroupID != 0 {
			posts = append(posts, post)
		} else if group_id == 0 && post.GroupID == 0 {
			posts = append(posts, post)
		}
	}
	return posts, nil
}

func IsSaved(user_id, post_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM saves WHERE user_id = ? AND post_id = ?", user_id, post_id).Scan(&count)
	return count > 0, err
}

func CountSaves(post_id, group_id int64) (int64, error) {
	var count int64
	var count1 int64
	err := DB.QueryRow("SELECT COUNT(*) FROM saves WHERE post_id = ? AND group_id = ?", post_id, group_id).Scan(&count)
	if err != nil {
		return 0, err
	}
	err = DB.QueryRow("SELECT total_saves FROM posts WHERE id = ?", post_id).Scan(&count1)
	if err != nil {
		return 0, err
	}
	if count != count1 {
		_, err = DB.Exec("UPDATE posts SET total_saves = ? WHERE id = ?", count, post_id)
	}
	return count, err
}
