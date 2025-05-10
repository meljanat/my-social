package database

import (
	"database/sql"
	"fmt"
	structs "social-network/data"
	"strings"
	"time"
)

func CreatePost(user_id, category_id int64, title, content, image, privacy string) (int64, error) {
	result, err := DB.Exec("INSERT INTO posts (title, content, category_id, user_id, image, privacy) VALUES (?, ?, ?, ?, ?, ?)", title, content, category_id, user_id, image, privacy)
	if err != nil {
		return 0, err
	}
	post_id, err := result.LastInsertId()
	return post_id, err
}

func CreatePostGroup(user_id, group_id, category_id int64, title, content, image string) (int64, error) {
	result, err := DB.Exec("INSERT INTO group_posts (group_id, title, content, category_id, user_id, image) VALUES (?, ?, ?, ?, ?, ?)", group_id, title, content, category_id, user_id, image)
	if err != nil {
		return 0, err
	}
	post_id, err := result.LastInsertId()
	return post_id, err
}

func GetPosts(user_id int64, followers []structs.User) ([]structs.Post, error) {
	var posts []structs.Post
	var userIds []int64
	userIds = append(userIds, user_id)
	for _, follower := range followers {
		userIds = append(userIds, follower.ID)
	}

	placeholders := make([]string, len(userIds))
	args := make([]interface{}, len(userIds)+5)
	args[0] = "public"
	args[1] = user_id
	args[2] = "almost_private"
	args[3] = user_id
	args[4] = "private"

	for i, uid := range userIds {
		placeholders[i] = "?"
		args[i+5] = uid
	}

	query := fmt.Sprintf(`
	SELECT DISTINCT posts.id, posts.title, posts.content, categories.name, categories.color, categories.background, users.id, users.username, users.Avatar,
	       posts.created_at, posts.total_likes, posts.total_comments, posts.privacy, posts.image
	FROM posts
	JOIN categories ON categories.id = posts.category_id
	JOIN users ON posts.user_id = users.id
	LEFT JOIN post_privacy ON post_privacy.post_id = posts.id
	WHERE posts.privacy = ?
	   OR posts.user_id = ?
	   OR (posts.privacy = ? AND post_privacy.user_id = ?)
	   OR (posts.privacy = ? AND posts.user_id IN (%s))
	`, strings.Join(placeholders, ","))

	rows, err := DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post structs.Post
		var date time.Time
		err = rows.Scan(&post.ID, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &post.UserID, &post.Author, &post.Avatar, &date, &post.TotalLikes, &post.TotalComments, &post.Privacy, &post.Image)
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

func GetPostsByUser(user_id, my_id int64, followed bool) ([]structs.Post, error) {
	var posts []structs.Post
	var rows *sql.Rows
	var err error

	if followed {
		rows, err = DB.Query(`
			SELECT DISTINCT posts.id, posts.title, posts.content, categories.name, categories.color, categories.background, users.username,
			posts.created_at, posts.total_likes, posts.total_comments, posts.privacy, posts.image
			FROM posts
			JOIN categories ON categories.id = posts.category_id
			JOIN users ON posts.user_id = users.id
			LEFT JOIN post_privacy ON post_privacy.post_id = posts.id
			WHERE posts.user_id = ?
			AND ((posts.privacy = ? OR posts.privacy = ?))
			OR (posts.privacy = ? AND post_privacy.user_id = ?)
		`, user_id, "public", "private", "almost_private", my_id)
	} else {
		rows, err = DB.Query(`
			SELECT DISTINCT posts.id, posts.title, posts.content, categories.name, categories.color, categories.background, users.username,
			posts.created_at, posts.total_likes, posts.total_comments, posts.privacy, posts.image
			FROM posts
			JOIN categories ON categories.id = posts.category_id
			JOIN users ON posts.user_id = users.id
			WHERE posts.user_id = ?
			AND posts.privacy = ?
		`, user_id, "public")
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post structs.Post
		var date time.Time
		err = rows.Scan(&post.ID, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &post.Author, &date, &post.TotalLikes, &post.TotalComments, &post.Privacy, &post.Image)
		if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
			return nil, err
		}
		post.CreatedAt = TimeAgo(date)
		post.IsLiked, err = PostIsLiked(post.ID, my_id)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func GetPostsGroup(group_id, user_id int64, privacy string) ([]structs.Post, error) {
	var posts []structs.Post
	rows, err := DB.Query("SELECT p.id, p.title, p.content, categories.name, categories.color, categories.background, users.username, users.avatar, p.created_at, p.total_likes, p.total_comments, p.image FROM group_posts p JOIN categories ON categories.id = p.category_id JOIN users ON p.user_id = users.id WHERE p.group_id = ?", group_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var post structs.Post
		var date time.Time
		err = rows.Scan(&post.ID, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &post.Author, &post.Avatar, &date, &post.TotalLikes, &post.TotalComments, &post.Image)
		if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
			return nil, err
		}
		post.CreatedAt = TimeAgo(date)
		post.Privacy = privacy
		post.IsLiked, err = PostGroupIsLiked(post.ID, group_id, user_id)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func GetPostsByCategory(category_id, user_id int64) ([]structs.Post, error) {
	var posts []structs.Post
	rows, err := DB.Query("SELECT p.id, p.title, p.content, categories.name, categories.color, categories.background, users.username, users.avatar, p.created_at, p.total_likes, p.total_comments, p.image FROM posts p JOIN categories ON categories.id = p.category_id JOIN users ON p.user_id = users.id WHERE p.category_id = ?", category_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var post structs.Post
		var date time.Time
		err = rows.Scan(&post.ID, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &post.Author, &post.Avatar, &date, &post.TotalLikes, &post.TotalComments, &post.Image)
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

func GetPost(user_id, post_id, group_id int64) (structs.Post, error) {
	var post structs.Post
	var date time.Time
	if group_id == 0 {
		err := DB.QueryRow("SELECT posts.id, posts.title, posts.content, categories.name, categories.color, categories.background, users.id, users.username, users.avatar, posts.created_at, posts.total_likes, posts.total_comments, posts.privacy, posts.image FROM posts JOIN users ON posts.user_id = users.id JOIN categories ON categories.id = posts.category_id WHERE posts.id = ?", post_id).Scan(&post.ID, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &post.UserID, &post.Author, &post.Avatar, &date, &post.TotalLikes, &post.TotalComments, &post.Privacy, &post.Image)
		if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
			return structs.Post{}, err
		}
		post.CreatedAt = TimeAgo(date)
		post.IsLiked, err = PostIsLiked(post.ID, user_id)
		return post, err
	}
	err := DB.QueryRow("SELECT p.id, p.title, p.content, categories.name, categories.color, categories.background, users.id, users.username, users.avatar, p.created_at, p.total_likes, p.total_comments, g.privacy, p.image FROM group_posts p JOIN groups g ON g.id = p.group_id JOIN categories ON categories.id = p.category_id JOIN users ON p.user_id = users.id WHERE p.id = ? AND p.group_id = ?", post_id, group_id).Scan(&post.ID, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &post.UserID, &post.Author, &post.Avatar, &date, &post.TotalLikes, &post.TotalComments, &post.Privacy, &post.Image)
	if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
		return structs.Post{}, err
	}
	post.CreatedAt = TimeAgo(date)
	post.GroupID = group_id
	post.IsLiked, err = PostGroupIsLiked(post.ID, group_id, user_id)
	return post, err
}

func GetCountUserPosts(id int64) (int64, error) {
	var count int64
	var count2 int64
	err := DB.QueryRow("SELECT COUNT(*) FROM posts WHERE user_id = ?", id).Scan(&count)
	if err != nil {
		return 0, err
	}
	err = DB.QueryRow("SELECT COUNT(*) FROM group_posts WHERE user_id = ?", id).Scan(&count2)
	return count + count2, err
}

func GetCountGroupPosts(id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM group_posts WHERE group_id = ?", id).Scan(&count)
	return count, err
}

func IsAuthorized(user_id, post_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM post_privacy WHERE post_id = ? AND user_id = ?", post_id, user_id).Scan(&count)
	return count > 0, err
}
