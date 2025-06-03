package database

import (
	structs "social-network/data"
	"strings"
	"time"
)

func CreateComment(content string, user_id int64, post structs.Post, image string) (int64, error) {
	result, err := DB.Exec("INSERT INTO comments (content, user_id, post_id, image) VALUES (?, ?, ?, ?)", content, user_id, post.ID, image)
	if err != nil {
		return 0, err
	}
	_, err = DB.Exec("UPDATE posts SET total_comments = total_comments + 1 WHERE id = ?", post.ID)
	if err != nil {
		return 0, err
	}

	lastID, err := result.LastInsertId()
	return lastID, err
}

func GetPostComments(post_id, offset int64) ([]structs.Comment, error) {
	rows, err := DB.Query("SELECT c.id, c.content, u.id, u.username, u.avatar, c.created_at, c.image FROM comments c JOIN users u ON u.id = c.user_id WHERE c.post_id = ? ORDER BY c.created_at DESC LIMIT ? OFFSET ?", post_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var comments []structs.Comment
	for rows.Next() {
		var comment structs.Comment
		var date time.Time
		err = rows.Scan(&comment.ID, &comment.Content, &comment.UserID, &comment.Username, &comment.Avatar, &date, &comment.Image)
		if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
			return nil, err
		}
		comment.CreatedAt = TimeAgo(date)
		comments = append(comments, comment)
	}
	return comments, nil
}

func GetCountUserComments(user_id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM comments WHERE user_id = ?", user_id).Scan(&count)
	return count, err
}
