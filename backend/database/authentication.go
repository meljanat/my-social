package database

import (
	structs "social-network/data"
	"time"

	"github.com/gofrs/uuid"
)

func RegisterUser(Username, FirstName, LastName, Email, AboutMe, Image, Cover, Privacy string, HashedPassword []byte, DateOfBirth time.Time, SessionToken uuid.UUID) error {
	_, err := DB.Exec("INSERT INTO users (username, firstname, lastname, email, avatar, cover, privacy, date_of_birth, password, session_token, about) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", Username, FirstName, LastName, Email, Image, Cover, Privacy, DateOfBirth, HashedPassword, SessionToken, AboutMe)
	return err
}

func GetUserByEmail(email string) (structs.User, error) {
	var user structs.User
	err := DB.QueryRow("SELECT username, avatar, cover, password FROM users WHERE email = ?", email).Scan(&user.Username, &user.Avatar, &user.Cover, &user.Password)
	return user, err
}

func CheckUser(user_id int64) (structs.User, error) {
	var user structs.User
	err := DB.QueryRow("SELECT username FROM users WHERE id = ?", user_id).Scan(&user.Username)
	return user, err
}

func UpdateSession(Email string, sessionToken uuid.UUID) error {
	_, err := DB.Exec("UPDATE users SET session_token = ? WHERE email = ?", sessionToken, Email)
	return err
}

func GetUserConnected(token string) (structs.User, error) {
	var user structs.User
	err := DB.QueryRow("SELECT id, username, avatar, session_token FROM users WHERE session_token = ?", token).Scan(&user.ID, &user.Username, &user.Avatar, &user.SessionToken)
	return user, err
}

func DeleteSession(user_id int64) error {
	_, err := DB.Exec("UPDATE users SET session_token = ? WHERE id = ?", "", user_id)
	return err
}

func GetUserById(user_id int64) (structs.User, error) {
	var user structs.User
	err := DB.QueryRow("SELECT id, username, avatar, privacy FROM users WHERE id = ?", user_id).Scan(&user.ID, &user.Username, &user.Avatar, &user.Privacy)
	return user, err
}
