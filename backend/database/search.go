package database

import structs "social-network/data"

func SearchUsers(query string, offset int64) ([]structs.User, error) {
	rows, err := DB.Query(`SELECT u.id, u.username, u.avatar, u.firstname, u.lastname, u.privacy FROM users u WHERE u.username LIKE ? LIMIT 5 OFFSET ?`, query+"%", offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []structs.User
	for rows.Next() {
		var user structs.User
		err = rows.Scan(&user.ID, &user.Username, &user.Avatar, &user.FirstName, &user.LastName, &user.Privacy)
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
		err = rows.Scan(&group.ID, &group.Name, &group.Image)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func SearchEvents(query string, offset int64) ([]structs.Event, error) {
	rows, err := DB.Query(`SELECT e.id, e.name, e.image FROM group_events e WHERE e.name LIKE ?`, query+"%")
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
	rows, err := DB.Query(`SELECT p.id, p.title, p.created_at FROM posts p WHERE p.title LIKE ?`, query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []structs.Post
	for rows.Next() {
		var post structs.Post
		err = rows.Scan(&post.ID, &post.Title, &post.CreatedAt)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func InsertSearch(user_id int64, query string) error {
	_, err := DB.Exec("INSERT INTO searches (user_id, content) VALUES (?, ?)", user_id, query)
	return err
}

func UpdateFirstSearch(search_id int64, query string) error {
	_, err := DB.Exec("UPDATE searches SET content = ? WHERE id = ?", query, search_id)
	return err
}

func GetCountSearchUser(user_id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM searches WHERE user_id = ?", user_id).Scan(&count)
	return count, err
}

func GetIDFirstSearch(user_id int64) (int64, error) {
	var search_id int64
	err := DB.QueryRow("SELECT id FROM searches WHERE user_id = ? ORDER BY created_at DESC", user_id).Scan(&search_id)
	return search_id, err
}
