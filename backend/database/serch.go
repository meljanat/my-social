package database

import structs "social-network/data"

func SearchUsers(query string, offset int64) ([]structs.User, error) {
	rows, err := DB.Query(`SELECT u.id, u.username, u.avatar FROM users u WHERE u.username LIKE ?`, query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []structs.User
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

func SearchGroups(query string, offset int64) ([]structs.Group, error) {
	rows, err := DB.Query(`SELECT g.id, g.name, g.image FROM groups g WHERE g.name LIKE ?`, query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var groups []structs.Group
	for rows.Next() {
		var group structs.Group
		err = rows.Scan(&group.ID, &group.Name, &group.User.Avatar)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func SearchEvents(query string, offset int64) ([]structs.Event, error) {
	rows, err := DB.Query(`SELECT e.id, e.name, e.avatar FROM events e WHERE e.name LIKE ?`, query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var events []structs.Event
	for rows.Next() {
		var event structs.Event
		err = rows.Scan(&event.ID, &event.Name, &event.Image)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, nil
}

func SearchPosts(query string, offset int64) ([]structs.Post, error) {
	rows, err := DB.Query(`SELECT p.id, p.content, p.created_at FROM posts p WHERE p.content LIKE ?`, query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []structs.Post
	for rows.Next() {
		var post structs.Post
		err = rows.Scan(&post.ID, &post.Content, &post.CreatedAt)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}
