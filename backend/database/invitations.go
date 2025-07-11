package database

import (
	"time"

	structs "social-network/data"
)

func CreateInvitation(invited_id, recipient_id, group_id int64) error {
			mu.Lock()
	defer mu.Unlock() 
	_, err := DB.Exec("INSERT INTO invitations (recipient_id, invited_id, group_id) VALUES (?, ?, ?)", recipient_id, invited_id, group_id)
	return err
}

func AcceptInvitation(invitation_id, invited_id, recipient_id, group_id int64) error {
			mu.Lock()
	defer mu.Unlock() 
	var err error
	if group_id != 0 {
		_, err = DB.Exec("INSERT INTO group_members (user_id, group_id) VALUES (?, ?)", recipient_id, group_id)
	} else {
		_, err = DB.Exec("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", invited_id, recipient_id)
	}
	if err != nil {
		return err
	}
	return DeleteInvitation(invitation_id)
}

func DeleteInvitation(intitation_id int64) error {
			mu.Lock()
	defer mu.Unlock() 
	_, err := DB.Exec("Delete FROM invitations WHERE id = ?", intitation_id)
	return err
}

func GetInvitationsFriends(user_id int64) ([]structs.Invitation, error) {
	var invitations []structs.Invitation
	rows, err := DB.Query("SELECT i.id, u.id, u.username, u.avatar FROM invitations i JOIN users u ON i.invited_id = u.id WHERE i.recipient_id = ? ORDER BY i.created_at DESC", user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var invitation structs.Invitation
		err = rows.Scan(&invitation.ID, &invitation.User.ID, &invitation.User.Username, &invitation.User.Avatar)
		if err != nil {
			return nil, err
		}
		invitations = append(invitations, invitation)
	}
	return invitations, nil
}

func GetInvitationsGroups(user_id int64) ([]structs.Invitation, error) {
	var invitations []structs.Invitation
	rows, err := DB.Query("SELECT i.id, i.created_at, u.id, u.username, u.avatar, g.id, g.admin, g.name, g.members FROM invitations i JOIN users u ON (u.id = i.invited_id) JOIN groups g ON i.group_id = g.id WHERE i.recipient_id = ? ORDER BY i.created_at DESC", user_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var date time.Time
		var invitation structs.Invitation
		err = rows.Scan(&invitation.ID, &date, &invitation.User.ID, &invitation.User.Username, &invitation.User.Avatar, &invitation.Group.ID, &invitation.Group.AdminID, &invitation.Group.Name, &invitation.Group.TotalMembers)
		if err != nil {
			return nil, err
		}
		if invitation.Group.AdminID == user_id || invitation.Group.AdminID == invitation.User.ID {
			invitation.Owner = true
		}
		invitation.Group.Admin, err = GetAdminUsername(invitation.Group.AdminID)
		if err != nil {
			return nil, err
		}
		invitation.CreatedAt = TimeAgo(date)
		invitations = append(invitations, invitation)
	}
	return invitations, nil
}

func GetInvitationsGroup(user_id, group_id int64) ([]structs.Invitation, error) {
	var invitations []structs.Invitation
	rows, err := DB.Query("SELECT i.id, i.created_at, u.id, u.username, u.avatar FROM invitations i JOIN users u ON u.id = i.invited_id JOIN groups g ON i.group_id = g.id WHERE i.recipient_id = ? AND g.id = ? ORDER BY i.created_at DESC", user_id, group_id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var date time.Time
		var invitation structs.Invitation
		err = rows.Scan(&invitation.ID, &date, &invitation.User.ID, &invitation.User.Username, &invitation.User.Avatar)
		if err != nil {
			return nil, err
		}
		invitation.CreatedAt = TimeAgo(date)
		invitation.Group.ID = group_id
		invitations = append(invitations, invitation)
	}
	return invitations, nil
}

func GetAdminUsername(user_id int64) (string, error) {
	var username string
	err := DB.QueryRow("SELECT username FROM users WHERE id = ?", user_id).Scan(&username)
	return username, err
}

func CheckInvitation(invited_id, recipient_id, group_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM invitations WHERE recipient_id = ? AND invited_id = ? AND group_id = ?", recipient_id, invited_id, group_id).Scan(&count)
	return count > 0, err
}

func GetInvitationID(invited_id, recipient_id, group_id int64) (int64, error) {
	var invitation_id int64
	err := DB.QueryRow("SELECT id FROM invitations WHERE recipient_id = ? AND invited_id = ? AND group_id = ?", recipient_id, invited_id, group_id).Scan(&invitation_id)
	return invitation_id, err
}

func AcceptAllInvitations(user_id int64) error {
	rows, err := DB.Query("SELECT id, invited_id, group_id FROM invitations WHERE recipient_id = ?", user_id)
	if err != nil {
		return err
	}
	defer rows.Close()
	var ids [][]int64
	for rows.Next() {
		var invitation structs.Invitation
		err = rows.Scan(&invitation.ID, &invitation.User.ID, &invitation.Group.ID)
		if err != nil {
			return err
		}
		if invitation.Group.ID == 0 {
			ids = append(ids, []int64{invitation.ID, invitation.User.ID, user_id, 0})
		}
	}
	for _, id := range ids {
		err = AcceptInvitation(id[0], id[1], id[2], id[3])
		if err != nil {
			return err
		}
	}
	return nil
}
