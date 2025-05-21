package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	structs "social-network/data"
	"social-network/database"
	"strconv"
)

func FollowHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
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

	var user_id int64
	err = json.NewDecoder(r.Body).Decode(&user_id)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if user_id == user.ID {
		fmt.Println("User cannot follow themselves")
		response := map[string]string{"error": "User cannot follow themselves"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	userToFollowing, err := database.GetUserById(user_id)
	if err != nil {
		fmt.Println("Failed to retrieve follower", err)
		response := map[string]string{"error": "Failed to retrieve follower"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	isFollowed, err := database.IsFollowed(user.ID, user_id)
	if err != nil {
		fmt.Println("Failed to check if user is followed", err)
		response := map[string]string{"error": "Failed to check if user is followed"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	invitation, err := database.CheckInvitation(user.ID, user_id)
	if err != nil {
		fmt.Println("Failed to retrieve invitation", err)
		response := map[string]string{"error": "Failed to retrieve invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !isFollowed {
		if userToFollowing.Privacy == "public" {
			if err := database.AddFollower(user.ID, user_id); err != nil {
				fmt.Println("Failed to follow user", err)
				response := map[string]string{"error": "Failed to follow user"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}

			if err := database.CreateNotification(user.ID, user_id, 0, 0, 0, "follow"); err != nil {
				fmt.Println("Failed to create notification", err)
				response := map[string]string{"error": "Failed to create notification"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode("unfollow")
		} else if !invitation {
			if err := database.CreateInvitation(user.ID, user_id); err != nil {
				fmt.Println("Failed to send invitation", err)
				response := map[string]string{"error": "Failed to send invitation"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}

			if err := database.CreateNotification(user.ID, user_id, 0, 0, 0, "invitation"); err != nil {
				fmt.Println("Failed to create notification", err)
				response := map[string]string{"error": "Failed to create notification"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode("cancel")
		} else {
			if err := database.DeleteInvitation(user.ID, user_id); err != nil {
				fmt.Println("Failed to delete invitation", err)
				response := map[string]string{"error": "Failed to delete invitation"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}

			if err := database.DeleteNotification(user.ID, user_id, 0, 0, 0, "invitation"); err != nil {
				fmt.Println("Failed to create notification", err)
				response := map[string]string{"error": "Failed to delete notification"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode("follow")
		}
		return
	}

	if err := database.RemoveFollower(user.ID, user_id); err != nil {
		fmt.Println("Failed to unfollow user", err)
		response := map[string]string{"error": "Failed to unfollow user"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := database.DeleteNotification(user.ID, user_id, 0, 0, 0, "follow"); err != nil {
		fmt.Println("Failed to create notification", err)
		response := map[string]string{"error": "Failed to delete notification"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode("follow")
}

func FollowersHandler(w http.ResponseWriter, r *http.Request) {
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

	user_id, err := strconv.ParseInt(r.URL.Query().Get("user_id"), 10, 64)
	if err != nil {
		fmt.Println("Invalid user ID", err)
		response := map[string]string{"error": "Invalid user ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Invalid offset", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	followed, err := database.IsFollowed(user.ID, user_id)
	if err != nil {
		fmt.Println("Failed to check if user is followed", err)
		response := map[string]string{"error": "Failed to retrieve followings"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	info, err := database.GetProfileInfo(user_id)
	if err != nil {
		fmt.Println("Failed to retrieve profile", err)
		response := map[string]string{"error": "Failed to retrieve profile"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	var followers []structs.User
	if followed || info.Privacy == "public" || user_id == user.ID {
		followers, err = database.GetFollowers(user.ID, offset)
		if err != nil {
			fmt.Println("Failed to retrieve followers", err)
			response := map[string]string{"error": "Failed to retrieve followers"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(followers)
}

func FollowingHandler(w http.ResponseWriter, r *http.Request) {
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

	user_id, err := strconv.ParseInt(r.URL.Query().Get("user_id"), 10, 64)
	if err != nil {
		fmt.Println("Invalid user ID", err)
		response := map[string]string{"error": "Invalid user ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Invalid offset", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	info, err := database.GetProfileInfo(user_id)
	if err != nil {
		fmt.Println("Failed to retrieve profile", err)
		response := map[string]string{"error": "Failed to retrieve profile"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	followed, err := database.IsFollowed(user.ID, user_id)
	if err != nil {
		fmt.Println("Failed to check if user is followed", err)
		response := map[string]string{"error": "Failed to retrieve followings"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	var following []structs.User
	if followed || info.Privacy == "public" || user_id == user.ID {
		following, err = database.GetFollowing(user.ID, offset)
		if err != nil {
			fmt.Println("Failed to retrieve following", err)
			response := map[string]string{"error": "Failed to retrieve following"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(following)
}

func SuggestedUsersHandler(w http.ResponseWriter, r *http.Request) {
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
		fmt.Println("Invalid offset", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var users []structs.User

	if Type == "suggested" {
		users, err = database.GetSuggestedUsers(user.ID, offset)
	} else if Type == "pending" {
		users, err = database.GetPendingUsers(user.ID, offset)
	} else {
		fmt.Println("Invalid type", err)
		response := map[string]string{"error": "Invalid type"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err != nil {
		fmt.Println("Failed to retrieve users", err)
		response := map[string]string{"error": "Failed to retrieve suggested users"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
