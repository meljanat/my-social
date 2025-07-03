package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	structs "social-network/data"
	"social-network/database"
)

func Home(w http.ResponseWriter, r *http.Request) {
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

	offset_messages, err := strconv.ParseInt(r.URL.Query().Get("offset_messages"), 10, 64)
	if err != nil {
		fmt.Println("Error parsing offset_messages:", err)
		response := map[string]string{"error": "Invalid offset_messages"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	count_follwing, err := database.GetCountFollowing(user.ID)
	if err != nil {
		fmt.Println("Failed to retrieve count following", err)
		response := map[string]string{"error": "Failed to retrieve count following"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	following, err := database.GetFollowing(user.ID, 0, count_follwing)
	if err != nil {
		fmt.Println("Failed to retrieve followings", err)
		response := map[string]string{"error": "Failed to retrieve followings"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	user_info, err := database.GetProfileInfo(user.ID, following)
	if err != nil {
		fmt.Println("Failed to retrieve user", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	suggested_users, err := database.GetSuggestedUsers(user.ID, 0)
	if err != nil {
		fmt.Println("Failed to retrieve not following", err)
		response := map[string]string{"error": "Failed to retrieve not following"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	posts, err := database.GetPosts(user.ID, offset, following)
	if err != nil {
		fmt.Println("Failed to retrieve posts", err)
		response := map[string]string{"error": "Failed to retrieve posts"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	best_categories, err := database.GetBestCategories()
	if err != nil {
		fmt.Println("Failed to retrieve best categories", err)
		response := map[string]string{"error": "Failed to retrieve best categories"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	my_groups, err := database.GetGroups(*user, -1)
	if err != nil {
		fmt.Println("Failed to retrieve my groups", err)
		response := map[string]string{"error": "Failed to retrieve my groups"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	suggested_groups, err := database.GetSuggestedGroups(user.ID, 0)
	if err != nil {
		fmt.Println("Failed to retrieve suggested groups", err)
		response := map[string]string{"error": "Failed to retrieve suggested groups"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	connections, err := database.GetConnections(user.ID, offset_messages)
	if err != nil {
		fmt.Println("Failed to retrieve connections", err)
		response := map[string]string{"error": "Failed to retrieve connections"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	home := struct {
		User           structs.User       `json:"user"`
		Posts          []structs.Post     `json:"posts"`
		BestCategories []structs.Category `json:"best_categories"`
		MyGroups       []structs.Group    `json:"my_groups"`
		DiscoverGroups []structs.Group    `json:"discover_groups"`
		SuggestedUsers []structs.User     `json:"suggested_users"`
		Connections    []structs.User     `json:"connections"`
	}{
		User:           user_info,
		Posts:          posts,
		BestCategories: best_categories,
		MyGroups:       my_groups,
		DiscoverGroups: suggested_groups,
		SuggestedUsers: suggested_users,
		Connections:    connections,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(home)
}
