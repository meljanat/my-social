package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	structs "social-network/data"
	"social-network/database"
)

func SessionHandler(w http.ResponseWriter, r *http.Request) {
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
		json.NewEncoder(w).Encode(false)
		http.SetCookie(w, &http.Cookie{
			Name:   "session_token",
			Value:  "guest",
			MaxAge: -1,
		})
		return
	}
	json.NewEncoder(w).Encode(true)
}

func CheckTheUserHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
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

	user_info, err := database.GetProfileInfo(user.ID)
	if err != nil {
		fmt.Println("Failed to retrieve user")
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	json.NewEncoder(w).Encode(user_info)
}

func GetUserFromSession(r *http.Request) (*structs.User, error) {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		fmt.Println("Failed to retrieve cookie")
		return nil, err
	}
	user, err := database.GetUserConnected(cookie.Value)
	if err != nil {
		fmt.Println("Failed to retrieve user")
		return nil, err
	}
	return &user, nil
}
