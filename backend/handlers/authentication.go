package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode"

	structs "social-network/data"
	"social-network/database"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "users") {
		return
	}

	var login structs.User
	err := json.NewDecoder(r.Body).Decode(&login)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		response := map[string]string{"error": "Invalid request body"}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	errors, valid := ValidateInput("", "", "", login.Email, login.Password, "", "", "", time.Now())
	if !valid {
		fmt.Println("Validation error:", errors)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":  "Validation error",
			"fields": errors,
		})
		return
	}

	user, err := database.GetUserByEmail(login.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("Invalid email or password", err)
			response := map[string]string{"error": "Invalid email or password"}
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(response)
		} else {
			log.Printf("Database error: %v", err)
			response := map[string]string{"error": "Internal server error"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
		}
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(login.Password)); err != nil {
		fmt.Println("Password is incorrect")
		response := map[string]string{"error": "Password is incorrect"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	sessionToken, err := uuid.NewV4()
	if err != nil {
		log.Printf("Error generating session token: %v", err)
		response := map[string]string{"error": "Failed to generate session token"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := database.UpdateSession(login.Email, sessionToken); err != nil {
		log.Printf("Error updating session token: %v", err)
		response := map[string]string{"error": "Failed to update session token"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken.String(),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		Expires:  time.Now().Add(7 * 24 * time.Hour),
	})

	data := map[string]interface{}{
		"username":     user.Username,
		"sessionToken": sessionToken.String(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Method not allowed", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !LastTime(w, r, "users") {
		return
	}

	var register structs.User
	var err error
	register.Type = r.FormValue("type")
	register.Username = r.FormValue("username")
	register.FirstName = r.FormValue("firstName")
	register.LastName = r.FormValue("lastName")
	register.Bio = r.FormValue("aboutMe")
	register.Privacy = r.FormValue("privacy")

	if register.Type == "register" {
		register.Email = r.FormValue("email")
		register.Password = r.FormValue("password")
		register.ConfirmPass = r.FormValue("confirmedPassword")
		temp := r.FormValue("dateOfBirth")
		register.DateOfBirth, err = time.Parse("2006-01-02", temp)
		if err != nil {
			fmt.Println("Error parsing date of birth:", err)
			response := map[string]string{"error": "Error Parsing Date"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}

		errors, valid := ValidateInput(register.Username, register.FirstName, register.LastName, register.Email, register.Password, register.ConfirmPass, register.Privacy, register.Bio, register.DateOfBirth)
		if !valid {
			fmt.Println("Validation error:", errors)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"error":  "Validation error",
				"fields": errors,
			})
			return
		}

		var imagePath string
		image, header, err := r.FormFile("avatar")
		if err != nil && err.Error() != "http: no such file" {
			fmt.Println("Error retrieving image:", err)
			response := map[string]string{"error": "Failed to retrieve image"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		} else if image != nil {
			imagePath, err = SaveImage(image, header, "../frontend/public/avatars/")
			if err != nil {
				fmt.Println("Error saving image:", err)
				response := map[string]string{"error": err.Error()}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
			newpath := strings.Split(imagePath, "/public")
			imagePath = newpath[1]
		} else {
			imagePath = "/inconnu/avatar.png"
		}

		var coverPath string
		cover, header, err := r.FormFile("cover")
		if err != nil && err.Error() != "http: no such file" {
			fmt.Println("Error retrieving cover:", err)
			response := map[string]string{"error": "Failed to retrieve cover"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		} else if cover != nil {
			coverPath, err = SaveImage(cover, header, "../frontend/public/covers/")
			if err != nil {
				fmt.Println("Error saving cover:", err)
				response := map[string]string{"error": err.Error()}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
				return
			}
			newpath := strings.Split(coverPath, "/public")
			coverPath = newpath[1]
		} else {
			coverPath = "/inconnu/cover.jpg"
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(register.Password), bcrypt.DefaultCost)
		if err != nil {
			fmt.Println("Error hashing password:", err)
			response := map[string]string{"error": "Error hashing password"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		sessionToken, err := uuid.NewV4()
		if err != nil {
			log.Printf("Error generating session token: %v", err)
			response := map[string]string{"error": "Failed to generate session token"}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		if err := database.RegisterUser(register.Username, register.FirstName, register.LastName, register.Email, register.Bio, imagePath, coverPath, register.Privacy, hashedPassword, register.DateOfBirth, sessionToken); err != nil {
			if strings.Contains(err.Error(), "UNIQUE constraint failed: users.email") {
				fmt.Println("Email already exists")
				response := map[string]string{"error": "Email already exists"}
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(response)
			} else if strings.Contains(err.Error(), "UNIQUE constraint failed: users.username") {
				fmt.Println("Username already exists")
				response := map[string]string{"error": "Username already exists"}
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(response)
			} else {
				log.Printf("Error inserting user: %v", err)
				response := map[string]string{"error": "Registration failed"}
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
			}
			return
		}
	} else if register.Type == "update" {
		register.ID, err = strconv.ParseInt(r.FormValue("id"), 10, 64)
		if err != nil {
			fmt.Println("Error parsing ID:", err)
			response := map[string]string{"error": "Error Parsing ID"}
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(response)
			return
		}
		if err := database.UpdateProfile(register.ID, register.Username, register.FirstName, register.LastName, register.Bio, register.Privacy); err != nil {
			if strings.Contains(err.Error(), "UNIQUE constraint failed: users.email") {
				fmt.Println("Email already exists")
				response := map[string]string{"error": "Email already exists"}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(response)
			} else if strings.Contains(err.Error(), "UNIQUE constraint failed: users.username") {
				fmt.Println("Username already exists")
				response := map[string]string{"error": "Username already exists"}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(response)
			} else {
				log.Printf("Error updating user: %v", err)
				response := map[string]string{"error": "Profile update failed"}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(response)
			}
			return
		}

		if err := database.AcceptAllInvitations(register.ID); err != nil {
			log.Printf("Error accepting invitations: %v", err)
			response := map[string]string{"error": "Failed to accept invitations"}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(response)
			return
		}

		response := map[string]interface{}{
			"user":    register,
			"message": "Profile updated successfully!",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	} else {
		fmt.Println("Invalid request method")
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := map[string]string{"message": "Registration successful! Please log in."}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		fmt.Println("Invalid request method", r.Method)
		response := map[string]string{"error": "Method not allowed"}
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := GetUserFromSession(r)
	if err != nil || user == nil {
		fmt.Println("Error retrieving user:", err)
		response := map[string]string{"error": "Failed to retrieve user"}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := database.DeleteSession(user.ID); err != nil {
		log.Printf("Error deleting session: %v", err)
		response := map[string]string{"error": "Failed to delete session"}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "session_token",
		Value:  "guest",
		MaxAge: -1,
	})

	response := map[string]string{"message": "Logout successful!", "username": user.Username}
	http.Redirect(w, r, "/", http.StatusSeeOther)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func ValidateInput(username, firstName, lastName, email, password, confirm_pass, privacy, aboutMe string, date time.Time) (map[string]string, bool) {
	errors := make(map[string]string)
	const maxUsername = 10
	const maxEmail = 30
	const maxPassword = 20
	const maxNameLength = 20
	const maxAboutMe = 100

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if len(email) == 0 {
		errors["email"] = "Email cannot be empty"
	} else if len(email) > maxEmail {
		errors["email"] = fmt.Sprintf("Email cannot be longer than %d characters.", maxEmail)
	} else if !emailRegex.MatchString(email) {
		errors["email"] = "Invalid email format"
	}

	if password != confirm_pass && username != "" {
		errors["password"] = "Passwords do not match"
	} else if len(password) < 8 {
		errors["password"] = "Password must be at least 8 characters long"
	} else if len(password) > maxPassword {
		errors["password"] = fmt.Sprintf("Password cannot be longer than %d characters.", maxPassword)
	} else {
		hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
		hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
		hasDigit := regexp.MustCompile(`[0-9]`).MatchString(password)
		hasSpecial := regexp.MustCompile(`[\W_]`).MatchString(password)

		if !hasUpper {
			errors["password"] = "Password must include at least one uppercase letter"
		} else if !hasLower {
			errors["password"] = "Password must include at least one lowercase letter"
		} else if !hasDigit {
			errors["password"] = "Password must include at least one digit"
		} else if !hasSpecial {
			errors["password"] = "Password must include at least one special character"
		}
	}

	if username != "" {
		if len(firstName) == 0 {
			errors["first_name"] = "First name cannot be empty"
		} else if len(firstName) > maxNameLength {
			errors["first_name"] = fmt.Sprintf("First name cannot be longer than %d characters.", maxNameLength)
		} else if !isAlphabetic(firstName) {
			errors["first_name"] = "First name must contain only letters"
		}

		if len(lastName) == 0 {
			errors["last_name"] = "Last name cannot be empty"
		} else if len(lastName) > maxNameLength {
			errors["last_name"] = fmt.Sprintf("Last name cannot be longer than %d characters.", maxNameLength)
		} else if !isAlphabetic(lastName) {
			errors["last_name"] = "Last name must contain only letters"
		}

		if len(username) == 0 {
			errors["username"] = "Username cannot be empty"
		} else if len(username) > maxUsername {
			errors["username"] = fmt.Sprintf("Username cannot be longer than %d characters.", maxUsername)
		}

		if date.IsZero() {
			errors["date"] = "Date cannot be empty"
		} else {
			age := time.Since(date).Hours() / 24 / 365.3
			if age < 18 {
				errors["date"] = "You must be at least 18 years old"
			}

			year1900 := time.Date(1900, 1, 1, 0, 0, 0, 0, time.UTC)
			if date.Before(year1900) {
				errors["date"] = "Date cannot be before the year 1900"
			}
		}

		if len(aboutMe) > maxAboutMe {
			errors["about_me"] = fmt.Sprintf("About me cannot be longer than %d characters.", maxAboutMe)
		}

		if privacy != "public" && privacy != "private" {
			errors["privacy"] = "Privacy must be either 'public' or 'private'"
		}
	}

	if len(errors) > 0 {
		log.Println(errors)
		return errors, false
	}
	return nil, true
}

func isAlphabetic(s string) bool {
	for _, char := range s {
		if !unicode.IsLetter(char) && char != ' ' {
			return false
		}
	}
	return true
}
