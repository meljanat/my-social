package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	structs "social-network/data"
	"social-network/database"
)

func InvitationsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "invitations") {
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	type Invitation struct {
		User  int64 `json:"user_id"`
		Group int64 `json:"group_id"`
	}

	var invitation Invitation
	err = json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	isInvitation, err := database.CheckInvitation(user.ID, invitation.User, invitation.Group)
	if err != nil {
		fmt.Println("Failed to retrieve invitation", err)
		response := map[string]string{"error": "Failed to retrieve invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	var invitation_id int64
	if isInvitation {
		invitation_id, err = database.GetInvitationID(user.ID, invitation.User, invitation.Group)
		if err != nil {
			fmt.Println("Failed to retrieve invitation ID", err)
			response := map[string]string{"error": "Failed to retrieve invitation ID"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if invitation.Group == 0 {
		userToFollowing, err := database.GetUserById(invitation.User)
		if err != nil {
			fmt.Println("Failed to retrieve follower", err)
			response := map[string]string{"error": "Failed to retrieve follower"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		} else if userToFollowing.ID == user.ID {
			fmt.Println("Cannot send invitation to you", err)
			response := map[string]string{"error": "Cannot send invitation to you"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		isFollowed, err := database.IsFollowed(user.ID, invitation.User)
		if err != nil {
			fmt.Println("Failed to check if user is followed", err)
			response := map[string]string{"error": "Failed to check if user is followed"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		var action string
		if !isFollowed {
			if userToFollowing.Privacy == "public" {
				if err := database.AddFollower(user.ID, invitation.User); err != nil {
					fmt.Println("Failed to follow user", err)
					response := map[string]string{"error": "Failed to follow user"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}

				if err := database.CreateNotification(user.ID, invitation.User, 0, 0, 0, "follow"); err != nil {
					fmt.Println("Failed to create notification", err)
					response := map[string]string{"error": "Failed to create notification"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}
				action = "Unfollow"
			} else if !isInvitation {
				if err := database.CreateInvitation(user.ID, invitation.User, invitation.Group); err != nil {
					fmt.Println("Failed to send invitation", err)
					response := map[string]string{"error": "Failed to send invitation"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}

				if err := database.CreateNotification(user.ID, invitation.User, 0, 0, 0, "follow_request"); err != nil {
					fmt.Println("Failed to create notification", err)
					response := map[string]string{"error": "Failed to create notification"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}

				action = "Pending"
			} else {
				if err := database.DeleteInvitation(invitation_id); err != nil {
					fmt.Println("Failed to delete invitation", err)
					response := map[string]string{"error": "Failed to delete invitation"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}

				if err := database.DeleteNotification(user.ID, invitation.User, 0, 0, 0, "follow_request"); err != nil {
					fmt.Println("Failed to create notification", err)
					response := map[string]string{"error": "Failed to delete notification"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}

				action = "Follow"
			}
		} else {
			if err := database.RemoveFollower(user.ID, invitation.User); err != nil {
				fmt.Println("Failed to unfollow user", err)
				response := map[string]string{"error": "Failed to unfollow user"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}

			if err := database.DeleteNotification(user.ID, invitation.User, 0, 0, 0, "follow"); err != nil {
				fmt.Println("Failed to create notification", err)
				response := map[string]string{"error": "Failed to delete notification"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}

			action = "Follow"
		}
		total_followers, err := database.GetCountFollowing(user.ID)
		if err != nil {
			fmt.Println("Failed to retrieve total following", err)
			response := map[string]string{"error": "Failed to retrieve total follows"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		isFolowed, err := database.IsFollowed(invitation.User, user.ID)
		if err != nil {
			fmt.Println("Failed to check if user is followed", err)
			response := map[string]string{"error": "Failed to check if user is followed"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		if action == "Follow" && isFolowed {
			action = "Follow back"
		}

		data := struct {
			Action         string `json:"action"`
			TotalFollowers int64  `json:"total_followers"`
		}{
			Action:         action,
			TotalFollowers: total_followers,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	} else {
		group, err := database.GetGroupById(invitation.Group)
		if err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Failed to retrieve group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		isMember, err := database.IsMemberGroup(user.ID, invitation.Group)
		if err != nil {
			fmt.Println("Failed to check if user is member", err)
			response := map[string]string{"error": "Failed to check if user is member"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		if !isMember {
			if group.Privacy == "public" {
				if err := database.JoinGroup(user.ID, invitation.Group); err != nil {
					fmt.Println("Failed to join group", err)
					response := map[string]string{"error": "Failed to join group"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}

				if err := database.CreateNotification(user.ID, group.AdminID, group.ID, 0, 0, "join"); err != nil {
					fmt.Println("Failed to create notification", err)
					response := map[string]string{"error": "Failed to create notification"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode("join")
			} else if !isInvitation {
				if err := database.CreateInvitation(user.ID, group.AdminID, group.ID); err != nil {
					fmt.Println("Failed to send invitation", err)
					response := map[string]string{"error": "Failed to send invitation"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}
				if err := database.CreateNotification(user.ID, group.AdminID, group.ID, 0, 0, "join_request"); err != nil {
					fmt.Println("Failed to create notification", err)
					response := map[string]string{"error": "Failed to create notification"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode("cancel")
			} else {
				if err := database.DeleteInvitation(invitation_id); err != nil {
					fmt.Println("Failed to delete invitation", err)
					response := map[string]string{"error": "Failed to delete invitation"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}
				if err := database.DeleteNotification(user.ID, group.AdminID, group.ID, 0, 0, "join_request"); err != nil {
					fmt.Println("Failed to create notification", err)
					response := map[string]string{"error": "Failed to delete notification"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode("follow")
			}
		} else if group.AdminID != user.ID {
			if err := database.LeaveGroup(user.ID, invitation.Group); err != nil {
				fmt.Println("Failed to leave group", err)
				response := map[string]string{"error": "Failed to leave group"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
			if err := database.DeleteNotification(user.ID, group.AdminID, group.ID, 0, 0, "join"); err != nil {
				fmt.Println("Failed to create notification", err)
				response := map[string]string{"error": "Failed to delete notification"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode("leave")
		} else {
			if err := database.DeleteGroup(invitation.Group); err != nil {
				fmt.Println("Failed to delete group", err)
				response := map[string]string{"error": "Failed to delete group"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode("delete")
		}
	}
}

func GetInvitationsGroups(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Error parsing offset:", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	invitations, err := database.GetInvitationsGroups(user.ID, offset)
	if err != nil {
		fmt.Println("Failed to retrieve invitations", err)
		response := map[string]string{"error": "Failed to retrieve invitations"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invitations)
}

func AcceptInvitationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "follows") {
		return
	} else if !LastTime(w, r, "group_members") {
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	type Invitation struct {
		User  int64 `json:"user_id"`
		Group int64 `json:"group_id"`
	}

	var invitation Invitation
	err = json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var userToFollowing structs.User
	if invitation.User != 0 {
		userToFollowing, err = database.GetUserById(invitation.User)
		if err != nil {
			fmt.Println("Failed to retrieve follower", err)
			response := map[string]string{"error": "Failed to retrieve follower"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		} else if userToFollowing.ID == user.ID {
			fmt.Println("Cannot accept your own invitation", err)
			response := map[string]string{"error": "Cannot accept your own invitation"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		isFollowed, err := database.IsFollowed(user.ID, invitation.User)
		if err != nil {
			fmt.Println("Failed to check if user is followed", err)
			response := map[string]string{"error": "Failed to check if user is followed"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		} else if isFollowed && invitation.Group == 0 {
			fmt.Println("User is already followed")
			response := map[string]string{"error": "User is already followed"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if invitation.Group != 0 {
		group, err := database.GetGroupById(invitation.Group)
		if err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Failed to retrieve group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		if group.AdminID != user.ID {
			fmt.Println("User is not the creator of the group")
			response := map[string]string{"error": "User is not the creator of the group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		isMember, err := database.IsMemberGroup(invitation.User, group.ID)
		if err != nil {
			fmt.Println("Failed to check if user is member of the group", err)
			response := map[string]string{"error": "Failed to check if user is member of the group"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		} else if isMember {
			fmt.Println("User is already a member of the group")
			response := map[string]string{"error": "User is already a member of the group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	isInvitation, err := database.CheckInvitation(invitation.User, user.ID, invitation.Group)
	if err != nil || !isInvitation {
		fmt.Println("Failed to retrieve invitation", err)
		response := map[string]string{"error": "Failed to retrieve invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	invitation_id, err := database.GetInvitationID(invitation.User, user.ID, invitation.Group)
	if err != nil {
		fmt.Println("Failed to retrieve invitation ID", err)
		response := map[string]string{"error": "Failed to retrieve invitation ID"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if invitation.Group != 0 {
		_, err = database.GetGroupById(invitation.Group)
		if err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Invalid group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if err := database.AcceptInvitation(invitation_id, invitation.User, user.ID, invitation.Group); err != nil {
		fmt.Println("Failed to accept invitation", err)
		response := map[string]string{"error": "Failed to accept invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
}

func DeclineInvitationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "follows") {
		return
	} else if !LastTime(w, r, "group_members") {
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	type Invitation struct {
		User  int64 `json:"user_id"`
		Group int64 `json:"group_id"`
	}

	var invitation Invitation
	err = json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var userToFollowing structs.User
	if invitation.User != 0 {
		userToFollowing, err = database.GetUserById(invitation.User)
		if err != nil {
			fmt.Println("Failed to retrieve follower", err)
			response := map[string]string{"error": "Failed to retrieve follower"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		} else if userToFollowing.ID == user.ID {
			fmt.Println("Cannot accept your own invitation", err)
			response := map[string]string{"error": "Cannot accept your own invitation"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		isFollowed, err := database.IsFollowed(user.ID, invitation.User)
		if err != nil {
			fmt.Println("Failed to check if user is followed", err)
			response := map[string]string{"error": "Failed to check if user is followed"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		} else if isFollowed && invitation.Group == 0 {
			fmt.Println("User is already followed")
			response := map[string]string{"error": "User is already followed"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if invitation.Group != 0 {
		group, err := database.GetGroupById(invitation.Group)
		if err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Failed to retrieve group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		if group.AdminID != user.ID {
			fmt.Println("User is not the creator of the group")
			response := map[string]string{"error": "User is not the creator of the group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		isMember, err := database.IsMemberGroup(invitation.User, group.ID)
		if err != nil {
			fmt.Println("Failed to check if user is member of the group", err)
			response := map[string]string{"error": "Failed to check if user is member of the group"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		} else if isMember {
			fmt.Println("User is already a member of the group")
			response := map[string]string{"error": "User is already a member of the group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	isInvitation, err := database.CheckInvitation(invitation.User, user.ID, invitation.Group)
	if err != nil || !isInvitation {
		fmt.Println("Failed to retrieve invitation", err)
		response := map[string]string{"error": "Failed to retrieve invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	invitation_id, err := database.GetInvitationID(invitation.User, user.ID, invitation.Group)
	if err != nil {
		fmt.Println("Failed to retrieve invitation ID", err)
		response := map[string]string{"error": "Failed to retrieve invitation ID"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if invitation.Group != 0 {
		_, err = database.GetGroupById(invitation.Group)
		if err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Invalid group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if err := database.DeleteInvitation(invitation_id); err != nil {
		fmt.Println("Failed to decline invitation", err)
		response := map[string]string{"error": "Failed to decline invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
}

func AcceptOtherInvitationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "group_members") {
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	type Invitation struct {
		User  int64 `json:"user_id"`
		Group int64 `json:"group_id"`
	}

	var invitation Invitation
	err = json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	fmt.Println("Invitation received:", invitation)

	userToFollowing, err := database.GetUserById(invitation.User)
	if err != nil {
		fmt.Println("Failed to retrieve follower", err)
		response := map[string]string{"error": "Failed to retrieve follower"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	} else if userToFollowing.ID == user.ID {
		fmt.Println("Cannot accept your own invitation", err)
		response := map[string]string{"error": "Cannot accept your own invitation"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	group, err := database.GetGroupById(invitation.Group)
	if err != nil {
		fmt.Println("Failed to retrieve group", err)
		response := map[string]string{"error": "Failed to retrieve group"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if group.AdminID != invitation.User {
		fmt.Println("User is not the creator of the group")
		response := map[string]string{"error": "User is not the creator of the group"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	isMember, err := database.IsMemberGroup(user.ID, group.ID)
	if err != nil {
		fmt.Println("Failed to check if user is member of the group", err)
		response := map[string]string{"error": "Failed to check if user is member of the group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	} else if isMember {
		fmt.Println("User is already a member of the group")
		response := map[string]string{"error": "User is already a member of the group"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	isInvitation, err := database.CheckInvitation(invitation.User, user.ID, invitation.Group)
	if err != nil || !isInvitation {
		fmt.Println("Failed to retrieve invitation", err)
		response := map[string]string{"error": "Failed to retrieve invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	invitation_id, err := database.GetInvitationID(invitation.User, user.ID, invitation.Group)
	if err != nil {
		fmt.Println("Failed to retrieve invitation ID", err)
		response := map[string]string{"error": "Failed to retrieve invitation ID"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	_, err = database.GetGroupById(invitation.Group)
	if err != nil {
		fmt.Println("Failed to retrieve group", err)
		response := map[string]string{"error": "Invalid group"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := database.AcceptInvitation(invitation_id, invitation.User, user.ID, invitation.Group); err != nil {
		fmt.Println("Failed to accept invitation", err)
		response := map[string]string{"error": "Failed to accept invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
}

func DeclineOtherInvitationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "group_members") {
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	type Invitation struct {
		User  int64 `json:"user_id"`
		Group int64 `json:"group_id"`
	}

	var invitation Invitation
	err = json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	userToFollowing, err := database.GetUserById(invitation.User)
	if err != nil {
		fmt.Println("Failed to retrieve follower", err)
		response := map[string]string{"error": "Failed to retrieve follower"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	} else if userToFollowing.ID == user.ID {
		fmt.Println("Cannot accept your own invitation", err)
		response := map[string]string{"error": "Cannot accept your own invitation"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	group, err := database.GetGroupById(invitation.Group)
	if err != nil {
		fmt.Println("Failed to retrieve group", err)
		response := map[string]string{"error": "Failed to retrieve group"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if group.AdminID != invitation.User {
		fmt.Println("User is not the creator of the group")
		response := map[string]string{"error": "User is not the creator of the group"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	isMember, err := database.IsMemberGroup(user.ID, group.ID)
	if err != nil {
		fmt.Println("Failed to check if user is member of the group", err)
		response := map[string]string{"error": "Failed to check if user is member of the group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	} else if isMember {
		fmt.Println("User is already a member of the group")
		response := map[string]string{"error": "User is already a member of the group"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	isInvitation, err := database.CheckInvitation(invitation.User, user.ID, invitation.Group)
	if err != nil || !isInvitation {
		fmt.Println("Failed to retrieve invitation", err)
		response := map[string]string{"error": "Failed to retrieve invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	invitation_id, err := database.GetInvitationID(invitation.User, user.ID, invitation.Group)
	if err != nil {
		fmt.Println("Failed to retrieve invitation ID", err)
		response := map[string]string{"error": "Failed to retrieve invitation ID"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	_, err = database.GetGroupById(invitation.Group)
	if err != nil {
		fmt.Println("Failed to retrieve group", err)
		response := map[string]string{"error": "Invalid group"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := database.DeleteInvitation(invitation_id); err != nil {
		fmt.Println("Failed to decline invitation", err)
		response := map[string]string{"error": "Failed to decline invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
}
