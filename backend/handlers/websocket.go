package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	structs "social-network/data"
	"social-network/database"

	"github.com/gorilla/websocket"
)

var (
	Clients  = structs.Clients
	Mutex    sync.Mutex
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		response := map[string]string{"error": "Failed to upgrade connection"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println(err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	Mutex.Lock()
	Clients[user.ID] = append(Clients[user.ID], conn)
	Mutex.Unlock()

	NotifyUsers(user.ID, "online")
	ListenForMessages(conn, user.ID, w, r)
}

func ListenForMessages(conn *websocket.Conn, user_id int64, w http.ResponseWriter, r *http.Request) {
	defer func() {
		RemoveClient(conn, user_id)
		NotifyUsers(user_id, "offline")
		conn.Close()
	}()

	user, err := database.GetProfileInfo(user_id, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	for {
		var message structs.Message
		err = conn.ReadJSON(&message)
		if err != nil {
			fmt.Println("Error reading JSON:", err)
			break
		}

		msgType := ""
		if message.Type == "message" {
			msgType = "message"
		} else if message.Type == "typing" {
			msgType = "typing"
		}

		if !LastTime(w, r, "messages") {
			return
		}

		var users_ids []int64
		if message.GroupID != 0 {
			if _, err := database.GetGroupById(message.GroupID); err != nil {
				fmt.Println(err)
				return
			}
			if member, err := database.IsMemberGroup(user_id, message.GroupID); err != nil || !member {
				fmt.Println(err)
				return
			}
			users_ids, err = database.GetAllMembers(message.GroupID, user_id)
			if err != nil {
				fmt.Println(err)
				return
			}

			for _, id := range users_ids {
				if _, err := database.GetUserById(id); err != nil {
					fmt.Println("Error getting user by ID:", err)
					return
				}
				group, err := database.GetGroupById(message.GroupID)
				is_member, err := database.IsMemberGroup(id, message.GroupID)
				if err != nil {
					fmt.Println("Error checking group membership:", err)
					return
				}
				if !is_member {
					fmt.Println("User is not a member of the group")
					return
				}
				if err = database.SendMessage(user_id, id, message.GroupID, message.Content, ""); err != nil && user_id != id {
					fmt.Println("Error sending message:", err)
					return
				}

				Mutex.Lock()
				SendWsMessage(id, map[string]interface{}{"type": msgType, "name": group.Name, "user_id": user.ID, "username": user.Username, "avatar": user.Avatar, "content": message.Content, "current_user": id, "created_at": "Just now"})
				Mutex.Unlock()
			}
		} else {
			usr, err := database.GetUserById(message.UserID)
			if err != nil {
				fmt.Println("Error getting user by ID:", err)
				return
			}
			if is_followed, err := database.IsFollowed(user_id, message.UserID); err != nil || !is_followed && usr.Privacy == "private" {
				fmt.Println("User is not followed or error checking follow status:", err)
				return
			}
			if err = database.SendMessage(user_id, message.UserID, message.GroupID, message.Content, ""); err != nil {
				fmt.Println("Error sending message:", err)
				return
			}

			Mutex.Lock()
			SendWsMessage(user_id, map[string]interface{}{"type": msgType, "user_id": user.ID, "username": user.Username, "avatar": user.Avatar, "content": message.Content, "current_user": user_id, "created_at": "Just now"})
			SendWsMessage(message.UserID, map[string]interface{}{"type": msgType, "user_id": user.ID, "username": user.Username, "avatar": user.Avatar, "content": message.Content, "current_user": message.UserID, "created_at": "Just now"})
			Mutex.Unlock()
		}
	}
}

func NotifyUsers(user_id int64, statu string) {
	connections, err := database.GetConnections(user_id, 0)
	if err != nil {
		fmt.Println(err)
		return
	}

	for i := range connections {
		if connections[i].ID == user_id {
			continue
		}
		Mutex.Lock()
		if _, ok := Clients[connections[i].ID]; ok {
			if statu == "online" {
				SendWsMessage(connections[i].ID, map[string]interface{}{"type": "new_connection", "user_id": user_id})
			} else if statu == "offline" {
				SendWsMessage(connections[i].ID, map[string]interface{}{"type": "disconnection", "user_id": user_id})
			}
		}
		Mutex.Unlock()
	}
}

func SendWsMessage(user_id int64, message map[string]interface{}) {
	if clients, ok := Clients[user_id]; ok {
		for _, client := range clients {
			err := client.WriteJSON(message)
			if err != nil {
				fmt.Println("Error sending message:", err)
				return
			}
		}
	}
}

func RemoveClient(conn *websocket.Conn, user_id int64) {
	Mutex.Lock()
	defer Mutex.Unlock()
	if clients, ok := Clients[user_id]; ok {
		for i, client := range clients {
			if client == conn {
				Clients[user_id] = append(clients[:i], clients[i+1:]...)
				break
			}
		}
		if len(Clients[user_id]) == 0 {
			delete(Clients, user_id)
		}
	}
}
