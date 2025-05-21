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
	Clients  = make(map[int64][]*websocket.Conn)
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

	// NotifyUsers(user.ID, "online")

	fmt.Println("Connected to user:", user.Username)
	ListenForMessages(conn, user.ID)
}

func ListenForMessages(conn *websocket.Conn, user_id int64) {
	defer func() {
		RemoveClient(conn, user_id)
		// NotifyUsers(user_id, "offline")
		// delete(Clients, user_id)
		conn.Close()
	}()

	user, err := database.GetProfileInfo(user_id)
	if err != nil {
		fmt.Println(err)
		return
	}
	notifs, err := database.GetNotifications(user_id, 0)
	if err != nil {
		fmt.Println("Error getting notifications:", err)
		return
	}

	for {
		newNotifs, err := database.GetNotifications(user_id, 0)
		if err != nil {
			fmt.Println("Error getting notifications:", err)
			return
		}
		if len(notifs) < len(newNotifs) {
			SendWsMessage(user_id, map[string]interface{}{"type": "notifications", "notifications": newNotifs})
			notifs = newNotifs
		}

		var message structs.Message
		err = conn.ReadJSON(&message)
		if err != nil {
			fmt.Println("Error reading JSON:", err)
			break
		}
		fmt.Println("Received message:", message)

		if message.Type == "message" {
			if message.UserID != 0 {
				if _, err := database.GetUserById(message.UserID); err != nil {
					fmt.Println("Error getting user by ID:", err)
					return
				}
				if err = database.SendMessage(user_id, message.UserID, 0, message.Content, ""); err != nil {
					fmt.Println("Error sending message:", err)
					return
				}

				SendWsMessage(message.UserID, map[string]interface{}{"type": "message", "username": user.Username, "content": message.Content})

			} else if message.GroupID != 0 {
				if _, err := database.GetGroupById(message.GroupID); err != nil {
					fmt.Println(err)
					return
				}
				if err = database.SendMessage(user.ID, 0, message.GroupID, message.Content, ""); err != nil {
					fmt.Println(err)
					return
				}

				SendWsMessage(message.GroupID, map[string]interface{}{"type": "message", "id": user.ID, "username": user.Username, "content": message.Content})
			}
			// } else if message.Type == "typing" {
			// 	if message.UserID != 0 {
			// 		SendWsMessage(message.UserID, map[string]interface{}{"type": "typing", "id": user.ID, "username": user.Username})
			// 	} else if message.GroupID != 0 {
			// SendWsMessage(message.GroupID, map[string]interface{}{"type": "typing", "id": user.ID, "username": user.Username})
			// 	}
			// }
		}
	}
}

func NotifyUsers(user_id int64, statu string) {
	connections, err := database.GetConnections(user_id, 0)
	if err != nil {
		fmt.Println(err)
		return
	}

	for _, connection := range connections {
		if connection.ID == user_id {
			continue
		}
		Mutex.Lock()
		if _, ok := Clients[connection.ID]; ok {
			if statu == "online" {
				SendWsMessage(connection.ID, map[string]interface{}{"type": "new_connection", "user_id": user_id})
			} else if statu == "offline" {
				SendWsMessage(connection.ID, map[string]interface{}{"type": "disconnection", "user_id": user_id})
			}
		}
		Mutex.Unlock()
	}
}

func SendWsMessage(user_id int64, message map[string]interface{}) {
	Mutex.Lock()
	defer Mutex.Unlock()
	fmt.Println("Sending message to user:", user_id)
	if clients, ok := Clients[user_id]; ok {
		fmt.Println(ok, user_id, Clients)
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
