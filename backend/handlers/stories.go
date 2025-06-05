package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	structs "social-network/data"
	"social-network/database"
)

func CreateStoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "stories") {
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

	var imagePath string
	image, header, err := r.FormFile("storyImage")
	if err != nil && err.Error() != "http: no such file" {
		fmt.Println("Failed to retrieve image", err)
		response := map[string]string{"error": "Failed to retrieve image"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if image != nil {
		imagePath, err = SaveImage(image, header, "../frontend/public/stories/")
		if err != nil {
			fmt.Println("Failed to save image", err)
			response := map[string]string{"error": err.Error()}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		newpath := strings.Split(imagePath, "/public")
		imagePath = newpath[1]
	} else {
		fmt.Println("No image provided")
		response := map[string]string{"error": "No image provided"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	story_id, err := database.CreateStory(imagePath, user.ID)
	if err != nil {
		fmt.Println("Failed to create story", err)
		response := map[string]string{"error": "Failed to create story"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	followers, err := database.GetAllFollowers(user.ID)
	if err != nil {
		fmt.Println("Failed to retrieve followers", err)
		response := map[string]string{"error": "Failed to retrieve followers"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	followers = append(followers, user.ID)

	if err := database.StoryStatus(story_id, followers); err != nil {
		fmt.Println("Failed to update story status", err)
		response := map[string]string{"error": "Failed to update story status"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	stories := []structs.Story{}
	stories = append(stories, structs.Story{
		ID:        story_id,
		Image:     imagePath,
		IsRead:    false,
		CreatedAt: time.Now(),
	})

	data := structs.Stories{}
	data.Stories = stories
	data.User = *user

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func SeenStory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "stories") {
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

	var id_story int64
	err = json.NewDecoder(r.Body).Decode(&id_story)
	if err != nil {
		fmt.Println("Failed to decode request body", err)
		response := map[string]string{"error": "Failed to decode request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := database.SeenStory(id_story, user.ID); err != nil {
		fmt.Println("Failed to seen story", err)
		response := map[string]string{"error": "Failed to seen story"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Story seen"})
}
