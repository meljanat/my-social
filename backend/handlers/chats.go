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

	chats, err := database.GetGroupConversation(group_id, user.ID, offset)
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

func ReadMessagesHandler(w http.ResponseWriter, r *http.Request) {
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

	var request struct {
		UserID  int64 `json:"user_id"`
		GroupID int64 `json:"group_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		fmt.Println("Invalid request body", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if request.UserID == 0 && request.GroupID == 0 {
		fmt.Println("Invalid message ID")
		response := map[string]string{"error": "Invalid message ID"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	err = database.ReadMessages(request.UserID, user.ID, request.GroupID)
	if err != nil {
		fmt.Println("Failed to mark messages as read", err)
		response := map[string]string{"error": "Failed to mark messages as read"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	SendWsMessage(user.ID, map[string]interface{}{"type": "read_messages"})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode("success")
}
