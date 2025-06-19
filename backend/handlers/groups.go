package handlers

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	structs "social-network/data"
	"social-network/database"
)

func CreateGrpoupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "groups") {
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

	var group structs.Group
	group.Name = r.FormValue("name")
	group.Description = r.FormValue("description")
	group.Privacy = r.FormValue("privacy")

	errors, valid := ValidateGroup(group.Name, group.Description, group.Privacy)
	if !valid {
		fmt.Println("Validation error", errors)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":  "Validation error",
			"fields": errors,
		})
		return
	}

	var imagePath string
	image, header, err := r.FormFile("groupImage")
	if err != nil && err.Error() != "http: no such file" {
		fmt.Println("Error retrieving image:", err)
		response := map[string]string{"error": "Failed to retrieve image"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	} else if image != nil {
		imagePath, err = SaveImage(image, header, "../frontend/public/groups/")
		if err != nil {
			fmt.Println("Error saving image:", err)
			response := map[string]string{"error": err.Error()}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		newpath := strings.Split(imagePath, "/public")
		imagePath = newpath[1]
	} else {
		imagePath = "/inconnu/group.jpeg"
	}

	var coverPath string
	cover, header, err := r.FormFile("groupCover")
	if err != nil && err.Error() != "http: no such file" {
		fmt.Println("Error retrieving cover:", err)
		response := map[string]string{"error": "Failed to retrieve cover"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	} else if cover != nil {
		coverPath, err = SaveImage(cover, header, "../frontend/public/covers/")
		if err != nil {
			fmt.Println("Error saving cover:", err)
			response := map[string]string{"error": err.Error()}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		newpath := strings.Split(coverPath, "/public")
		coverPath = newpath[1]
	} else {
		coverPath = "/inconnu/cover.jpg"
	}
	id_group, err := database.CreateGroup(user.ID, group.Name, group.Description, imagePath, coverPath, group.Privacy)
	if err != nil && strings.Contains(err.Error(), "UNIQUE constraint") {
		fmt.Println("Group name already exists")
		response := map[string]string{"error": "Group name already exists"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	} else if err != nil {
		fmt.Println("Failed to create group:", err)
		response := map[string]string{"error": "Failed to create group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := database.JoinGroup(user.ID, id_group); err != nil {
		fmt.Println("Failed to add user to group:", err)
		response := map[string]string{"error": "Failed to add user to group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	newGroup := structs.Group{
		ID:          id_group,
		Admin:       user.Username,
		Name:        html.EscapeString(group.Name),
		Description: html.EscapeString(group.Description),
		CreatedAt:   time.Now().Format("2006-01-02 15:04"),
		Image:       imagePath,
		Cover:       coverPath,
		Privacy:     group.Privacy,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newGroup)
}

func AddMembers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodGet {
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

	if r.Method == http.MethodGet {
		group_id, err := strconv.ParseInt(r.URL.Query().Get("group_id"), 10, 64)
		if err != nil {
			fmt.Println("Invalid group ID", err)
			response := map[string]string{"error": "Invalid group ID"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		_, err = database.GetGroupById(group_id)
		if err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Failed to retrieve group"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		users, err := database.GetMembers(user.ID, group_id)
		if err != nil {
			log.Printf("Error retrieving users: %v", err)
			response := map[string]string{"error": "Failed to retrieve users"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	} else {
		type IDS struct {
			UserID  int64 `json:"user_id"`
			GroupID int64 `json:"group_id"`
		}

		var ids IDS
		err := json.NewDecoder(r.Body).Decode(&ids)
		if err != nil {
			fmt.Println("Failed to decode request body", err)
			response := map[string]string{"error": "Failed to decode request body"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		_, err = database.GetGroupById(ids.GroupID)
		if err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Failed to retrieve group"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		if _, err = database.GetUserById(ids.UserID); err != nil {
			fmt.Println("Invalid user", err)
			response := map[string]string{"error": "Invalid user"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		if isMember, err := database.IsMemberGroup(ids.UserID, ids.GroupID); err != nil || isMember {
			fmt.Println("User is already a member of the group", err)
			response := map[string]string{"error": "User is already a member of the group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		if err = database.CreateInvitation(user.ID, ids.UserID, ids.GroupID); err != nil {
			fmt.Println("Failed to send invitation to this user", err)
			response := map[string]string{"error": "Failed to send invitation to this user"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}
}

func GetGroupsHandler(w http.ResponseWriter, r *http.Request) {
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

	Type := r.URL.Query().Get("type")
	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Error parsing offset:", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var groups []structs.Group

	if Type == "suggested" {
		groups, err = database.GetSuggestedGroups(user.ID, offset)
	} else if Type == "pending" {
		groups, err = database.GetPendingGroups(user.ID, offset)
	} else if Type == "joined" {
		groups, err = database.GetGroups(*user, offset)
	} else {
		fmt.Println("Invalid type groups")
		response := map[string]string{"error": "Invalid type groups"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
	}

	if err != nil {
		fmt.Println("Failed to retrieve groups:", err)
		response := map[string]string{"error": "Failed to retrieve groups"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

func GroupHandler(w http.ResponseWriter, r *http.Request) {
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

	group_id, err := strconv.ParseInt(r.URL.Query().Get("group_id"), 10, 64)
	if err != nil {
		fmt.Println("Invalid group ID", err)
		response := map[string]string{"error": "Invalid group ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	group, err := database.GetGroupById(group_id)
	if err != nil {
		fmt.Println("Failed to retrieve group", err)
		response := map[string]string{"error": "Failed to retrieve group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	member, err := database.IsMemberGroup(user.ID, group_id)
	if err != nil {
		fmt.Println("Failed to check if user is a member", err)
		response := map[string]string{"error": "Failed to check if user is a member"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if group.Admin == user.Username {
		group.Role = "admin"
	} else if member {
		group.Role = "member"
	} else {
		group.Role = "guest"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(group)
}

func GroupDetailsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrive user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	group_id, err := strconv.ParseInt(r.URL.Query().Get("group_id"), 10, 64)
	if err != nil {
		fmt.Println("Invalid group ID", err)
		response := map[string]string{"error": "Invalid group ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	group, err := database.GetGroupById(group_id)
	if err != nil {
		fmt.Println("Failed to retrieve group", err)
		response := map[string]string{"error": "Failed to retrieve group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	member, err := database.IsMemberGroup(user.ID, group_id)
	if err != nil {
		fmt.Println("Failed to check if user is a member", err)
		response := map[string]string{"error": "Failed to check if user is a member"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	Type := r.URL.Query().Get("type")
	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Invalid offset", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if Type == "members" {
		if member || group.Privacy == "public" {
			members, err := database.GetGroupMembers(user.ID, group_id, offset)
			if err != nil {
				fmt.Println("Failed to retrieve members", err)
				response := map[string]string{"error": "Failed to retrieve members"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(members)
		} else {
			fmt.Println("You are not a member of this group")
			response := map[string]string{"error": "You are not a member of this group"}
			json.NewEncoder(w).Encode(response)
		}
		return
	} else if Type == "invitations" {
		if group.Admin == user.Username {
			invitations, err := database.GetInvitationsGroup(group_id, offset)
			if err != nil {
				fmt.Println("Failed to retrieve invitations", err)
				response := map[string]string{"error": "Failed to retrieve invitations"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(invitations)
		} else {
			fmt.Println("You are not the admin of this group")
			response := map[string]string{"error": "You are not the admin of this group"}
			json.NewEncoder(w).Encode(response)
		}
		return
	} else if Type == "posts" {
		if member || group.Privacy == "public" {
			posts, err := database.GetPostsGroup(group_id, user.ID, offset, group.Privacy)
			if err != nil {
				fmt.Println("Failed to retrieve posts", err)
				response := map[string]string{"error": "Failed to retrieve posts"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}

			for i := 0; i < len(posts); i++ {
				posts[i].TotalSaves, err = database.CountSaves(posts[i].ID, posts[i].GroupID)
				if err != nil {
					fmt.Println("Failed to count saves", err)
					response := map[string]string{"error": "Failed to count saves"}
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(response)
					return
				}
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(posts)
		} else {
			fmt.Println("You are not a member of this group")
			response := map[string]string{"error": "You are not a member of this group"}
			json.NewEncoder(w).Encode(response)
		}
		return
	} else if Type == "events" {
		if member {
			events, err := database.GetEventGroup(group_id, offset)
			if err != nil {
				fmt.Println("Failed to retrieve events", err)
				response := map[string]string{"error": "Failed to retrieve events"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(events)
		} else {
			fmt.Println("You are not a member of this group")
			response := map[string]string{"error": "You are not a member of this group"}
			json.NewEncoder(w).Encode(response)
		}
		return
	} else {
		fmt.Println("Invalid type")
		response := map[string]string{"error": "Invalid type"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}
}

func ValidateGroup(title, content, privacy string) (map[string]string, bool) {
	errors := make(map[string]string)
	const maxTitle = 20
	const maxContent = 300

	if title == "" {
		errors["title"] = "Title is required"
	} else if len(title) > maxTitle {
		errors["title"] = "Title must be less than " + strconv.Itoa(maxTitle) + " characters"
	}

	if content == "" {
		errors["content"] = "Content is required"
	} else if len(content) > maxContent {
		errors["content"] = "Content must be less than " + strconv.Itoa(maxContent) + " characters"
	}

	if privacy == "" {
		errors["privacy"] = "Privacy is required"
	} else if privacy != "public" && privacy != "private" {
		errors["privacy"] = "Privacy must be public or private"
	}

	if len(errors) > 0 {
		return errors, false
	}

	return nil, true
}
