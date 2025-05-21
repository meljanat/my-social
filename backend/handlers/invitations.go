package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	structs "social-network/data"
	"social-network/database"
	"strconv"
)

func GetInvitationsGroups(w http.ResponseWriter, r *http.Request) {
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

	offset, err := strconv.ParseInt(r.URL.Query().Get("offset"), 10, 64)
	if err != nil {
		fmt.Println("Error parsing offset:", err)
		response := map[string]string{"error": "Invalid offset"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	invitations, err := database.GetInvitationsGroups(user.ID, offset)
	if err != nil {
		fmt.Println("Failed to retrieve invitations", err)
		response := map[string]string{"error": "Failed to retrieve invitations"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invitations)
}

func AcceptInvitationHandler(w http.ResponseWriter, r *http.Request) {
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

	var invitation structs.Invitation
	err = json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	_, err = database.GetUserById(invitation.User.ID)
	if err != nil {
		fmt.Println("Failed to retrieve sender", err)
		response := map[string]string{"error": "Invalid sender"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	} else if invitation.User.ID == user.ID {
		fmt.Println("Cannot accept your own invitation", err)
		response := map[string]string{"error": "Cannot accept your own invitation"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if invitation.Group.ID != 0 {
		_, err = database.GetGroupById(invitation.Group.ID)
		if err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Invalid group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	_, err = database.GetInvitationById(invitation.ID, invitation.Group.ID)
	if err != nil {
		fmt.Println("Failed to retrieve invitation", err)
		response := map[string]string{"error": "Invalid invitation"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if database.AcceptInvitation(invitation.ID, invitation.User.ID, user.ID, invitation.Group.ID) != nil {
		fmt.Println("Failed to accept invitation", err)
		response := map[string]string{"error": "Failed to accept invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
}

func DeclineInvitationHandler(w http.ResponseWriter, r *http.Request) {
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

	var invitation structs.Invitation
	err = json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	_, err = database.GetUserById(invitation.User.ID)
	if err != nil {
		fmt.Println("Failed to retrieve sender", err)
		response := map[string]string{"error": "Invalid sender"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	} else if invitation.User.ID == user.ID {
		fmt.Println("Cannot accept your own invitation")
		response := map[string]string{"error": "Cannot accept your own invitation"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if invitation.Group.ID != 0 {
		if _, err = database.GetGroupById(invitation.Group.ID); err != nil {
			fmt.Println("Failed to retrieve group", err)
			response := map[string]string{"error": "Invalid group"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	if _, err = database.GetInvitationById(invitation.ID, invitation.Group.ID); err != nil {
		fmt.Println("Failed to retrieve invitation", err)
		response := map[string]string{"error": "Invalid invitation"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := database.DeclineInvitation(invitation.ID, invitation.Group.ID); err != nil {
		fmt.Println("Failed to decline invitation", err)
		response := map[string]string{"error": "Failed to decline invitation"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
}
