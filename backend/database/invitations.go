package database

import structs "social-network/data"

func CreateInvitation(invited_id, recipient_id int64) error {
	_, err := DB.Exec("INSERT INTO invitations (recipient_id, invited_id) VALUES (?, ?)", recipient_id, invited_id)
	return err
}

func CreateInvitationGroup(invited_id, recipient_id, group_id int64) error {
	_, err := DB.Exec("INSERT INTO invitations (recipient_id, invited_id, group_id) VALUES (?, ?, ?)", recipient_id, invited_id, group_id)
	return err
}

func AcceptInvitation(intitation_id, invited_id, recipient_id, group_id int64) error {
	if group_id != 0 {
		_, err := DB.Exec("INSERT INTO group_members (user_id, group_id) VALUES (?, ?)", invited_id, group_id)
		if err != nil {
			return err
		}
		_, err = DB.Exec("Delete FROM invitations WHERE id = ?", intitation_id)
		return err
	}
	_, err := DB.Exec("INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)", recipient_id, invited_id)
	if err != nil {
		return err
	}
	_, err = DB.Exec("Delete FROM invitations WHERE id = ?", intitation_id)
	return err
}

func DeclineInvitation(intitation_id, group_id int64) error {
	if group_id != 0 {
		_, err := DB.Exec("Delete FROM invitations WHERE id = ?", intitation_id)
		return err
	}
	_, err := DB.Exec("Delete FROM invitations WHERE id = ?", intitation_id)
	return err
}

func GetInvitationsFriends(user_id, offset int64) ([]structs.Invitation, error) {
	var invitations []structs.Invitation
	rows, err := DB.Query("SELECT i.id, u.id, u.username, u.avatar FROM invitations i JOIN users u ON i.invited_id = u.id WHERE i.recipient_id = ? ORDER BY i.created_at DESC LIMIT ? OFFSET ?", user_id, 10, offset)
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

func GetInvitationsGroups(user_id, offset int64) ([]structs.Invitation, error) {
	var invitations []structs.Invitation
	rows, err := DB.Query("SELECT i.id, u.id, u.username, u.avatar, g.name FROM invitations i JOIN users u ON u.id = i.invited_id JOIN groups g ON i.group_id = g.id WHERE i.recipient_id = ? ORDER BY i.created_at DESC LIMIT ? OFFSET ?", user_id, 10, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var invitation structs.Invitation
		err = rows.Scan(&invitation.ID, &invitation.User.ID, &invitation.User.Username, &invitation.User.Avatar, &invitation.Group.Name)
		if err != nil {
			return nil, err
		}
		invitations = append(invitations, invitation)
	}
	return invitations, nil
}

func GetInvitationsGroup(group_id, offset int64) ([]structs.Invitation, error) {
	var invitations []structs.Invitation
	rows, err := DB.Query("SELECT i.id, u.id, u.username, u.avatar FROM invitations i JOIN users u ON u.id = i.invited_id JOIN groups g ON i.group_id = g.id WHERE g.id = ? ORDER BY i.created_at DESC LIMIT ? OFFSET ?", group_id, 10, offset)
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

func DeleteInvitation(user_id, invited_id int64) error {
	_, err := DB.Exec("DELETE FROM invitations WHERE recipient_id = ? AND invited_id = ?", user_id, invited_id)
	return err
}

func DeleteInvitationGroup(invited_id, group_id int64) error {
	_, err := DB.Exec("DELETE FROM invitations WHERE group_id = ? AND invited_id = ?", group_id, invited_id)
	return err
}

func GetInvitationById(invitation_id, group_id int64) (structs.Invitation, error) {
	var invitation structs.Invitation
	if group_id != 0 {
		err := DB.QueryRow("SELECT i.id, u.id, u.username, u.avatar, g.name FROM invitations i JOIN users u ON u.id = i.invited_id JOIN groups g ON i.group_id = g.id WHERE i.id = ?", invitation_id).Scan(&invitation.ID, &invitation.User.ID, &invitation.User.Username, &invitation.User.Avatar, &invitation.Group)
		return invitation, err
	}
	err := DB.QueryRow("SELECT i.id, i.invited_id, u.username, u.avatar FROM invitations i JOIN users u ON i.invited_id = u.id WHERE i.id = ?", invitation_id).Scan(&invitation.ID, &invitation.User.ID, &invitation.User.Username, &invitation.User.Avatar)
	return invitation, err
}

func CheckInvitation(invited_id, recipient_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM invitations WHERE recipient_id = ? AND invited_id = ?", recipient_id, invited_id).Scan(&count)
	return count > 0, err
}

func CheckInvitationGroup(invited_id, group_id int64) (bool, error) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM invitations WHERE invited_id = ? AND group_id = ?", invited_id, group_id).Scan(&count)
	return count > 0, err
}
