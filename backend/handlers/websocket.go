package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

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
	}

	for {
		var message structs.Message
		err = conn.ReadJSON(&message)
		if err != nil {
			fmt.Println("Error reading JSON:", err)
			break
		}
		fmt.Println("Received message:", message)

		msgType := ""
		if message.Type == "message" {
			msgType = "message"
		} else if message.Type == "typing" {
			msgType = "typing"
		}

		if !LastTime(w, r, "messages") {
			continue
		}

		var users_ids []int64
		if message.GroupID != 0 {
			group, err := database.GetGroupById(message.GroupID)
			if err != nil {
				fmt.Println(err)
				continue
			}
			if member, err := database.IsMemberGroup(user_id, message.GroupID); err != nil || !member {
				fmt.Println(err)
				continue
			}
			users_ids, err = database.GetAllMembers(message.GroupID)
			if err != nil {
				fmt.Println(err)
				continue
			}

			for _, id := range users_ids {
				if _, err := database.GetUserById(id); err != nil {
					fmt.Println("Error getting user by ID:", err)
					return
				}
				is_member, err := database.IsMemberGroup(id, message.GroupID)
				if err != nil {
					fmt.Println("Error checking group membership:", err)
					continue
				}
				if !is_member {
					fmt.Println("User is not a member of the group")
					continue
				}

				Mutex.Lock()
				err = database.SendMessage(user_id, id, message.GroupID, message.Content, "")
				if err != nil && user_id != id {
					fmt.Println("Error sending message:", err)
					continue
				}

				SendWsMessage(id, map[string]interface{}{"type": msgType, "message_id": time.Now(), "name": group.Name, "user_id": user.ID, "group_id": group.ID, "username": user.Username, "avatar": user.Avatar, "content": message.Content, "current_user": id, "created_at": "Just now"})
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
				continue
			}

			Mutex.Lock()
			err = database.SendMessage(user_id, message.UserID, message.GroupID, message.Content, "")
			if err != nil {
				fmt.Println("Error sending message:", err)
				continue
			}

			SendWsMessage(user_id, map[string]interface{}{"type": msgType, "message_id": time.Now(), "user_id": user.ID, "username": user.Username, "avatar": user.Avatar, "content": message.Content, "current_user": user_id, "created_at": "Just now"})
			SendWsMessage(message.UserID, map[string]interface{}{"type": msgType, "message_id": time.Now(), "user_id": user.ID, "username": user.Username, "avatar": user.Avatar, "content": message.Content, "current_user": message.UserID, "created_at": "Just now"})
			Mutex.Unlock()
		}
	}
}

func NotifyUsers(user_id int64, statu string) {
	connections, err := database.GetConnections(user_id)
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
				SendWsMessage(connections[i].ID, map[string]interface{}{"type": "new_connection", "user_id": user_id, "online": true})
			} else if statu == "offline" {
				SendWsMessage(connections[i].ID, map[string]interface{}{"type": "disconnection", "user_id": user_id, "online": false})
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
