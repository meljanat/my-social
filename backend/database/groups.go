package database

import (
	structs "social-network/data"
	"time"
)

func CreateGroup(admin int64, name, description, image, cover, privacy string) (int64, error) {
	result, err := DB.Exec("INSERT INTO groups (name, description, image, cover, admin, privacy) VALUES (?, ?, ?, ?, ?, ?)", name, description, image, cover, admin, privacy)
	if err != nil {
		return 0, err
	}
	group_id, err := result.LastInsertId()
	return group_id, err
}

func GetGroups(user_id int64) ([]structs.Group, error) {
	var groups []structs.Group
	rows, err := DB.Query("SELECT g.id, g.name, g.description, g.image, g.cover, g.created_at, g.admin, u.username, g.members FROM groups g JOIN users u ON u.id = g.admin JOIN group_members m ON g.id = m.group_id WHERE m.user_id = ?", user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var group structs.Group
		var date time.Time
		err = rows.Scan(&group.ID, &group.Name, &group.Description, &group.Image, &group.Cover, &date, &group.AdminID, &group.Admin, &group.TotalMembers)
		if err != nil {
			return nil, err
		}
		group.TotalMessages, err = GetCountConversationMessages(group.ID, user_id)
		if err != nil {
			return nil, err
		}
		group.CreatedAt = date.Format("2006-01-02 15:04:05")
		groups = append(groups, group)
		group.TotalPosts, err = GetCountGroupPosts(group.ID)
		if err != nil {
			return nil, err
		}
	}
	return groups, nil
}

func GetSuggestedGroups(user_id int64) ([]structs.Group, error) {
	var groups []structs.Group
	rows, err := DB.Query("SELECT g.id, g.name, g.description, g.image, g.cover, g.admin, g.created_at, u.username, g.members FROM groups g JOIN users u ON u.id = g.admin WHERE g.id NOT IN (SELECT group_id FROM group_members WHERE user_id = ? UNION SELECT group_id FROM invitations_groups WHERE invited_id = ? )", user_id, user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var group structs.Group
		var date time.Time
		err = rows.Scan(&group.ID, &group.Name, &group.Description, &group.Image, &group.Cover, &group.AdminID, &date, &group.Admin, &group.TotalMembers)
		if err != nil {
			return nil, err
		}
		group.CreatedAt = date.Format("2006-01-02 15:04:05")
		groups = append(groups, group)
		group.TotalPosts, err = GetCountGroupPosts(group.ID)
		if err != nil {
			return nil, err
		}
	}
	return groups, nil
}

func GetPendingGroups(user_id int64) ([]structs.Group, error) {
	var groups []structs.Group
	rows, err := DB.Query("SELECT g.id, g.name, g.description, g.image, g.cover, g.admin, g.created_at, u.username, g.members FROM groups g JOIN users u ON u.id = g.admin JOIN invitations_groups i ON g.id = i.group_id WHERE i.invited_id = ?", user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var group structs.Group
		var date time.Time
		err = rows.Scan(&group.ID, &group.Name, &group.Description, &group.Image, &group.Cover, &group.AdminID, &date, &group.Admin, &group.TotalMembers)
		if err != nil {
			return nil, err
		}
		group.CreatedAt = date.Format("2006-01-02 15:04:05")
		groups = append(groups, group)
		group.TotalPosts, err = GetCountGroupPosts(group.ID)
		if err != nil {
			return nil, err
		}
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
	group.TotalPosts, err = GetCountGroupPosts(group_id)
	return group, err
}

func GetCountUserGroups(id int64) (int64, error) {
	var count int64
	err := DB.QueryRow("SELECT COUNT(*) FROM group_members WHERE user_id = ?", id).Scan(&count)
	return count, err
}
