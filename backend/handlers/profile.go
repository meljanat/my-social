package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	structs "social-network/data"
	"social-network/database"
	"strconv"
)

func ProfileHandler(w http.ResponseWriter, r *http.Request) {
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
		fmt.Println("Error parsing user ID:", err)
		response := map[string]string{"error": "Invalid user ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return

	}

	info, err := database.GetProfileInfo(user_id, nil)
	if err != nil {
		fmt.Println("Error retrieving profile:", err)
		response := map[string]string{"error": "Failed to retrieve profile"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if user_id == user.ID {
		info.Role = "owner"
	} else {
		info.Role = "user"
	}

	info.IsFollowing, err = database.IsFollowed(user.ID, user_id)
	if err != nil {
		fmt.Println("Error checking follow status:", err)
		response := map[string]string{"error": "Failed to retrieve followings"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	info.IsFollower, err = database.IsFollowed(user_id, user.ID)
	if err != nil {
		fmt.Println("Error checking follow status:", err)
		response := map[string]string{"error": "Failed to retrieve followers"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	info.IsPending, err = database.CheckInvitation(user_id, user.ID, 0)
	if err != nil {
		fmt.Println("Error checking invitation:", err)
		response := map[string]string{"error": "Failed to retrieve invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}

func ProfilePostsHandler(w http.ResponseWriter, r *http.Request) {
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
		fmt.Println("Error parsing user ID:", err)
		response := map[string]string{"error": "Invalid user ID"}
		w.WriteHeader(http.StatusBadRequest)
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

	info, err := database.GetProfileInfo(user_id, nil)
	if err != nil {
		fmt.Println("Error retrieving profile:", err)
		response := map[string]string{"error": "Failed to retrieve profile"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	followed, err := database.IsFollowed(user.ID, user_id)
	if err != nil {
		fmt.Println("Error checking follow status:", err)
		response := map[string]string{"error": "Failed to retrieve followings"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	var posts []structs.Post
	if followed || info.Privacy == "public" || user_id == user.ID {
		posts, err = database.GetPostsByUser(user_id, user.ID, offset, followed)
		if err != nil {
			fmt.Println("Error retrieving posts:", err)
			response := map[string]string{"error": "Failed to retrieve posts"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if user_id == user.ID {
		info.Role = "owner"
	} else {
		info.Role = "user"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
