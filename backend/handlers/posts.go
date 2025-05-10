package handlers

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	structs "social-network/data"
	"social-network/database"
	"strconv"
	"strings"
)

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user")
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	switch r.Method {
	case http.MethodGet:
		NewPostGet(w, r, user)
	case http.MethodPost:
		NewPostPost(w, r, user)
	default:
		fmt.Println("Method not allowed")
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}
}

func NewPostGet(w http.ResponseWriter, r *http.Request, user *structs.User) {
	categories, err := database.GetCategories()
	if err != nil {
		fmt.Println("Error retrieving categories:", err)
		log.Printf("Error retrieving categories: %v", err)
		response := map[string]string{"error": "Failed to retrieve categories"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	users, err := database.GetFollowers(user.ID)
	if err != nil {
		log.Printf("Error retrieving users: %v", err)
		response := map[string]string{"error": "Failed to retrieve users"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	data := struct {
		Categories []structs.Category
		Users      []structs.User
	}{
		Categories: categories,
		Users:      users,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func NewPostPost(w http.ResponseWriter, r *http.Request, user *structs.User) {
	var post structs.Post
	var err error
	post.Title = r.FormValue("title")
	post.Content = r.FormValue("content")
	post.Privacy = r.FormValue("privacy")
	post.CategoryID, err = strconv.ParseInt(r.FormValue("category"), 10, 64)
	if err != nil {
		fmt.Println("Invalid category")
		response := map[string]string{"error": "Invalid category"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	errors, valid := ValidatePost(post.Title, post.Content, post.Privacy)
	if !valid {
		fmt.Println("Validation error", errors)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":  "Validation error",
			"fields": errors,
		})
		return
	}

	var imagePath string
	image, header, err := r.FormFile("postImage")
	if err != nil && err.Error() != "http: no such file" {
		fmt.Println("Failed to retrieve image")
		response := map[string]string{"error": "Failed to retrieve image"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if image != nil {
		imagePath, err = SaveImage(image, header, "../frontend/public/images/")
		if err != nil {
			fmt.Println("Failed to save image")
			response := map[string]string{"error": err.Error()}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		newpath := strings.Split(imagePath, "/public")
		imagePath = newpath[1]
	}

	id, err := database.CreatePost(user.ID, post.CategoryID, post.Title, post.Content, imagePath, post.Privacy)
	if err != nil {
		fmt.Println("Failed to create post")
		response := map[string]string{"error": "Failed to create post"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	category, err := database.GetCategoryById(post.CategoryID)
	if err != nil {
		fmt.Println("Failed to retrieve category")
		response := map[string]string{"error": "Failed to retrieve category"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	newPost := structs.Post{
		ID:                 id,
		UserID:             user.ID,
		Author:             user.Username,
		CategoryID:         post.CategoryID,
		Category:           category.Name,
		CategoryColor:      category.Color,
		CategoryBackground: category.Background,
		Title:              html.EscapeString(post.Title),
		Content:            html.EscapeString(post.Content),
		Image:              post.Image,
		CreatedAt:          "Just Now",
		TotalLikes:         0,
		TotalComments:      0,
		Comments:           nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newPost)
}

func CreatePostGroupHandler(w http.ResponseWriter, r *http.Request) {
	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Failed to retrieve user")
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	var group_id int64
	if r.Method == http.MethodGet {
		group_id, err = strconv.ParseInt(r.URL.Query().Get("group_id"), 10, 64)
		if err != nil {
			fmt.Println("Invalid group ID")
			response := map[string]string{"error": "Invalid group ID"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	} else if r.Method == http.MethodPost {
		group_id, err = strconv.ParseInt(r.FormValue("group_id"), 10, 64)
		if err != nil {
			fmt.Println("Invalid group ID")
			response := map[string]string{"error": "Invalid group ID"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	} else {
		fmt.Println("Method not allowed")
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if _, err = database.GetGroupById(group_id); err != nil {
		fmt.Println("Failed to retrieve group")
		response := map[string]string{"error": "Failed to retrieve group"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	member, err := database.IsMemberGroup(group_id, user.ID)
	if err != nil {
		fmt.Println("Failed to check if user is a member")
		response := map[string]string{"error": "Failed to check if user is a member"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	} else if !member {
		fmt.Println("You are not a member of this group")
		response := map[string]string{"error": "You are not a member of this group"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	switch r.Method {
	case http.MethodGet:
		NewPostGroupGet(w, r)
	case http.MethodPost:
		NewPostGroupPost(w, r, user, group_id)
	}
}

func NewPostGroupGet(w http.ResponseWriter, r *http.Request) {
	categories, err := database.GetCategories()
	if err != nil {
		log.Printf("Error retrieving categories: %v", err)
		response := map[string]string{"error": "Failed to retrieve categories"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func NewPostGroupPost(w http.ResponseWriter, r *http.Request, user *structs.User, group_id int64) {
	var post structs.Post
	var err error
	post.Title = r.FormValue("title")
	post.Content = r.FormValue("content")
	post.GroupID = group_id
	post.CategoryID, err = strconv.ParseInt(r.FormValue("category"), 10, 64)
	if err != nil {
		fmt.Println("Invalid category")
		response := map[string]string{"error": "Invalid category"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}
	group, err := database.GetGroupById(post.GroupID)
	if err != nil {
		fmt.Println("Failed to retrieve group")
		response := map[string]string{"error": "Failed to retrieve groups"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	errors, valid := ValidatePost(post.Title, post.Content, group.Privacy)
	if !valid {
		fmt.Println("Validation error", errors)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":  "Validation error",
			"fields": errors,
		})
		return
	}

	var imagePath string
	image, header, err := r.FormFile("postImage")
	if err != nil && err.Error() != "http: no such file" {
		fmt.Println("Failed to retrieve image")
		response := map[string]string{"error": "Failed to retrieve image"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if image != nil {
		imagePath, err = SaveImage(image, header, "../frontend/public/images/")
		if err != nil {
			fmt.Println("Failed to save image")
			response := map[string]string{"error": err.Error()}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		newpath := strings.Split(imagePath, "/public")
		imagePath = newpath[1]
	}

	id, err := database.CreatePostGroup(user.ID, post.GroupID, post.CategoryID, post.Title, post.Content, imagePath)
	if err != nil {
		fmt.Println("Failed to create post")
		response := map[string]string{"error": "Failed to create post"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	category, err := database.GetCategoryById(post.CategoryID)
	if err != nil {
		fmt.Println("Failed to retrieve category")
		response := map[string]string{"error": "Failed to retrieve category"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	newPost := structs.Post{
		ID:                 id,
		UserID:             user.ID,
		Author:             user.Username,
		GroupName:          group.Name,
		GroupID:            group.ID,
		CategoryID:         post.CategoryID,
		Category:           category.Name,
		CategoryColor:      category.Color,
		CategoryBackground: category.Background,
		Title:              html.EscapeString(post.Title),
		Content:            html.EscapeString(post.Content),
		Image:              post.Image,
		CreatedAt:          "Just Now",
		Privacy:            group.Privacy,
		TotalLikes:         0,
		TotalComments:      0,
		Comments:           nil,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newPost)
}

func PostHandler(w http.ResponseWriter, r *http.Request) {
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

	post_id, err := strconv.ParseInt(r.URL.Query().Get("post_id"), 10, 64)
	if err != nil {
		fmt.Println("Invalid post ID")
		response := map[string]string{"error": "Invalid post ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	group_id, err := strconv.ParseInt(r.URL.Query().Get("group_id"), 10, 64)
	if err != nil {
		fmt.Println("Invalid group ID")
		response := map[string]string{"error": "Invalid group ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	post, err := database.GetPost(user.ID, post_id, group_id)
	if err != nil {
		fmt.Println("Failed to retrieve post")
		response := map[string]string{"error": "Failed to retrieve post"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if post.GroupID != 0 {
		group, err := database.GetGroupById(group_id)
		if err != nil {
			fmt.Println("Failed to retrieve group")
			response := map[string]string{"error": "Failed to retrieve groups"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		if group.Privacy == "private" {
			if member, err := database.IsMemberGroup(user.ID, post.GroupID); err != nil || !member {
				fmt.Println("Failed to check if user is member of group")
				response := map[string]string{"error": "Failed to check if user is member of group"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
		}
	} else if (post.Privacy == "private" || post.Privacy == "almost_private") && post.Author != user.Username {
		if followed, err := database.IsFollowed(user.ID, post.UserID); err != nil || !followed {
			fmt.Println("Failed to check if user is following author")
			response := map[string]string{"error": "You are not authorized to view this post"}
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(response)
			return
		}
		if post.Privacy == "almost_private" {
			if authorized, err := database.IsAuthorized(user.ID, post_id); err != nil || !authorized {
				fmt.Println("Failed to check if user is authorized")
				response := map[string]string{"error": "You are not authorized to view this post"}
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(response)
				return
			}
		}
	}

	post.Comments, err = database.GetPostComments(post_id, post.GroupID)
	if err != nil {
		fmt.Println("Failed to retrieve comments")
		response := map[string]string{"error": "Failed to retrieve comments"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func GetTopCategories(w http.ResponseWriter, r *http.Request) {
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

	categories, err := database.GetBestCategories()
	if err != nil {
		fmt.Println("Failed to retrieve categories")
		response := map[string]string{"error": "Failed to retrieve categories"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func GetPostsByCategory(w http.ResponseWriter, r *http.Request) {
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

	var category_id int64
	err = json.NewDecoder(r.Body).Decode(&category_id)
	if err != nil {
		fmt.Println("Invalid request body")
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	posts, err := database.GetPostsByCategory(category_id, user.ID)
	if err != nil {
		fmt.Println("Failed to retrieve posts")
		response := map[string]string{"error": "Failed to retrieve posts"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	var posts_category []structs.Post
	for i := range posts {
		if posts[i].GroupID != 0 {
			group, err := database.GetGroupById(posts[i].GroupID)
			if err != nil {
				fmt.Println("Failed to retrieve group")
				response := map[string]string{"error": "Failed to retrieve groups"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}

			if group.Privacy == "private" {
				if member, err := database.IsMemberGroup(user.ID, posts[i].GroupID); err != nil || !member {
					continue
				}
			}
		} else if (posts[i].Privacy == "private" || posts[i].Privacy == "almost_private") && posts[i].Author != user.Username {
			if followed, err := database.IsFollowed(user.ID, posts[i].UserID); err != nil || !followed {
				continue
			}
			if posts[i].Privacy == "almost_private" {
				if authorized, err := database.IsAuthorized(user.ID, posts[i].ID); err != nil || !authorized {
					continue
				}
			}
		}
		posts_category = append(posts_category, posts[i])
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts_category)
}

func ValidatePost(title, content, privacy string) (map[string]string, bool) {
	errors := make(map[string]string)
	const maxTitle = 100
	const maxContent = 2000

	if title == "" {
		errors["title"] = "Title is required"
	} else if len(title) > maxTitle {
		errors["title"] = "Title must be less than " + strconv.Itoa(maxTitle) + " characters"
	}

	if content == "" {
		errors["content"] = "Content is required"
	} else if len(content) > maxContent {
		errors["content"] = "Content must be less than " + strconv.Itoa(maxContent) + " characters"
	}

	if privacy == "" {
		errors["privacy"] = "Privacy is required"
	} else if privacy != "public" && privacy != "private" && privacy != "almost_private" {
		errors["privacy"] = "Privacy must be public, private, or almost_private"
	}

	if len(errors) > 0 {
		return errors, false
	}

	return nil, true
}
