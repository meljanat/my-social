package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"social-network/database"
)

func GetConnectionsHandler(w http.ResponseWriter, r *http.Request) {
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

	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Invalid offset")
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	connections, err := database.GetConnections(user.ID, offset)
	if err != nil {
		fmt.Println("Failed to retrieve connections")
		response := map[string]string{"error": "Failed to retrieve connections"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(connections)
}

func ChatHandler(w http.ResponseWriter, r *http.Request) {
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

	receiver_id, err := strconv.ParseInt(r.URL.Query().Get("id"), 10, 64)
	if err != nil {
		fmt.Println("Invalid receiver ID", err)
		response := map[string]string{"error": "Invalid receiver ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Invalid offset", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	_, err = database.CheckUser(receiver_id)
	if err != nil {
		fmt.Println("Failed to retrieve recipient", err)
		response := map[string]string{"error": "Failed to retrieve recipient"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	chats, err := database.GetConversation(user.ID, receiver_id, offset)
	if err != nil {
		fmt.Println("Failed to retrieve chats", err)
		response := map[string]string{"error": "Failed to retrieve chats"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chats)
}

func ChatGroupHandler(w http.ResponseWriter, r *http.Request) {
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

	group_id, err := strconv.ParseInt(r.URL.Query().Get("group_id"), 10, 64)
	if err != nil {
		fmt.Println("Invalid group ID", err)
		response := map[string]string{"error": "Invalid group ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Invalid offset", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	_, err = database.GetGroupById(group_id)
	if err != nil {
		fmt.Println("Failed to retrieve group", err)
		response := map[string]string{"error": "Failed to retrieve groups"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	member, err := database.IsMemberGroup(user.ID, group_id)
	if err != nil {
		fmt.Println("Failed to check if user is a member", err)
		response := map[string]string{"error": "Failed to check if user is a member"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	} else if !member {
		fmt.Println("User is not a member of the group", err)
		response := map[string]string{"error": "User is not a member of the group"}
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(response)
		return
	}

	chats, err := database.GetGroupConversation(group_id, offset)
	if err != nil {
		fmt.Println("Failed to retrieve chats", err)
		response := map[string]string{"error": "Failed to retrieve chats"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chats)
}

// func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodPost {
// 		fmt.Println("Method not allowed", r.Method)
// 		response := map[string]string{"error": "Method not allowed"}
// 		w.WriteHeader(http.StatusMethodNotAllowed)
// 		json.NewEncoder(w).Encode(response)
// 		return
// 	}

// 	user, err := GetUserFromSession(r)
// 	if err != nil || user == nil {
// 		fmt.Println("Failed to retrieve user", err)
// 		response := map[string]string{"error": "Failed to retrieve user"}
// 		w.WriteHeader(http.StatusUnauthorized)
// 		json.NewEncoder(w).Encode(response)
// 		return
// 	}

// 	var message structs.Message
// 	message.UserID, err = strconv.ParseInt(r.FormValue("receiver_id"), 10, 64)
// 	if err != nil {
// 		fmt.Println("Invalid receiver ID", err)
// 		response := map[string]string{"error": "Invalid receiver ID"}
// 		w.WriteHeader(http.StatusBadRequest)
// 		json.NewEncoder(w).Encode(response)
// 		return
// 	}
// 	message.Content = r.FormValue("content")

// 	var imagePath string
// 	image, header, err := r.FormFile("chat_image")
// 	if err != nil && err.Error() != "http: no such file" {
// 		fmt.Println("Failed to retrieve image", err)
// 		response := map[string]string{"error": "Failed to retrieve image"}
// 		w.WriteHeader(http.StatusInternalServerError)
// 		json.NewEncoder(w).Encode(response)
// 		return
// 	}

// 	if image != nil {
// 		imagePath, err = SaveImage(image, header, "../frontend/public/chat/")
// 		if err != nil {
// 			fmt.Println("Failed to save image", err)
// 			response := map[string]string{"error": err.Error()}
// 			w.WriteHeader(http.StatusInternalServerError)
// 			json.NewEncoder(w).Encode(response)
// 			return
// 		}
// 		newpath := strings.Split(imagePath, "/public")
// 		imagePath = newpath[1]
// 	}

// 	if err := database.SendMessage(user.ID, message.UserID, 0, message.Content, imagePath); err != nil {
// 		fmt.Println("Failed to send message", err)
// 		response := map[string]string{"error": "Failed to send message"}
// 		w.WriteHeader(http.StatusInternalServerError)
// 		json.NewEncoder(w).Encode(response)
// 		return
// 	}

// 	newMessage := structs.Message{
// 		Username:  user.Username,
// 		Avatar:    message.Avatar,
// 		Content:   html.EscapeString(message.Content),
// 		Image:     imagePath,
// 		CreatedAt: "Just now",
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(newMessage)
// }
