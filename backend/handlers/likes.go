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
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "post_likes") {
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user", err)
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

	post, err = database.GetPost(user.ID, post.ID)
	if err != nil {
		fmt.Println("Error retrieving post:", err)
		response := map[string]string{"error": "Post not found"}
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(response)
		return
	}

	type_notification := "like"
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
	if post.UserID != user.ID {
		if post.IsLiked {
			if err = database.CreateNotification(user.ID, post.UserID, post.ID, post.GroupID, 0, type_notification); err != nil {
				fmt.Println("Error creating notification:", err)
				response := map[string]string{"error": "Error creating notification"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
		} else if err = database.DeleteNotification(user.ID, post.UserID, post.ID, post.GroupID, 0, type_notification); err != nil {
			fmt.Println("Error deleting notification:", err)
			response := map[string]string{"error": "Error deleting notification"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}
	if post.IsLiked {
		post.WhoLiked = append(post.WhoLiked, *user)
	} else {
		who_liked := make([]structs.User, 0)
		for _, u := range post.WhoLiked {
			if u.ID != user.ID {
				who_liked = append(who_liked, u)
			}
		}
		post.WhoLiked = who_liked
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}
