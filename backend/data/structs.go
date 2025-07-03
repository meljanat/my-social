package structs

import (
	"time"

	"github.com/gofrs/uuid"
	"github.com/gorilla/websocket"
)

var Clients = make(map[int64][]*websocket.Conn)

type User struct {
	ID                  int64     `json:"user_id" sqlite:"user_id"`
	Username            string    `json:"username" sqlite:"username"`
	FirstName           string    `json:"first_name" sqlite:"first_name"`
	LastName            string    `json:"last_name" sqlite:"last_name"`
	Email               string    `json:"email" sqlite:"email"`
	DateOfBirth         time.Time `json:"date_of_birth" sqlite:"date_of_birth"`
	Password            string    `json:"password" sqlite:"password"`
	ConfirmPass         string    `json:"confirm_pass" sqlite:"confirm_pass"`
	CreatedAt           time.Time `json:"created_at" sqlite:"created_at"`
	Avatar              string    `json:"avatar" sqlite:"avatar"`
	Cover               string    `json:"cover" sqlite:"cover"`
	Bio                 string    `json:"bio" sqlite:"bio"`
	Role                string    `json:"role" sqlite:"role"`
	Privacy             string    `json:"privacy" sqlite:"privacy"`
	IsTyping            bool      `json:"is_typing" sqlite:"is_typing"`
	TotalMessages       int64     `json:"total_messages" sqlite:"total_messages"`
	TotalGroupsMessages int64     `json:"total_groups_messages" sqlite:"total_groups_messages"`
	TotalChatsMessages  int64     `json:"total_chats_messages" sqlite:"total_chats_messages"`
	TotalFollowers      int64     `json:"total_followers" sqlite:"total_followers"`
	TotalFollowing      int64     `json:"total_following" sqlite:"total_following"`
	TotalGroups         int64     `json:"total_groups" sqlite:"total_groups"`
	TotalEvents         int64     `json:"total_events" sqlite:"total_events"`
	TotalPosts          int64     `json:"total_posts" sqlite:"total_posts"`
	TotalLikes          int64     `json:"total_likes" sqlite:"total_likes"`
	TotalComments       int64     `json:"total_comments" sqlite:"total_comments"`
	TotalSaves          int64     `json:"total_saves" sqlite:"total_saves"`
	TotalNotifications  int64     `json:"total_notifications" sqlite:"total_notifications"`
	TotalInvitations    int64     `json:"total_invitations" sqlite:"total_invitations"`
	IsFollowing         bool      `json:"is_following" sqlite:"is_following"`
	IsFollower          bool      `json:"is_follower" sqlite:"is_follower"`
	IsPending           bool      `json:"is_pending" sqlite:"is_pending"`
	Online              bool      `json:"online" sqlite:"online"`
	SessionToken        uuid.UUID `json:"session_token" sqlite:"session_token"`
	Type                string    `json:"type" sqlite:"type"`
	Stories             []Stories `json:"stories" sqlite:"stories"`
}

type Post struct {
	ID                 int64     `json:"post_id" sqlite:"post_id"`
	Title              string    `json:"title" sqlite:"title"`
	UserID             int64     `json:"user_id" sqlite:"user_id"`
	Avatar             string    `json:"avatar" sqlite:"avatar"`
	Content            string    `json:"content" sqlite:"content"`
	CategoryID         int64     `json:"category_id" sqlite:"category_id"`
	GroupName          string    `json:"group_name" sqlite:"group_name"`
	GroupID            int64     `json:"group_id" sqlite:"group_id"`
	Category           string    `json:"category" sqlite:"category"`
	CategoryColor      string    `json:"category_color" sqlite:"category_color"`
	CategoryBackground string    `json:"category_background" sqlite:"category_background"`
	Image              string    `json:"image" sqlite:"image"`
	Author             string    `json:"author" sqlite:"author"`
	CreatedAt          string    `json:"created_at" sqlite:"created_at"`
	IsLiked            bool      `json:"is_liked" sqlite:"is_liked"`
	WhoLiked           []User    `json:"who_liked" sqlite:"who_liked"`
	TotalLikes         int64     `json:"total_likes" sqlite:"total_likes"`
	TotalComments      int64     `json:"total_comments" sqlite:"total_comments"`
	TotalSaves         int64     `json:"total_saves" sqlite:"total_saves"`
	TotalPosts         int64     `json:"total_posts" sqlite:"total_posts"`
	Comments           []Comment `json:"comments" sqlite:"comments"`
	Privacy            string    `json:"privacy" sqlite:"privacy"`
	IsSaved            bool      `json:"saved" sqlite:"saved"`
}

type Comment struct {
	ID        int64  `json:"comment_id" sqlite:"comment_id"`
	UserID    int64  `json:"user_id" sqlite:"user_id"`
	Avatar    string `json:"avatar" sqlite:"avatar"`
	Username  string `json:"username" sqlite:"username"`
	PostID    int64  `json:"post_id" sqlite:"post_id"`
	GroupID   int64  `json:"group_id" sqlite:"group_id"`
	Content   string `json:"content" sqlite:"content"`
	Image     string `json:"image" sqlite:"image"`
	CreatedAt string `json:"created_at" sqlite:"created_at"`
}

type Stories struct {
	UnseenStory bool    `json:"unseen_story" sqlite:"unseen_story"`
	User        User    `json:"user" sqlite:"user"`
	Stories     []Story `json:"stories" sqlite:"stories"`
}

type Story struct {
	ID        int64     `json:"story_id" sqlite:"story_id"`
	Image     string    `json:"image" sqlite:"image"`
	IsRead    bool      `json:"status" sqlite:"status"`
	CreatedAt time.Time `json:"created_at" sqlite:"created_at"`
}

type Category struct {
	ID         int64  `json:"category_id" sqlite:"category_id"`
	Name       string `json:"name" sqlite:"name"`
	Color      string `json:"color" sqlite:"color"`
	Background string `json:"background" sqlite:"background"`
	Count      int64  `json:"count" sqlite:"count"`
}

type Group struct {
	ID            int64  `json:"group_id" sqlite:"group_id"`
	Name          string `json:"name" sqlite:"name"`
	Image         string `json:"image" sqlite:"image"`
	Cover         string `json:"cover" sqlite:"cover"`
	Description   string `json:"description" sqlite:"description"`
	CreatedAt     string `json:"created_at" sqlite:"created_at"`
	Admin         string `json:"admin" sqlite:"admin"`
	AdminID       int64  `json:"admin_id" sqlite:"admin_id"`
	Privacy       string `json:"privacy" sqlite:"privacy"`
	Role          string `json:"role" sqlite:"role"`
	TotalMembers  int64  `json:"total_members" sqlite:"total_members"`
	TotalPosts    int64  `json:"total_posts" sqlite:"total_posts"`
	TotalMessages int64  `json:"total_messages" sqlite:"total_messages"`
}

type Message struct {
	ID                  int64  `json:"message_id" sqlite:"message_id"`
	CurrentUser         int64  `json:"current_user" sqlite:"current_user"`
	GroupID             int64  `json:"group_id" sqlite:"group_id"`
	UserID              int64  `json:"user_id" sqlite:"user_id"`
	Avatar              string `json:"avatar" sqlite:"avatar"`
	Username            string `json:"username" sqlite:"username"`
	FirstName           string `json:"first_name" sqlite:"first_name"`
	LastName            string `json:"last_name" sqlite:"last_name"`
	SenderUsername      string `json:"sender_username" sqlite:"sender_username"`
	SenderAvatar        string `json:"sender_avatar" sqlite:"sender_avatar"`
	Content             string `json:"content" sqlite:"content"`
	Image               string `json:"image" sqlite:"image"`
	CreatedAt           string `json:"created_at" sqlite:"created_at"`
	TotalMessages       int64  `json:"total_messages" sqlite:"total_messages"`
	TotalChatsMessages  int64  `json:"total_chat_messages" sqlite:"total_chat_messages"`
	TotalGroupsMessages int64  `json:"total_group_messages" sqlite:"total_group_messages"`
	Type                string `json:"type" sqlite:"type"`
}

type Notification struct {
	ID                  int64  `json:"notification_id" sqlite:"notification_id"`
	UserID              int64  `json:"user_id" sqlite:"user_id"`
	Username            string `json:"username" sqlite:"username"`
	Avatar              string `json:"avatar" sqlite:"avatar"`
	Content             string `json:"content" sqlite:"content"`
	PostID              int64  `json:"post_id" sqlite:"post_id"`
	GroupID             int64  `json:"group_id" sqlite:"group_id"`
	EventID             int64  `json:"event_id" sqlite:"event_id"`
	TypeNotification    string `json:"type_notification" sqlite:"type_notification"`
	NotificationMessage string `json:"notification_message" sqlite:"notification_message"`
	CreatedAt           string `json:"created_at" sqlite:"created_at"`
	Read                bool   `json:"read" sqlite:"read"`
}

type Invitation struct {
	ID        int64  `json:"invitation_id" sqlite:"invitation_id"`
	CreatedAt string `json:"created_at" sqlite:"created_at"`
	User      User   `json:"user" sqlite:"user"`
	Group     Group  `json:"group" sqlite:"group"`
}

type Event struct {
	ID           int64     `json:"event_id" sqlite:"event_id"`
	UserID       int64     `json:"user_id" sqlite:"user_id"`
	Username     string    `json:"username" sqlite:"username"`
	Avatar       string    `json:"avatar" sqlite:"avatar"`
	GroupID      int64     `json:"group_id" sqlite:"group_id"`
	GroupName    string    `json:"group_name" sqlite:"group_name"`
	Name         string    `json:"name" sqlite:"name"`
	Description  string    `json:"description" sqlite:"description"`
	Image        string    `json:"image" sqlite:"image"`
	Type         string    `json:"type" sqlite:"type"`
	Location     string    `json:"location" sqlite:"location"`
	StartDate    time.Time `json:"start_date" sqlite:"start_date"`
	EndDate      time.Time `json:"end_date" sqlite:"end_date"`
	CreatedAt    string    `json:"created_at" sqlite:"created_at"`
	Creator      string    `json:"creator" sqlite:"creator"`
	TotalMembers int64     `json:"total_members" sqlite:"total_members"`
}
