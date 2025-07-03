package database

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	structs "social-network/data"
)

func CreatePost(user_id, group_id, category_id int64, title, content, image, privacy string) (int64, error) {
	result, err := DB.Exec("INSERT INTO posts (title, content, category_id, user_id, group_id, image, privacy) VALUES (?, ?, ?, ?, ?, ?, ?)", title, content, category_id, user_id, group_id, image, privacy)
	if err != nil {
		return 0, err
	}
	post_id, err := result.LastInsertId()
	return post_id, err
}

func GetPosts(user_id, offset int64, followers []structs.User) ([]structs.Post, error) {
	var posts []structs.Post
	var usersIds []int64
	usersIds = append(usersIds, user_id)
	for _, follower := range followers {
		usersIds = append(usersIds, follower.ID)
	}

	placeholders := make([]string, len(usersIds))
	args := make([]interface{}, len(usersIds)+8)
	args[0] = "public"
	args[1] = user_id
	args[2] = "almost_private"
	args[3] = user_id
	args[4] = "private"

	for i, user_id := range usersIds {
		placeholders[i] = "?"
		args[i+5] = user_id
	}

	args[len(args)-3] = 0
	args[len(args)-2] = 10
	args[len(args)-1] = offset

	query := fmt.Sprintf(`
	SELECT DISTINCT posts.id, posts.title, posts.content, categories.name, categories.color, categories.background, users.id, users.username, users.Avatar,
	posts.created_at, posts.total_likes, posts.total_comments, posts.privacy, posts.image
	FROM posts
	JOIN categories ON categories.id = posts.category_id
	JOIN users ON posts.user_id = users.id
	LEFT JOIN post_privacy ON post_privacy.post_id = posts.id
	WHERE (posts.privacy = ?
	OR posts.user_id = ?
	OR (posts.privacy = ? AND post_privacy.user_id = ?)
	OR (posts.privacy = ? AND posts.user_id IN (%s)))
	AND posts.group_id = ?
	ORDER BY posts.created_at DESC LIMIT ? OFFSET ?
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
		post.WhoLiked, err = GetUsersLiked(post.ID)
		if err != nil {
			return nil, err
		}
		post.TotalSaves, err = CountSaves(post.ID, 0)
		if err != nil {
			return nil, err
		}
		post.IsSaved, err = IsSaved(user_id, post.ID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func GetPostsByUser(user_id, my_id, offset int64, followed bool) ([]structs.Post, error) {
	var posts []structs.Post
	var rows *sql.Rows
	var err error
	if user_id == my_id || followed {
		rows, err = DB.Query(`
			SELECT DISTINCT posts.id, posts.title, posts.content, categories.name, categories.color, categories.background, users.username, users.avatar,
			posts.created_at, posts.total_likes, posts.total_comments, posts.privacy, posts.image
			FROM posts
			JOIN categories ON categories.id = posts.category_id
			JOIN users ON posts.user_id = users.id
			LEFT JOIN post_privacy ON post_privacy.post_id = posts.id
			WHERE posts.user_id = ?
			AND posts.group_id = 0
			AND ((posts.privacy = ? OR posts.privacy = ?)
			OR (posts.privacy = ? AND post_privacy.user_id = ?))
			ORDER BY posts.created_at DESC LIMIT ? OFFSET ?
		`, user_id, "public", "private", "almost_private", my_id, 10, offset)
	} else if !followed {
		rows, err = DB.Query(`
			SELECT DISTINCT posts.id, posts.title, posts.content, categories.name, categories.color, categories.background, users.username, users.avatar,
			posts.created_at, posts.total_likes, posts.total_comments, posts.privacy, posts.image
			FROM posts
			JOIN categories ON categories.id = posts.category_id
			JOIN users ON posts.user_id = users.id
			WHERE posts.user_id = ?
			AND posts.group_id = 0
			AND posts.privacy = ?
			ORDER BY posts.created_at DESC LIMIT ? OFFSET ?
		`, user_id, "public", 10, offset)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post structs.Post
		var date time.Time
		err = rows.Scan(&post.ID, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &post.Author, &post.Avatar, &date, &post.TotalLikes, &post.TotalComments, &post.Privacy, &post.Image)
		if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
			return nil, err
		}
		
		post.CreatedAt = TimeAgo(date)
		post.IsLiked, err = PostIsLiked(post.ID, my_id)
		if err != nil {
			return nil, err
		}
		post.WhoLiked, err = GetUsersLiked(post.ID)
		if err != nil {
			return nil, err
		}
		post.TotalSaves, err = CountSaves(post.ID, post.GroupID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func GetPostsGroup(group_id, user_id, offset int64, privacy string) ([]structs.Post, error) {
	var posts []structs.Post
	rows, err := DB.Query("SELECT p.id, p.title, p.content, categories.name, categories.color, categories.background, users.username, users.avatar, p.created_at, p.total_likes, p.total_comments, p.image FROM posts p JOIN categories ON categories.id = p.category_id JOIN users ON p.user_id = users.id WHERE p.group_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ? ", group_id, 10, offset)
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
		post.IsLiked, err = PostIsLiked(post.ID, user_id)
		if err != nil {
			return nil, err
		}
		post.WhoLiked, err = GetUsersLiked(post.ID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func GetPostsByCategory(category_id, user_id, offset int64) ([]structs.Post, error) {
	var posts []structs.Post
	rows, err := DB.Query("SELECT p.id, p.title, p.content, categories.name, categories.color, categories.background, users.username, users.avatar, p.created_at, p.total_likes, p.total_comments, p.image FROM posts p JOIN categories ON categories.id = p.category_id JOIN users ON p.user_id = users.id WHERE p.category_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?", category_id, 10, offset)
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
		post.WhoLiked, err = GetUsersLiked(post.ID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func GetPost(user_id, post_id int64) (structs.Post, error) {
	var post structs.Post
	var date time.Time
	err := DB.QueryRow("SELECT posts.id, posts.title, posts.content, categories.name, categories.color, categories.background, users.id, users.username, users.avatar, posts.created_at, posts.total_likes, posts.total_comments, posts.privacy, posts.image FROM posts JOIN users ON posts.user_id = users.id JOIN categories ON categories.id = posts.category_id WHERE posts.id = ?", post_id).Scan(&post.ID, &post.Title, &post.Content, &post.Category, &post.CategoryColor, &post.CategoryBackground, &post.UserID, &post.Author, &post.Avatar, &date, &post.TotalLikes, &post.TotalComments, &post.Privacy, &post.Image)
	if err != nil && !strings.Contains(err.Error(), `name "image": converting NULL to string`) {
		return structs.Post{}, err
	}
	post.CreatedAt = TimeAgo(date)
	post.IsLiked, err = PostIsLiked(post.ID, user_id)
	if err != nil {
		return structs.Post{}, err
	}
	post.IsSaved, err = IsSaved(user_id, post.ID)
	if err != nil {
		return structs.Post{}, err
	}
	post.WhoLiked, err = GetUsersLiked(post.ID)
	return post, err
}

func GetCountUserPosts(user_id, group_id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM posts WHERE user_id = ? AND group_id = ?", user_id, group_id).Scan(&count)
	return count, err
}

func GetCountGroupPosts(group_id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM posts WHERE group_id = ?", group_id).Scan(&count)
	return count, err
}

func IsAuthorized(user_id, post_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM post_privacy WHERE post_id = ? AND user_id = ?", post_id, user_id).Scan(&count)
	return count > 0, err
}

func Almost(user_id, post_id int64) error {
	_, err := DB.Exec("INSERT INTO post_privacy (user_id, post_id) VALUES (?, ?)", user_id, post_id)
	return err
}

func GetLastTime(name_table string) (string, error) {
	var last_time string
	query := fmt.Sprintf("SELECT created_at FROM %s ORDER BY created_at DESC LIMIT 1", name_table)

	err := DB.QueryRow(query).Scan(&last_time)
	return last_time, err
}
