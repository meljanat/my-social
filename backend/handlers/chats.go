package handlers

import (
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"strconv"
	"strings"

	structs "social-network/data"
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

	connections, err := database.GetConnections(user.ID)
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

	receiver_id, err := strconv.ParseInt(r.URL.Query().Get("id"), 10, 64)
	if err != nil {
		fmt.Println("Invalid receiver ID")
		response := map[string]string{"error": "Invalid receiver ID"}
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

	var chats []structs.Message

	if receiver_id != 0 {
		_, err = database.CheckUser(receiver_id)
		if err != nil {
			fmt.Println("Failed to retrieve recipient")
			response := map[string]string{"error": "Failed to retrieve recipient"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		chats, err = database.GetConversation(user.ID, receiver_id)
		if err != nil {
			fmt.Println("Failed to retrieve chats", err)
			response := map[string]string{"error": "Failed to retrieve chats"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
		
		err = database.ReadMessages(user.ID, receiver_id, 0)
		if err != nil {
			fmt.Println("Failed to read chat", err)
			response := map[string]string{"error": "Failed to read chat"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	} else {
		_, err = database.GetGroupById(group_id)
		if err != nil {
			fmt.Println("Failed to retrieve group")
			response := map[string]string{"error": "Failed to retrieve groups"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		member, err := database.IsMemberGroup(user.ID, group_id)
		if err != nil {
			fmt.Println("Failed to check if user is a member")
			response := map[string]string{"error": "Failed to check if user is a member"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		} else if !member {
			fmt.Println("User is not a member of the group")
			response := map[string]string{"error": "User is not a member of the group"}
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(response)
			return
		}

		chats, err = database.GetGroupConversation(group_id)
		if err != nil {
			fmt.Println("Failed to retrieve group chats")
			response := map[string]string{"error": "Failed to retrieve group chats"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chats)
}

func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
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

	err = r.ParseForm()
	if err != nil {
		fmt.Println("Failed to parse form")
		response := map[string]string{"error": "Failed to parse form"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	fmt.Println(r.Body)

	var message structs.Message
	err = json.NewDecoder(r.Body).Decode(&message)
	message.UserID, err = strconv.ParseInt(r.FormValue("receiver_id"), 10, 64)
	if err != nil {
		fmt.Println("error parsing receiver_id:", err)
		response := map[string]string{"error": "Invalid receiver ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}
	message.Content = r.FormValue("content")

	fmt.Println("message: ", message)

	var imagePath string
	image, header, err := r.FormFile("chat_image")
	if err != nil && err.Error() != "http: no such file" {
		fmt.Println("Failed to retrieve image")
		response := map[string]string{"error": "Failed to retrieve image"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if image != nil {
		imagePath, err = SaveImage(image, header, "../frontend/public/chat/")
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

	if database.SendMessage(user.ID, message.UserID, 0, message.Content, imagePath) != nil {
		fmt.Println("Failed to send message")
		response := map[string]string{"error": "Failed to send message"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	newMessage := structs.Message{
		Username:  user.Username,
		Avatar:    message.Avatar,
		Content:   html.EscapeString(message.Content),
		Image:     imagePath,
		CreatedAt: "Just now",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newMessage)
}
