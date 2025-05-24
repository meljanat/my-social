package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	database "social-network/database"
	handlers "social-network/handlers"

	"github.com/rs/cors"
)

func main() {
	//  CORS  localhost:3000
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})

	// Initialize the database
	if err := database.InitDB(); err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer database.DB.Close()

	fileServer := http.FileServer(http.Dir("./app"))
	http.Handle("/app/", http.StripPrefix("/app", fileServer))

	http.HandleFunc("/", handlers.SessionHandler)
	http.HandleFunc("/login", handlers.LoginHandler)
	http.HandleFunc("/register", handlers.RegisterHandler)
	http.HandleFunc("/logout", handlers.LogoutHandler)
	http.HandleFunc("/home", handlers.Home)
	http.HandleFunc("/user", handlers.CheckTheUserHandler)
	http.HandleFunc("/connections", handlers.GetConnectionsHandler)
	http.HandleFunc("/profile", handlers.ProfileHandler)
	http.HandleFunc("/profile_posts", handlers.ProfilePostsHandler)
	http.HandleFunc("/get_saved_posts", handlers.GetSavedPostsHandler)
	http.HandleFunc("/followers", handlers.FollowersHandler)
	http.HandleFunc("/following", handlers.FollowingHandler)
	http.HandleFunc("/new_post", handlers.CreatePostHandler)
	http.HandleFunc("/post", handlers.PostHandler)
	http.HandleFunc("/story", handlers.CreateStoryHandler)
	http.HandleFunc("/categories", handlers.GetTopCategories)
	http.HandleFunc("/posts_category", handlers.GetPostsByCategory)
	http.HandleFunc("/comment", handlers.CreateCommentHandler)
	http.HandleFunc("/like", handlers.LikeHandler)
	http.HandleFunc("/save", handlers.SaveHandler)
	http.HandleFunc("/follow", handlers.InvitationsHandler)
	http.HandleFunc("/suggested_users", handlers.SuggestedUsersHandler)
	http.HandleFunc("/new_group", handlers.CreateGrpoupHandler)
	http.HandleFunc("/group", handlers.GroupHandler)
	http.HandleFunc("/group_details", handlers.GroupDetailsHandler)
	http.HandleFunc("/new_post_group", handlers.CreatePostGroupHandler)
	http.HandleFunc("/new_event", handlers.CreateEventHandler)
	http.HandleFunc("/add_members", handlers.AddMembers)
	http.HandleFunc("/join", handlers.InvitationsHandler)
	http.HandleFunc("/groups", handlers.GetGroupsHandler)
	http.HandleFunc("/events", handlers.GetEventsHandler)
	http.HandleFunc("/join_to_event", handlers.JoinToEventHandler)
	http.HandleFunc("/accept_invitation", handlers.AcceptInvitationHandler)
	http.HandleFunc("/decline_invitation", handlers.DeclineInvitationHandler)
	http.HandleFunc("/invitations_groups", handlers.GetInvitationsGroups)
	http.HandleFunc("/notifications", handlers.NotificationsHandler)
	http.HandleFunc("/notifications/mark_all_as_read", handlers.MarkNotificationsAsReadHandler)
	http.HandleFunc("/chats", handlers.ChatHandler)
	http.HandleFunc("/chats_group", handlers.ChatGroupHandler)
	http.HandleFunc("/message", handlers.SendMessageHandler)
	http.HandleFunc("/ws", handlers.WebSocketHandler)
	http.HandleFunc("/search", handlers.SearchHandler)

	log.Println("Server started on :8404")
	fmt.Println("http://localhost:8404//")
	err := http.ListenAndServe(":8404", c.Handler(http.DefaultServeMux))
	if err != nil {
		log.Fatal(err)
	}

	var wg sync.WaitGroup
	wg.Add(1)
	time.Sleep(10 * time.Second)
}
