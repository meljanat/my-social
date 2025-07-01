package handlers

import (
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	structs "social-network/data"
	"social-network/database"
	"strconv"
	"strings"
)

func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
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

	var comment structs.Comment
	comment.Content = r.FormValue("content")
	comment.PostID, err = strconv.ParseInt(r.FormValue("post_id"), 10, 64)
	if err != nil {
		fmt.Println("Error parsing post ID:", err)
		response := map[string]string{"error": "Invalid post ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var imagePath string
	image, header, err := r.FormFile("commentImage")
	if err != nil && err.Error() != "http: no such file" {
		fmt.Println("Error retrieving image:", err)
		response := map[string]string{"error": "Failed to retrieve image"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if image != nil {
		imagePath, err = SaveImage(image, header, "../frontend/public/comments/")
		if err != nil {
			fmt.Println("Error saving image:", err)
			response := map[string]string{"error": err.Error()}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		newpath := strings.Split(imagePath, "/public")
		imagePath = newpath[1]
	}

	if comment.Content == "" || len(comment.Content) > 100 {
		fmt.Println("Comment content is required and must be less than 100 characters")
		response := map[string]string{"error": "Comment content is required and must be less than 100 characters"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	post, err := database.GetPost(user.ID, comment.PostID)
	if err != nil {
		fmt.Println("Failed to retrieve post", err)
		response := map[string]string{"error": "Failed to retrieve post"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	var id int64
	var type_notification = "comment"
	id, err = database.CreateComment(comment.Content, user.ID, post, imagePath)
	if err != nil {
		fmt.Println("Failed to create comment", err)
		response := map[string]string{"error": "Failed to create comment"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if post.UserID != user.ID {
		if err := database.CreateNotification(user.ID, post.UserID, post.ID, post.GroupID, 0, type_notification); err != nil {
			fmt.Println("Failed to create notification", err)
			response := map[string]string{"error": "Failed to create notification"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	newComment := structs.Comment{
		ID:        id,
		PostID:    comment.PostID,
		Content:   html.EscapeString(comment.Content),
		UserID:    user.ID,
		Username:  user.Username,
		Avatar:    user.Avatar,
		CreatedAt: "Just Now",
		Image:     imagePath,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newComment)
}
