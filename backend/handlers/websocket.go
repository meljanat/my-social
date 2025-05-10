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

	// connections, err := database.GetConnections(user.ID)
	// if err != nil {
	// 	fmt.Println(err)
	// 	response := map[string]string{"error": "Failed to retrieve connections"}
	// 	w.WriteHeader(http.StatusInternalServerError)
	// 	json.NewEncoder(w).Encode(response)
	// 	return
	// }

	// Mutex.Lock()
	// for _, connection := range connections {
	// 	if _, exist := Clients[connection.ID]; exist {
	// 		fmt.Println("User already connected:", connection.ID)
	// 		fmt.Println(Clients)
	// 		SendWsMessage(connection.ID, map[string]interface{}{"type": "users", "users": connections})
	// 	}
	// }
	// Mutex.Unlock()

	fmt.Println(Clients)
	fmt.Println("Connected to user:", user.Username)
	ListenForMessages(conn, user.ID)
	fmt.Println("Listening for messages...")
}

func ListenForMessages(conn *websocket.Conn, user_id int64) {
	defer func() {
		RemoveClient(conn, user_id)
		// delete(Clients, user_id)
		conn.Close()
	}()

	user, err := database.GetProfileInfo(user_id)
	if err != nil {
		fmt.Println(err)
		return
	}

	for {
		var message structs.Message
		err := conn.ReadJSON(&message)
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
			// } else if message.Type == "notification" {
			// 	if message.UserID != 0 {
			// 		SendWsMessage(message.UserID, map[string]interface{}{"type": "notification", "id": user.ID, "username": user.Username, "content": message.Content})
			// 	} else if message.GroupID != 0 {
			// 		SendWsMessage(message.GroupID, map[string]interface{}{"type": "notification", "id": user.ID, "username": user.Username, "content": message.Content})
			// 	}
		}
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
