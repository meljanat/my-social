package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	structs "social-network/data"
	"social-network/database"
	"strconv"
)

func SaveHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "saves") {
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

	var post structs.Post
	err = json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		fmt.Println("Invalid request body", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var group structs.Group
	if post.GroupID != 0 {
		group, err = database.GetGroupById(int64(post.GroupID))
		if err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Failed to retrieve groups"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	post, err = database.GetPost(user.ID, post.ID)
	if err != nil {
		fmt.Println("Failed to retrieve post", err)
		response := map[string]string{"error": "Failed to retrieve post"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if post.GroupID != 0 {
		if group.Privacy == "private" {
			if member, err := database.IsMemberGroup(user.ID, post.GroupID); err != nil || !member {
				fmt.Println("Failed to check if user is a member", err)
				response := map[string]string{"error": "Failed to check if user is a member"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
		}
	} else if (post.Privacy == "private" || post.Privacy == "almost_private") && post.Author != user.Username {
		if followed, err := database.IsFollowed(user.ID, post.UserID); err != nil || !followed {
			fmt.Println("You are not authorized to view this post", err)
			response := map[string]string{"error": "You are not authorized to view this post"}
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(response)
			return
		}
		if post.Privacy == "almost_private" {
			if authorized, err := database.IsAuthorized(user.ID, post.ID); err != nil || !authorized {
				fmt.Println("You are not authorized to view this post", err)
				response := map[string]string{"error": "You are not authorized to view this post"}
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(response)
				return
			}
		}
	}

	isSaved, err := database.IsSaved(user.ID, post.ID)
	if err != nil {
		fmt.Println("Failed to check if post is saved", err)
		response := map[string]string{"error": "Failed to check if post is saved"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !isSaved {
		if err := database.SavePost(user.ID, post.ID, post.GroupID); err != nil {
			fmt.Println("Failed to save post", err)
			response := map[string]string{"error": "Failed to save post"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		if err := database.CreateNotification(user.ID, post.UserID, post.ID, post.GroupID, 0, "save"); err != nil {
			fmt.Println("Failed to create notification", err)
			response := map[string]string{"error": "Failed to create notification"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	} else {
		if err := database.UnsavePost(user.ID, post.ID, post.GroupID); err != nil {
			fmt.Println("Failed to unsave post", err)
			response := map[string]string{"error": "Failed to unsave post"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		if err := database.DeleteNotification(user.ID, post.UserID, post.ID, post.GroupID, 0, "save"); err != nil {
			fmt.Println("Failed to delete notification", err)
			response := map[string]string{"error": "Failed to delete notification"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	post.IsSaved = !isSaved
	post.TotalSaves, err = database.CountSaves(post.ID, post.GroupID)
	if err != nil {
		fmt.Println("Failed to count saves", err)
		response := map[string]string{"error": "Failed to count saves"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func GetSavedPostsHandler(w http.ResponseWriter, r *http.Request) {
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
		fmt.Println("Invalid offset parameter", err)
		response := map[string]string{"error": "Invalid offset parameter"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var posts []structs.Post
	if Type == "post" {
		posts, err = database.GetSavedPosts(user.ID, 0, offset)
	} else if Type == "group" {
		posts, err = database.GetSavedPosts(user.ID, 1, offset)
	} else {
		fmt.Println("Invalid type parameter")
		response := map[string]string{"error": "Invalid type parameter"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err != nil {
		fmt.Println("Failed to retrieve saved posts", err)
		response := map[string]string{"error": "Failed to retrieve saved posts"}
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
}
