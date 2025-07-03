package database

import (
	"database/sql"
	"time"

	structs "social-network/data"
)

func CreateGroup(admin int64, name, description, image, cover, privacy string) (int64, error) {
	result, err := DB.Exec("INSERT INTO groups (name, description, image, cover, admin, privacy) VALUES (?, ?, ?, ?, ?, ?)", name, description, image, cover, admin, privacy)
	if err != nil {
		return 0, err
	}
	group_id, err := result.LastInsertId()
	return group_id, err
}

func DeleteGroup(group_id int64) error {
	_, err := DB.Exec("DELETE FROM groups WHERE id = ?", group_id)
	if err != nil {
		return err
	}
	_, err = DB.Exec("DELETE FROM group_members WHERE group_id = ?", group_id)
	if err != nil {
		return err
	}
	_, err = DB.Exec("DELETE FROM posts WHERE group_id = ?", group_id)
	if err != nil {
		return err
	}
	_, err = DB.Exec("DELETE FROM invitations WHERE group_id = ?", group_id)
	return err
}

func GetGroups(user structs.User, offset int64) ([]structs.Group, error) {
	var groups []structs.Group
	var err error
	var rows *sql.Rows
	if offset == -1 {
		rows, err = DB.Query("SELECT g.id, g.name, g.description, g.image, g.cover, g.created_at, g.admin, g.privacy, u.username, g.members FROM groups g JOIN users u ON u.id = g.admin JOIN group_members m ON g.id = m.group_id WHERE m.user_id = ? ORDER BY g.created_at DESC", user.ID)
	} else {
		rows, err = DB.Query("SELECT g.id, g.name, g.description, g.image, g.cover, g.created_at, g.admin, g.privacy, u.username, g.members FROM groups g JOIN users u ON u.id = g.admin JOIN group_members m ON g.id = m.group_id WHERE m.user_id = ? ORDER BY g.created_at DESC LIMIT ? OFFSET ?", user.ID, 10, offset)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var group structs.Group
		var date time.Time
		err = rows.Scan(&group.ID, &group.Name, &group.Description, &group.Image, &group.Cover, &date, &group.AdminID, &group.Privacy, &group.Admin, &group.TotalMembers)
		if err != nil {
			return nil, err
		}
		group.TotalMessages, err = GetCountConversationMessages(0, user.ID, group.ID)
		if err != nil {
			return nil, err
		}
		group.CreatedAt = date.Format("2006-01-02 15:04:05")
		group.TotalPosts, err = GetCountGroupPosts(group.ID)
		if err != nil {
			return nil, err
		}
		if user.Username == group.Admin {
			group.Role = "admin"
		} else {
			group.Role = "member"
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func GetSuggestedGroups(user_id, offset int64) ([]structs.Group, error) {
	var groups []structs.Group
	rows, err := DB.Query("SELECT g.id, g.name, g.description, g.image, g.cover, g.admin, g.privacy, g.created_at, u.username, g.members FROM groups g JOIN users u ON u.id = g.admin WHERE g.id NOT IN (SELECT group_id FROM group_members WHERE user_id = ? UNION SELECT group_id FROM invitations WHERE invited_id = ?) ORDER BY g.created_at DESC LIMIT ? OFFSET ?", user_id, user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var group structs.Group
		var date time.Time
		err = rows.Scan(&group.ID, &group.Name, &group.Description, &group.Image, &group.Cover, &group.AdminID, &group.Privacy, &date, &group.Admin, &group.TotalMembers)
		if err != nil {
			return nil, err
		}
		group.CreatedAt = date.Format("2006-01-02 15:04:05")
		group.TotalPosts, err = GetCountGroupPosts(group.ID)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func GetPendingGroups(user_id, offset int64) ([]structs.Group, error) {
	var groups []structs.Group
	rows, err := DB.Query("SELECT g.id, g.name, g.description, g.image, g.cover, g.admin, g.privacy, g.created_at, u.username, g.members FROM groups g JOIN users u ON u.id = g.admin JOIN invitations i ON g.id = i.group_id WHERE i.invited_id = ? ORDER BY g.created_at DESC LIMIT ? OFFSET ?", user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var group structs.Group
		var date time.Time
		err = rows.Scan(&group.ID, &group.Name, &group.Description, &group.Image, &group.Cover, &group.AdminID, &group.Privacy, &date, &group.Admin, &group.TotalMembers)
		if err != nil {
			return nil, err
		}
		group.CreatedAt = date.Format("2006-01-02 15:04:05")
		group.TotalPosts, err = GetCountGroupPosts(group.ID)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func GetGroupById(group_id int64) (structs.Group, error) {
	var group structs.Group
	var date time.Time
	err := DB.QueryRow("SELECT g.id, g.name, g.description, g.image, g.cover, g.admin, g.created_at, u.username, g.members, g.privacy FROM groups g JOIN users u ON u.id = g.admin WHERE g.id = ?", group_id).Scan(&group.ID, &group.Name, &group.Description, &group.Image, &group.Cover, &group.AdminID, &date, &group.Admin, &group.TotalMembers, &group.Privacy)
	if err != nil {
		return group, err
	}
	group.CreatedAt = date.Format("2006-01-02 15:04:05")
	group.TotalPosts, err = GetCountUserPosts(group.AdminID, group_id)
	return group, err
}

func GetCountUserGroups(id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM group_members WHERE user_id = ?", id).Scan(&count)
	return count, err
}

func GetAllMembers(group_id, user_id int64) ([]int64, error) {
	var users []int64
	rows, err := DB.Query("SELECT u.id FROM group_members m JOIN users u ON u.id = m.user_id WHERE m.group_id = ?", group_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var user int64
		err = rows.Scan(&user)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}
