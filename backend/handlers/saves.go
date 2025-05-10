package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	structs "social-network/data"
	"social-network/database"
)

func SaveHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed")
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user")
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	var post structs.Post
	err = json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		fmt.Println("Invalid request body")
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var group structs.Group
	if post.GroupID != 0 {
		group, err = database.GetGroupById(int64(post.GroupID))
		if err != nil {
			fmt.Println("Failed to retrieve group")
			response := map[string]string{"error": "Failed to retrieve groups"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	post, err = database.GetPost(user.ID, post.ID, post.GroupID)
	if err != nil {
		fmt.Println("Failed to retrieve post")
		response := map[string]string{"error": "Failed to retrieve post"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if post.GroupID != 0 {
		if group.Privacy == "private" {
			if member, err := database.IsMemberGroup(user.ID, post.GroupID); err != nil || !member {
				fmt.Println("Failed to check if user is a member")
				response := map[string]string{"error": "Failed to check if user is a member"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
		}
	} else if post.Privacy == "private" || post.Privacy == "almost_private" && post.Author != user.Username {
		if followed, err := database.IsFollowed(user.ID, post.UserID); err != nil || !followed {
			fmt.Println("You are not authorized to view this post")
			response := map[string]string{"error": "You are not authorized to view this post"}
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(response)
			return
		}
		if post.Privacy == "almost_private" {
			if authorized, err := database.IsAuthorized(user.ID, post.ID); err != nil || !authorized {
				response := map[string]string{"error": "You are not authorized to view this post"}
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(response)
				return
			}
		}
	}

	if database.SavePost(user.ID, post.ID, post.GroupID) != nil {
		fmt.Println("Failed to save post")
		response := map[string]string{"error": "Failed to save post"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func GetSavedPostsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		fmt.Println("Method not allowed")
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user")
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	Type := r.URL.Query().Get("type")
	var posts []structs.Post
	if Type == "post" {
		posts, err = database.GetSavedPosts(user.ID)
	} else if Type == "group" {
		posts, err = database.GetSavedGroupPosts(user.ID)
	} else {
		fmt.Println("Invalid type parameter")
		response := map[string]string{"error": "Invalid type parameter"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err != nil {
		fmt.Println("Failed to retrieve saved posts")
		response := map[string]string{"error": "Failed to retrieve saved posts"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
