package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	structs "social-network/data"
	"social-network/database"
)

func SearchHandler(w http.ResponseWriter, r *http.Request) {
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

	query := strings.TrimSpace(r.URL.Query().Get("query"))
	if query == "" {
		fmt.Println("Empty search query")
		response := map[string]string{"message": "Empty search query"}
		json.NewEncoder(w).Encode(response)
		return
	}

	err = LastSearch(user.ID, query)
	if err != nil {
		fmt.Println("Failed to update last search", err)
		response := map[string]string{"error": "Failed to update last search"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	var usr bool
	var group bool
	var event bool
	var post bool
	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Invalid offset", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	Type := r.URL.Query().Get("type")
	if Type == "all" {
		usr = true
		group = true
		event = true
		post = true
	} else if Type == "users" {
		usr = true
	} else if Type == "groups" {
		group = true
	} else if Type == "events" {
		event = true
	} else if Type == "posts" {
		post = true
	} else {
		fmt.Println("Invalid search type")
		response := map[string]string{"error": "Invalid search type"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var users []structs.User
	var groups []structs.Group
	var events []structs.Event
	var posts []structs.Post

	if usr {
		users, err = database.SearchUsers(query, offset)
		if err != nil {
			fmt.Println("Error searching users:", err)
			response := map[string]string{"error": "Failed to search users"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if group {
		groups, err = database.SearchGroups(query, offset)
		if err != nil {
			fmt.Println("Error searching groups:", err)
			response := map[string]string{"error": "Failed to search groups"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if event {
		events, err = database.SearchEvents(query, offset)
		if err != nil {
			fmt.Println("Error searching events:", err)
			response := map[string]string{"error": "Failed to search events"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if post {
		posts, err = database.SearchPosts(user.ID, query, offset)
		if err != nil {
			fmt.Println("Error searching posts:", err)
			response := map[string]string{"error": "Failed to search posts"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	data := struct {
		Users  []structs.User  `json:"users"`
		Groups []structs.Group `json:"groups"`
		Events []structs.Event `json:"events"`
		Posts  []structs.Post  `json:"posts"`
	}{
		Users:  users,
		Groups: groups,
		Events: events,
		Posts:  posts,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func LastSearch(user_id int64, query string) error {
	count_search, err := database.GetCountSearchUser(user_id)
	if err != nil {
		return err
	}

	if count_search < 3 {
		return database.InsertSearch(user_id, query)
	}

	id_search, err := database.GetIDFirstSearch(user_id)
	if err != nil {
		return err
	}
	return database.UpdateFirstSearch(id_search, query)
}
