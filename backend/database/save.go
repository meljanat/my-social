package database

import (
	structs "social-network/data"
	"strings"
	"time"
)

func SavePost(user_id, post_id, group_id int64) error {
	if group_id != 0 {
		_, err := DB.Exec("INSERT INTO group_saves (user_id, post_id, group_id) VALUES (?, ?, ?)", user_id, post_id, group_id)
		return err
	}
	_, err := DB.Exec("INSERT INTO saves (user_id, post_id) VALUES (?, ?)", user_id, post_id)
	return err
}

func UnsavePost(user_id, post_id, group_id int64) error {
	if group_id != 0 {
		_, err := DB.Exec("DELETE FROM group_saves WHERE user_id = ? AND post_id = ? AND group_id = ?", user_id, post_id, group_id)
		return err
	}
	_, err := DB.Exec("DELETE FROM saves WHERE user_id = ? AND post_id = ?", user_id, post_id)
	return err
}

func GetSavedPosts(user_id int64) ([]structs.Post, error) {
	rows, err := DB.Query("SELECT p.id, u.username, u.avatar, p.title, p.content, c.name, c.color, c.background, p.created_at, p.total_likes, p.total_comments, p.privacy, p.image FROM saves s JOIN posts p ON s.post_id = p.id JOIN categories c ON c.id = p.category_id JOIN users u ON u.id = p.user_id WHERE s.user_id = ?", user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []structs.Post
	for rows.Next() {
		var post structs.Post
		var date time.Time
		err := rows.Scan(&post.ID, &post.Author, &post.Avatar, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &date, &post.TotalLikes, &post.TotalComments, &post.Privacy, &post.Image)
		if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
			return nil, err
		}
		post.CreatedAt = TimeAgo(date)
		post.IsLiked, err = PostIsLiked(post.ID, user_id)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func GetSavedGroupPosts(user_id int64) ([]structs.Post, error) {
	rows, err := DB.Query("SELECT p.id, g.id, u.username, u.avatar, p.title, p.content, p.image, c.name, c.color, c.background, p.created_at, p.total_likes, p.total_comments,  g.name FROM group_saves s JOIN group_posts p ON s.post_id = p.id JOIN categories c ON c.id = p.category_id JOIN users u ON u.id = p.user_id JOIN groups g ON g.id = s.group_id WHERE s.user_id = ?", user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []structs.Post
	for rows.Next() {
		var post structs.Post
		var date time.Time
		err := rows.Scan(&post.ID, &post.GroupID, &post.Author, &post.Avatar, &post.Title, &post.Content, &post.Image, &post.Category, &post.CategoryColor, &post.CategoryBackground, &date, &post.TotalLikes, &post.TotalComments, &post.GroupName)
		if err != nil {
			return nil, err
		}
		post.CreatedAt = TimeAgo(date)
		post.IsLiked, err = PostGroupIsLiked(post.ID, post.GroupID, user_id)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}
