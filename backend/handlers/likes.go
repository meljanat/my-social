package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	structs "social-network/data"
	"social-network/database"
)

func LikeHandler(w http.ResponseWriter, r *http.Request) {
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
		response := map[string]string{"error": "User not logged in"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	var post structs.Post
	err = json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		fmt.Println("Error decoding request body:", err)
		response := map[string]string{"error": "Invalid request"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	post, err = database.GetPost(user.ID, post.ID, post.GroupID)
	if err != nil {
		fmt.Println("Error retrieving post:", err)
		response := map[string]string{"error": "Post not found"}
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(response)
		return
	}

	if post.GroupID == 0 {
		count, err := database.LikePost(user.ID, post)
		if err != nil {
			fmt.Println("Error liking post:", err)
			response := map[string]string{"error": "Error liking post"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		post.TotalLikes = count
		post.IsLiked = !post.IsLiked
	} else {
		count, err := database.LikeGroupPost(user.ID, post.GroupID, post)
		if err != nil {
			fmt.Println("Error liking post:", err)
			response := map[string]string{"error": "Error liking post"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		post.TotalLikes = count
		post.IsLiked = !post.IsLiked
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}
